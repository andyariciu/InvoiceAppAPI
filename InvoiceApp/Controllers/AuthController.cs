using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;
using InvoiceApp.Data;
using InvoiceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace InvoiceApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;

        public AuthController(IHttpContextAccessor httpContextAccessor, ApplicationDbContext context, IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _db = context;
            _config = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _db.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest(new { message = "User already exists!" });

            var user = new User
            {
                Username = request.Username,
                Role = "User",
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Account has been successfully created!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.Username == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid credentials!" });
            }

            //delete tokens older than 7 days
            var threshold = DateTime.UtcNow.AddDays(-7);
            var oldTokens = _db.RefreshTokens
                .Where(t => t.UserId == user.Id && (t.IsRevoked || t.Expires < threshold));

            _db.RefreshTokens.RemoveRange(oldTokens);
            //extract the IP from user's connection
            var userIp = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

            //generate access token based on user and userip
            var accessToken = GenerateAccessToken(user, userIp);
            var refreshToken = GenerateRefreshTokenObject(user.Id);
            //save the refreshToken in the DB
            _db.RefreshTokens.Add(refreshToken);

            await _db.SaveChangesAsync();

            return Ok(new
            {
                token = accessToken,
                refreshToken = refreshToken.Token
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
        {
            var userIp = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
            var storedToken = await _db.RefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == request.RefreshToken);

            if (storedToken == null || storedToken.IsRevoked || storedToken.Expires < DateTime.UtcNow)
            {
                return Unauthorized(new { message = "Refresh token invalid or expired!" });
            }

            //delete old token and generate new one
            storedToken.IsRevoked = true;

            var newAccessToken = GenerateAccessToken(storedToken.User, userIp);
            var newRefreshToken = GenerateRefreshTokenObject(storedToken.UserId);

            _db.RefreshTokens.Add(newRefreshToken);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                token = newAccessToken,
                refreshToken = newRefreshToken.Token
            });
        }

        private string GenerateAccessToken(User user, string? ipAddress)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var remoteIpAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress?.ToString();

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("IpAddress", ipAddress ?? "0.0.0.0")
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(2), // Access token scurt (2 min)
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private RefreshToken GenerateRefreshTokenObject(int userId)
        {
            var remoteIpAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress?.ToString();
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);

            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                Expires = DateTime.UtcNow.AddDays(7),
                UserId = userId,
                IsRevoked = false,
                CreatedByIp = remoteIpAddress
            };
        }

        public class IpCheckMiddleware
        {
            private readonly RequestDelegate _next;

            public IpCheckMiddleware(RequestDelegate next)
            {
                _next = next;
            }

            public async Task Invoke(HttpContext context)
            {
                //check if the user is authenticated
                if (context.User.Identity?.IsAuthenticated == true)
                {
                    //extract the IP from the token
                    var tokenIp = context.User.FindFirst("IpAddress")?.Value;

                    //checking the IP from where the request comes
                    var currentIp = context.Connection.RemoteIpAddress?.ToString();

                    //compare them
                    if (tokenIp != null && tokenIp != currentIp)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new { message = "Security violation: IP mismatch!" });
                        return;
                    }
                }

                await _next(context);
            }
        }

        [Authorize]
        [HttpGet("secure")]
        public IActionResult SecureData() => Ok("Access granted!");

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult GetAdminStats() => Ok("Here is the secret data:");

        [Authorize(Roles = "Admin,Trainer")]
        [HttpGet("dashboard")]
        public IActionResult GetDashboard() => Ok("Hello. Dashboard access granted.");
    }

    // DTOs
    public record RegisterRequest(string Username, string Password, string Email);
    public record LoginRequest(string Username, string Password);
    public record RefreshRequest(string RefreshToken);
}