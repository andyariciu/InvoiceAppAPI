using System.ComponentModel.DataAnnotations;

namespace InvoiceApp.DTOs
{
    public class UpdateInvoiceDto
    {
        public string? ClientName { get; set; }
        [Range(0.01, 9999999)]
        public decimal? Total { get; set; }
    }
}
