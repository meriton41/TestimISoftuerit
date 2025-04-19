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
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using static SharedClassLibrary.DTOs.ServiceResponses;
using TestimISoftuerit.Services;
using System.Net;

namespace TestimISoftuerit.Repositories
{
    public class AccountRepository : IUserAccount
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly IConfiguration config;
public class AccountRepository : IUserAccount
{
    private readonly UserManager<ApplicationUser> userManager;
    private readonly RoleManager<IdentityRole> roleManager;
    private readonly IConfiguration config;
    private readonly EmailService emailService;

        public AccountRepository(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration config)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
            this.config = config;
        }
    public AccountRepository(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration config,
        EmailService emailService)
    {
        this.userManager = userManager;
        this.roleManager = roleManager;
        this.config = config;
        this.emailService = emailService;
    }

        public async Task<GeneralResponse> CreateAccount(UserDTO userDTO)
        {
            if (userDTO is null) return new GeneralResponse(false, "Model is empty");
    public async Task<GeneralResponse> CreateAccount(UserDTO userDTO)
    {
        if (userDTO is null)
            return new GeneralResponse(false, "Model is empty");

        var existingUser = await userManager.FindByEmailAsync(userDTO.Email);
        if (existingUser != null)
            return new GeneralResponse(false, "User already registered");

        // Generate and assign email confirmation token
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var encodedToken = WebUtility.UrlEncode(token);

        Console.WriteLine("🔐 Raw token stored in DB: " + token);
        Console.WriteLine("📧 Encoded token sent in email: " + encodedToken);

            var newUser = new ApplicationUser
            {
                Name = userDTO.Name,
                Email = userDTO.Email,
                UserName = userDTO.Name
            };
        var newUser = new ApplicationUser
        {
            Name = userDTO.Name,
            Email = userDTO.Email,
            UserName = userDTO.Email,
            IsEmailConfirmed = false,
            EmailConfirmationToken = token // Assign BEFORE CreateAsync
        };

            var user = await userManager.FindByEmailAsync(newUser.Email);
            if (user != null) return new GeneralResponse(false, "User already registered");

            var createUser = await userManager.CreateAsync(newUser, userDTO.Password);
            if (!createUser.Succeeded) return new GeneralResponse(false, "Error occurred");
        var createUserResult = await userManager.CreateAsync(newUser, userDTO.Password);
        if (!createUserResult.Succeeded)
        {
            var errors = string.Join(", ", createUserResult.Errors.Select(e => e.Description));
            return new GeneralResponse(false, $"Error occurred during user creation: {errors}");
        }

            // Assign Admin role to every new user
            var roleName = "Admin";
        // Send the verification email with encoded token
        await emailService.SendVerificationEmailAsync(newUser.Email, encodedToken);

        // Assign role
        var isFirstUser = (await userManager.Users.CountAsync()) == 1;
        var roleName = isFirstUser ? "Admin" : "User";

            var checkRole = await roleManager.RoleExistsAsync(roleName);
            if (!checkRole)
            {
                var createRole = await roleManager.CreateAsync(new IdentityRole(roleName));
                if (!createRole.Succeeded) return new GeneralResponse(false, "Error occurred");
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            var roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
            if (!roleResult.Succeeded)
            {
                var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                return new GeneralResponse(false, $"Error creating role: {errors}");
            }

            var assignRole = await userManager.AddToRoleAsync(newUser, roleName);
            if (!assignRole.Succeeded) return new GeneralResponse(false, "Error occurred");

            return new GeneralResponse(true, "Account Created");
        }
        return new GeneralResponse(true, "Account Created. Please verify your email.");
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
        if (string.IsNullOrEmpty(getUser.Email) || string.IsNullOrEmpty(getUser.UserName))
            return new LoginResponse(false, null, "User data is incomplete");

        if (!getUser.IsEmailConfirmed)
            return new LoginResponse(false, null, "Please verify your email before logging in.");

        bool checkUserPasswords = await userManager.CheckPasswordAsync(getUser, loginDTO.Password);
        if (!checkUserPasswords)
            return new LoginResponse(false, null, "Invalid email/password");

            var getUserRole = await userManager.GetRolesAsync(getUser);
            var userSession = new UserSession(getUser.Id, getUser.Name, getUser.Email, getUserRole.First());
            string token = GenerateToken(userSession);

            return new LoginResponse(true, token, "Login completed");
        }
        var getUserRole = await userManager.GetRolesAsync(getUser);
        if (getUserRole == null || !getUserRole.Any())
            return new LoginResponse(false, null, "User has no assigned roles");

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
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            userDetails.Add(new UserDetailsDTO
            {
                Id = user.Id,
                Name = user.Name ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Role = roles.FirstOrDefault() ?? string.Empty
            });
        }

            return userDetails;
        }

        public async Task<GeneralResponse> UpdateUser(string id, UserDetailsDTO userDetailsDTO)
        {
            if (userDetailsDTO == null)
                return new GeneralResponse(false, "Model is empty");
        return userDetails;
    }

    public async Task<GeneralResponse> UpdateUser(string userId, UserDetailsDTO userDetailsDTO)
    {
        if (userDetailsDTO == null)
            return new GeneralResponse(false, "Model is empty");

            var user = await userManager.FindByIdAsync(id);
            if (user == null)
                return new GeneralResponse(false, "User not found");
        var user = await userManager.FindByIdAsync(userId);
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
        user.Name = userDetailsDTO.Name;
        user.Email = userDetailsDTO.Email;
        user.UserName = userDetailsDTO.Email;

        public async Task<ApplicationUser?> GetUserByRefreshToken(string refreshToken)
        {
            // In a real application, you would store refresh tokens in the database
            // and validate them against the stored tokens. For this example,
            // we'll just return the first user we find.
            return await userManager.Users.FirstOrDefaultAsync();
            var errors = string.Join(", ", updateUserResult.Errors.Select(e => e.Description));
            return new GeneralResponse(false, $"Error updating user: {errors}");
        }

        public async Task<LoginResponse> RefreshToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(config["Jwt:Key"]!);

                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = config["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = config["Jwt:Audience"],
                    ValidateLifetime = false // We want to validate the token even if it's expired
                };

                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var validatedToken);
                var jwtToken = validatedToken as JwtSecurityToken;

                if (jwtToken == null || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return new LoginResponse(false, null, "Invalid token");
                }
        if (!string.IsNullOrEmpty(userDetailsDTO.Role))
        {
            var currentRoles = await userManager.GetRolesAsync(user);
            var removeFromRolesResult = await userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeFromRolesResult.Succeeded)
            {
                var errors = string.Join(", ", removeFromRolesResult.Errors.Select(e => e.Description));
                return new GeneralResponse(false, $"Error removing user from roles: {errors}");
            }

                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return new LoginResponse(false, null, "Invalid token");
                }

                var user = await userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new LoginResponse(false, null, "User not found");
                }
            var addToRoleResult = await userManager.AddToRoleAsync(user, userDetailsDTO.Role);
            if (!addToRoleResult.Succeeded)
            {
                var errors = string.Join(", ", addToRoleResult.Errors.Select(e => e.Description));
                return new GeneralResponse(false, $"Error adding user to role: {errors}");
            }
        }

                var userRole = await userManager.GetRolesAsync(user);
                var userSession = new UserSession(user.Id, user.Name, user.Email, userRole.First());
                string newToken = GenerateToken(userSession);

                return new LoginResponse(true, newToken, "Token refreshed");
            }
            catch (Exception ex)
            {
                return new LoginResponse(false, null, $"Error refreshing token: {ex.Message}");
            }
        }
        return new GeneralResponse(true, "User updated successfully");
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
}
