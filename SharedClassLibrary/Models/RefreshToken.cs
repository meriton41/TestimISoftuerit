using Microsoft.AspNetCore.Identity;

namespace SharedClassLibrary.Models
{
  public class RefreshToken
  {
    public int Id { get; set; }
    public string UserId { get; set; }
    public ApplicationUser User { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime Created { get; set; } = DateTime.Now;
    public DateTime Expired { get; set; }
  }
}