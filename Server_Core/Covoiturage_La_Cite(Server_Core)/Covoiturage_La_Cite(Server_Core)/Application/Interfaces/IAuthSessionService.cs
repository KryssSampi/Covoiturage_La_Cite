using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IAuthSessionService
{
    /// <summary>Crée une AuthSession vide (étape 0). Retourne publicId + idKey en clair.</summary>
    Task<InitSessionResponse> InitSessionAsync(string ipAddress, string userAgent, CancellationToken ct = default);

    /// <summary>Vérifie si l'email existe en BDD. Pour un nouvel utilisateur, envoie un OTP.</summary>
    Task<VerifyEmailResponse> VerifyEmailAsync(string idKeyHash, string email, string ipAddress, string userAgent, CancellationToken ct = default);

    /// <summary>Vérifie le code OTP saisi.</summary>
    Task<VerifyCodeResponse> VerifyCodeAsync(string idKeyHash, string code, string ipAddress, string userAgent, CancellationToken ct = default);

    /// <summary>Renouvelle le code OTP (max 3 renouvellements).</summary>
    Task<RenewCodeResponse> RenewCodeAsync(string idKeyHash, string ipAddress, string userAgent, CancellationToken ct = default);

    /// <summary>Retourne l'état actuel de l'OTP (expiration, dernier envoi, resends restants).</summary>
    Task<OtpStatusResponse> GetOtpStatusAsync(string idKeyHash, CancellationToken ct = default);

    /// <summary>Login par mot de passe pour utilisateur existant (après verify-email + OTP).</summary>
    Task<LoginResultDto> PasswordLoginAsync(string idKeyHash, string password, string ipAddress, string userAgent, CancellationToken ct = default);

    /// <summary>Finalise le login après validation OTP pour un utilisateur existant. Génère les tokens.</summary>
    Task<LoginResultDto> FinalizeLoginAsync(string idKeyHash, string ipAddress, string userAgent, CancellationToken ct = default);

    /// <summary>Crée un compte utilisateur après validation OTP (nouvel utilisateur).</summary>
    Task<LoginResultDto> RegisterAsync(string idKeyHash, string firstName, string lastName, string password, string ipAddress, string userAgent, CancellationToken ct = default);

    /// <summary>Retourne l'info de blocage si la session est bloquée, null sinon.</summary>
    Task<BlockedResponse?> GetBlockedStatusAsync(string idKeyHash, CancellationToken ct = default);
}
