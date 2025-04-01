using Microsoft.AspNetCore.Identity;

namespace TestimISoftuerit.Data
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
    }
}
