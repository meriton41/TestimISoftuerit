using Microsoft.AspNetCore.Identity;

namespace SharedClassLibrary.Models
{
  public class ApplicationUser : IdentityUser
  {
    public ApplicationUser()
    {
      RefreshTokens = new List<RefreshToken>();
    }

    public string Name { get; set; } = string.Empty;
    public ICollection<RefreshToken> RefreshTokens { get; set; }
    public bool IsEmailConfirmed { get; set; } = false;
    public string? EmailConfirmationToken { get; set; }
    public DateTime? EmailConfirmationTokenCreatedAt { get; set; }
  }
}