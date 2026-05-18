using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace InvoiceApp.Models
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }
        public string Token { get; set; }
        public DateTime Expires { get; set; }
        public bool IsRevoked { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;

        //link to user
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        //used for checking token availability
        public bool IsExpired => DateTime.UtcNow >= Expires;
        public bool IsActive => !IsRevoked && !IsExpired;
        public string CreatedByIp { get; set; }
    }
}
