using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedClassLibrary.Contracts;
using SharedClassLibrary.DTOs;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;
using TestimISoftuerit.Data;
using System.Net; // ✅ Add this for ApplicationDbContext

namespace TestimISoftuerit.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IUserAccount userAccount;
        private readonly ApplicationDbContext _context; // ✅ Add this

        // ✅ Inject ApplicationDbContext
        public AccountController(IUserAccount userAccount, ApplicationDbContext context)
        {
            this.userAccount = userAccount;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserDTO userDTO)
        {
            var response = await userAccount.CreateAccount(userDTO);
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            var response = await userAccount.LoginAccount(loginDTO);
            var refreshToken = GenerateRefreshToken();
            SetRefreshToken(refreshToken);
            return Ok(response);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await userAccount.GetUsers();
            return Ok(users);
        }

        [HttpPatch("update/{id}")]
        public async Task<IActionResult> UpdateUser(string id, UserDetailsDTO userDetailsDTO)
        {
            var response = await userAccount.UpdateUser(id, userDetailsDTO);
            if (!response.Flag)
                return BadRequest(response);

            return Ok(response);
        }

        private RefreshToken GenerateRefreshToken()
        {
            var refreshToken = new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                Expired = DateTime.Now.AddDays(7),
                Created = DateTime.Now
            };

            return refreshToken;
        }

        private void SetRefreshToken(RefreshToken newRefreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = newRefreshToken.Expired
            };
            Response.Cookies.Append("refreshToken", newRefreshToken.Token, cookieOptions);
        }
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                Console.WriteLine("❌ Token is missing from the request.");
                return BadRequest(new { message = "Token is missing" });
            }

            Console.WriteLine("👉 Received token: " + token);

            var decodedToken = WebUtility.UrlDecode(token); // just once is enough

            Console.WriteLine("👉 Decoded token: " + decodedToken);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailConfirmationToken == decodedToken);

            if (user == null)
            {
                Console.WriteLine("❌ No user found with matching token.");
                return NotFound(new { message = "Invalid or expired token" });
            }

            Console.WriteLine("✅ Found user with matching token: " + user.Email);
            Console.WriteLine("📬 Token from DB: " + user.EmailConfirmationToken);

            if (user.IsEmailConfirmed)
            {
                Console.WriteLine("ℹ️ Email already verified.");
                return Ok(new { message = "Email already verified" });
            }

            user.IsEmailConfirmed = true;
            user.EmailConfirmationToken = null;

            await _context.SaveChangesAsync();

            Console.WriteLine("✅ Email verified successfully for user: " + user.Email);

            return Ok(new { message = "Email verified successfully" });
        }



    }
}
