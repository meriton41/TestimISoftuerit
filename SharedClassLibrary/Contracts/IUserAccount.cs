using SharedClassLibrary.DTOs;
using Microsoft.AspNetCore.Identity;
using SharedClassLibrary.Models;
using Microsoft.AspNetCore.Http;

namespace SharedClassLibrary.Contracts
{
    public interface IUserAccount
    {
        Task<ServiceResponses.GeneralResponse> CreateAccount(UserDTO userDTO);
        Task<ServiceResponses.LoginResponse> LoginAccount(LoginDTO loginDTO);
        Task<List<UserDetailsDTO>> GetUsers();
        Task<ServiceResponses.GeneralResponse> UpdateUser(string id, UserDetailsDTO userDetailsDTO);
        Task<ApplicationUser?> GetUserByRefreshToken(string refreshToken);
        Task<ServiceResponses.LoginResponse> RefreshToken(string token);
    }

    public class UserAccount : IUserAccount
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserAccount(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private void SetRefreshToken(RefreshToken newRefreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = newRefreshToken.Expired,
                Path = "/"
            };

            _httpContextAccessor.HttpContext.Response.Cookies.Append("refreshToken", newRefreshToken.Token, cookieOptions);
        }

        public Task<ServiceResponses.GeneralResponse> CreateAccount(UserDTO userDTO)
        {
            // Implementation of CreateAccount method
            throw new NotImplementedException();
        }

        public Task<ServiceResponses.LoginResponse> LoginAccount(LoginDTO loginDTO)
        {
            // Implementation of LoginAccount method
            throw new NotImplementedException();
        }

        public Task<List<UserDetailsDTO>> GetUsers()
        {
            // Implementation of GetUsers method
            throw new NotImplementedException();
        }

        public Task<ServiceResponses.GeneralResponse> UpdateUser(string id, UserDetailsDTO userDetailsDTO)
        {
            // Implementation of UpdateUser method
            throw new NotImplementedException();
        }

        public Task<ApplicationUser?> GetUserByRefreshToken(string refreshToken)
        {
            // Implementation of GetUserByRefreshToken method
            throw new NotImplementedException();
        }

        public Task<ServiceResponses.LoginResponse> RefreshToken(string token)
        {
            // Implementation of RefreshToken method
            throw new NotImplementedException();
        }
    }
}