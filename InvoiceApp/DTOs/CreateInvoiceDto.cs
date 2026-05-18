using System.ComponentModel.DataAnnotations;

namespace InvoiceApp.DTOs
{
    public class CreateInvoiceDto
    {
        [Required]
        public string ClientName { get; set; }
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be bigger than 0")]
        public decimal Total { get; set; }
    }
}
