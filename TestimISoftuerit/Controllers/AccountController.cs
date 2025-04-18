﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

namespace TestimISoftuerit.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IUserAccount userAccount;
        private readonly UserManager<SharedClassLibrary.Models.ApplicationUser> userManager;
        private readonly IConfiguration config;

        public AccountController(IUserAccount userAccount, UserManager<SharedClassLibrary.Models.ApplicationUser> userManager, IConfiguration config)
        {
            this.userAccount = userAccount;
            this.userManager = userManager;
            this.config = config;
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
        public async Task<IActionResult> UpdateUser(string id, UserDetailsDTO userDetailsDTO)
        {
            var response = await userAccount.UpdateUser(id, userDetailsDTO);
            if (!response.Flag)
                return BadRequest(response);

            return Ok(response);
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



    }
}
