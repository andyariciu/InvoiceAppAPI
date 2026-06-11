namespace InvoiceApp.Models
{
    public class ImportError
    {
        public int Row { get; set; }
        public string Column { get; set; }
        public string Error { get; set; }
    }
}
