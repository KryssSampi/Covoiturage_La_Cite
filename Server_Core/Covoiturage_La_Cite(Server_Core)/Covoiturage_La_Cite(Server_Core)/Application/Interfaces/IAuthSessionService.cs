using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IAuthSessionService
{
    Task<InitSessionResponse> InitSessionAsync(string ipAddress, string userAgent, CancellationToken ct = default);
    Task<VerifyEmailResponse> VerifyEmailAsync(string idKeyHash, string email, string ipAddress, string userAgent, CancellationToken ct = default);
    Task<VerifyCodeResponse> VerifyCodeAsync(string idKeyHash, string code, string ipAddress, string userAgent, CancellationToken ct = default, bool rememberOtp = false);
    Task<RenewCodeResponse> RenewCodeAsync(string idKeyHash, string ipAddress, string userAgent, CancellationToken ct = default);
    Task<OtpStatusResponse> GetOtpStatusAsync(string idKeyHash, CancellationToken ct = default);
    Task<LoginResultDto> PasswordLoginAsync(string idKeyHash, string password, string ipAddress, string userAgent, string clientType, CancellationToken ct = default);
    Task<LoginResultDto> FinalizeLoginAsync(string idKeyHash, string ipAddress, string userAgent, string clientType, CancellationToken ct = default);
    Task<LoginResultDto> RegisterAsync(string idKeyHash, string firstName, string lastName, string password, string ipAddress, string userAgent, string clientType, CancellationToken ct = default);
    Task<BlockedResponse?> GetBlockedStatusAsync(string idKeyHash, CancellationToken ct = default);
    Task<RefreshResultDto> RefreshAsync(string refreshToken, string ipAddress, string userAgent, string clientType, CancellationToken ct = default);
    Task LogoutAsync(string refreshToken, CancellationToken ct = default);
}
