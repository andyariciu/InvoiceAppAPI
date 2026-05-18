using InvoiceApp.Data;
using InvoiceApp.DTOs;
using InvoiceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InvoiceApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : Controller
    {
        private readonly ApplicationDbContext _db;

        public InvoicesController(ApplicationDbContext context)
        {
            _db = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceDto dto)
        {
            //Get user ID from Token and convert it to INT
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = int.Parse(userIdString);

            // Check next invoice number
            // If there won't be any, we start from no. 1
            int nextNumber = 1;
            var lastInvoice = await _db.Invoices
                .OrderByDescending(x => x.Number)
                .FirstOrDefaultAsync();

            if (lastInvoice != null)
            {
                if (int.TryParse(lastInvoice.Number, out int lastNum))
                {
                    nextNumber = lastNum + 1;
                }
            }

            // map the data
            var invoice = new Invoice
            {
                Number = nextNumber.ToString(),
                ClientName = dto.ClientName,
                Total = dto.Total,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Invoices.Add(invoice);
            await _db.SaveChangesAsync();

            return Ok(invoice);
        }

        [HttpGet]
        public async Task<IActionResult> GetInvoices([FromQuery] string? search, [FromQuery] decimal? minTotal)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            //Define query
            var query = _db.Invoices.AsNoTracking().AsQueryable();

            //check user's role
            if (userRole != "Admin")
            {
                query = query.Where(x => x.UserId == userId);
            }

            //if user wrote anything in the search bar
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x => x.ClientName.Contains(search));
            }

            //if the user has set a min
            if (minTotal.HasValue)
            {
                query = query.Where(x => x.Total >= minTotal.Value);
            }

            //get the results from query
            var results = await query.ToListAsync();

            return Ok(results);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoiceById(int id)
        {
            //find userID and Role from the token
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            //check the invoice for the above values
            var invoice = await _db.Invoices
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && (userRole == "Admin" || x.UserId == userId));

            //check if the invoice was found
            if (invoice == null)
            {
                return NotFound($"Invoice with ID: {id} has not been found.");
            }

            return Ok(invoice);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            //Identify the user
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();
            var userId = int.Parse(userIdString);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            //check if the invoice has the same userID or if the user is Admin
            var invoice = await _db.Invoices
                .FirstOrDefaultAsync(x => x.Id == id && (userRole == "Admin" || x.UserId == userId));

            //if the invoice isn't found or the user doesn't have the rights, return N/A
            if (invoice == null)
            {
                return NotFound(); // Rămânem discreți
            }

            //delete the invoice if it gets to this point
            _db.Invoices.Remove(invoice);
            await _db.SaveChangesAsync();

            return NoContent(); //standard response for delete
        }

        [HttpPut("{id}")] //standard update
        public async Task<IActionResult> UpdateInvoice(int id, [FromBody] UpdateInvoiceDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();

            var userId = int.Parse(userIdString);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            //checking invoice and user's role
            var invoice = await _db.Invoices
                .FirstOrDefaultAsync(x => x.Id == id && (userRole == "Admin" || x.UserId == userId));

            bool hasChanged = false;

            if (invoice == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(dto.ClientName) && dto.ClientName != invoice.ClientName)
            {
                invoice.ClientName = dto.ClientName;
                hasChanged = true;
            }

            if (dto.Total.HasValue && dto.Total != invoice.Total)
            {
                invoice.Total = dto.Total.Value;
                hasChanged = true;
            }

            if (hasChanged)
            {
                await _db.SaveChangesAsync();
                return Ok(invoice);
            }

            return BadRequest("No updates were made, because the data is identical.");         
        }
    }
}
