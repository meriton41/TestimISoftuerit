namespace SharedClassLibrary.Models
{
  public class Category
  {
    public int Id { get; set; }
    public string? UserId { get; set; } // null për kategori globale
    public ApplicationUser? User { get; set; }
    public string Name { get; set; }
    public string Type { get; set; } // "Income" ose "Expense"
  }
}