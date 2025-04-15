using TestimISoftuerit.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SharedClassLibrary.Contracts;
using SharedClassLibrary.DTOs;
using SharedClassLibrary.Models;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using static SharedClassLibrary.DTOs.ServiceResponses;

namespace TestimISoftuerit.Repositories
{
    public class AccountRepository : IUserAccount
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly IConfiguration config;

        public AccountRepository(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration config)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
            this.config = config;
        }

        public async Task<GeneralResponse> CreateAccount(UserDTO userDTO)
        {
            if (userDTO is null) return new GeneralResponse(false, "Model is empty");

            var newUser = new ApplicationUser
            {
                Name = userDTO.Name,
                Email = userDTO.Email,
                UserName = userDTO.Email
            };

            var user = await userManager.FindByEmailAsync(newUser.Email);
            if (user != null) return new GeneralResponse(false, "User already registered");

            var createUser = await userManager.CreateAsync(newUser, userDTO.Password);
            if (!createUser.Succeeded) return new GeneralResponse(false, "Error occurred");

            // Check if this is the first user (assign admin role) or a regular user
            var checkUser = await userManager.Users.FirstOrDefaultAsync();
            var roleName = checkUser?.Id == newUser.Id ? "Admin" : "User";

            var checkRole = await roleManager.RoleExistsAsync(roleName);
            if (!checkRole)
            {
                var createRole = await roleManager.CreateAsync(new IdentityRole(roleName));
                if (!createRole.Succeeded) return new GeneralResponse(false, "Error occurred");
            }

            var assignRole = await userManager.AddToRoleAsync(newUser, roleName);
            if (!assignRole.Succeeded) return new GeneralResponse(false, "Error occurred");

            return new GeneralResponse(true, "Account Created");
        }

        public async Task<LoginResponse> LoginAccount(LoginDTO loginDTO)
        {
            if (loginDTO == null)
                return new LoginResponse(false, null, "Login container is empty");

            var getUser = await userManager.FindByEmailAsync(loginDTO.Email);
            if (getUser == null)
                return new LoginResponse(false, null, "User not found");

            bool checkUserPasswords = await userManager.CheckPasswordAsync(getUser, loginDTO.Password);
            if (!checkUserPasswords)
                return new LoginResponse(false, null, "Invalid email/password");

            var getUserRole = await userManager.GetRolesAsync(getUser);
            var userSession = new UserSession(getUser.Id, getUser.UserName, getUser.Email, getUserRole.First());
            string token = GenerateToken(userSession);

            return new LoginResponse(true, token, "Login completed");
        }

        public async Task<List<UserDetailsDTO>> GetUsers()
        {
            var users = await userManager.Users.ToListAsync();
            var userDetails = new List<UserDetailsDTO>();

            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                userDetails.Add(new UserDetailsDTO
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = roles.FirstOrDefault() ?? string.Empty
                });
            }

            return userDetails;
        }

        public async Task<GeneralResponse> UpdateUser(string id, UserDetailsDTO userDetailsDTO)
        {
            if (userDetailsDTO == null)
                return new GeneralResponse(false, "Model is empty");

            var user = await userManager.FindByIdAsync(id);
            if (user == null)
                return new GeneralResponse(false, "User not found");

            user.Name = userDetailsDTO.Name;
            user.Email = userDetailsDTO.Email;
            user.UserName = userDetailsDTO.Email;

            var updateUser = await userManager.UpdateAsync(user);
            if (!updateUser.Succeeded)
                return new GeneralResponse(false, "Error updating user");

            if (!string.IsNullOrEmpty(userDetailsDTO.Role))
            {
                var currentRoles = await userManager.GetRolesAsync(user);
                await userManager.RemoveFromRolesAsync(user, currentRoles);
                await userManager.AddToRoleAsync(user, userDetailsDTO.Role);
            }

            return new GeneralResponse(true, "User updated successfully");
        }

        public async Task<ApplicationUser?> GetUserByRefreshToken(string refreshToken)
        {
            // In a real application, you would store refresh tokens in the database
            // and validate them against the stored tokens. For this example,
            // we'll just return the first user we find.
            return await userManager.Users.FirstOrDefaultAsync();
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
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: credentials
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}