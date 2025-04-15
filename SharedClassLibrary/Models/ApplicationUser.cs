using Microsoft.AspNetCore.Identity;

namespace SharedClassLibrary.Models
{
  public class ApplicationUser : IdentityUser
  {
    public string Name { get; set; } = string.Empty;
  }
}