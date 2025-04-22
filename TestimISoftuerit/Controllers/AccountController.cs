using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedClassLibrary.Contracts;
using SharedClassLibrary.DTOs;
using SharedClassLibrary.Models;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;
using TestimISoftuerit;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using System.Text;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using TestimISoftuerit.Data;
using System.Net;
using SharedClassLibrary.Models;
using System.ComponentModel.DataAnnotations;

namespace TestimISoftuerit.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IUserAccount userAccount;
        private readonly UserManager<SharedClassLibrary.Models.ApplicationUser> userManager;
        private readonly IConfiguration config;
        private readonly ApplicationDbContext _context;

        public AccountController(
            IUserAccount userAccount,
            UserManager<SharedClassLibrary.Models.ApplicationUser> userManager,
            IConfiguration config,
            ApplicationDbContext context)
        {
            this.userAccount = userAccount;
            this.userManager = userManager;
            this.config = config;
            this._context = context;
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
            if (!response.Flag)
                return BadRequest(response);

            var refreshToken = GenerateRefreshToken();
            SetRefreshToken(refreshToken);

            // Set the JWT token in a cookie
            Response.Cookies.Append("token", response.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(1) // Match the token expiration
            });

            return Ok(new
            {
                flag = response.Flag,
                token = response.Token,
                message = response.Message,
                refreshToken = refreshToken.Token
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await userAccount.GetUsers();
            return Ok(users);
        }

        [HttpPatch("update/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserDetailsDTO userDetailsDTO)
        {
            try
            {
                // Get the current user's ID from the authentication token
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || userId != id)
                {
                    return Unauthorized();
                }

                var user = await userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound();
                }

                // Update name
                if (!string.IsNullOrEmpty(userDetailsDTO.Name))
                {
                    user.Name = userDetailsDTO.Name;
                }

                var updateResult = await userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    return BadRequest(new { message = "Failed to update profile", errors = updateResult.Errors });
                }

                // Get updated user's roles
                var roles = await userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "User";

                return Ok(new UserDTO
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the profile", error = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDTO refreshTokenDTO)
        {
            try
            {
                if (string.IsNullOrEmpty(refreshTokenDTO.Token))
                    return BadRequest(new { message = "Token is required" });

                var response = await userAccount.RefreshToken(refreshTokenDTO.Token);
                if (!response.Flag)
                    return Unauthorized(new { message = response.Message });

                // Generate a new refresh token
                var newRefreshToken = GenerateRefreshToken();
                SetRefreshToken(newRefreshToken);

                // Set the new JWT token in a cookie
                Response.Cookies.Append("token", response.Token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddHours(1) // Match the token expiration
                });

                return Ok(new
                {
                    token = response.Token,
                    refreshToken = newRefreshToken.Token
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while refreshing the token", error = ex.Message });
            }
        }

        private string GenerateToken(UserSession user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var userClaims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };
            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: userClaims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private RefreshToken GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);

            return new RefreshToken
            {
                Token = Convert.ToHexString(randomNumber),  // Use hex string instead of Base64
                Expired = DateTime.Now.AddDays(7),
                Created = DateTime.Now
            };
        }

        private void SetRefreshToken(RefreshToken newRefreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = newRefreshToken.Expired
            };
            Response.Cookies.Append("refreshToken", newRefreshToken.Token, cookieOptions);
        }
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                {
                    Console.WriteLine("❌ Token is missing from the request.");
                    return BadRequest(new { message = "Token is missing" });
                }

                Console.WriteLine("👉 Received token: " + token);

                // First URL-decode the token from the query parameter
                var decodedToken = WebUtility.UrlDecode(token);
                // Replace spaces with + since they might have been converted during URL encoding
                decodedToken = decodedToken.Replace(" ", "+");
                Console.WriteLine("👉 URL-decoded token: " + decodedToken);

                // Find user with matching token
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.EmailConfirmationToken == decodedToken);

                if (user == null)
                {
                    Console.WriteLine("❌ No user found with matching token.");
                    return BadRequest(new { message = "Invalid token" });
                }

                // Check if token is expired (24 hours validity)
                var tokenCreationTime = user.EmailConfirmationTokenCreatedAt;
                if (tokenCreationTime.HasValue && DateTime.UtcNow > tokenCreationTime.Value.AddHours(24))
                {
                    Console.WriteLine("❌ Token has expired.");
                    return BadRequest(new { message = "Token has expired. Please request a new verification email." });
                }

                if (user.IsEmailConfirmed)
                {
                    Console.WriteLine("ℹ️ Email already verified.");
                    return Ok(new { message = "Email already verified" });
                }

                user.IsEmailConfirmed = true;
                user.EmailConfirmationToken = null;
                user.EmailConfirmationTokenCreatedAt = null;

                await _context.SaveChangesAsync();

                Console.WriteLine("✅ Email verified successfully for user: " + user.Email);
                return Ok(new { message = "Email verified successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error verifying email: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while verifying your email" });
            }
        }

    }
}

