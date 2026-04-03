//namespace covoiturageAPI.Services
//{
//    public interface IAuthService
//    {
//    }
//}
using covoiturageAPI.DTOs;

namespace covoiturageAPI.Services
{
    /// <summary>
    /// Interface définissant les méthodes d'authentification
    /// </summary>
    public interface IAuthService
    {
        Task<bool> RegisterAsync(RegisterDto dto);
        Task<AuthResult?> LoginAsync(LoginDto dto);
        Task<AuthResult?> RefreshAsync(string refreshToken);
        Task LogoutAllAsync(int userId);
        Task<bool> ConfirmEmailAsync(string token);
        Task<bool> ResendConfirmationAsync(string email);
        Task<ProfileDto?> GetProfileAsync(int userId);
        Task<bool> UpdateProfileAsync(int userId, ProfileDto dto);

    }
}

