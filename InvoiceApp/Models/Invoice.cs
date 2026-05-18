using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InvoiceApp.Models
{
    public class Invoice
    {
        public int Id { get; set; }

        [Required]
        public string Number { get; set; }

        [StringLength(100)]
        public string ClientName { get; set; }

        [Precision(18, 2)]
        public decimal Total { get; set; }

        public int UserId { get; set; }

        [JsonIgnore]
        public User User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
