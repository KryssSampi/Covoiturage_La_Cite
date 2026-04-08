using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IUserService
{
    Task<UserResponseDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserResponseDto?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
    Task<UserPublicDto?> GetPublicProfileAsync(Guid id, Guid? requesterId = null, CancellationToken ct = default);
    Task<(bool isLiked, int count)> ToggleLikeAsync(Guid likerId, Guid likedId, CancellationToken ct = default);
    Task<SurveyTripAlertDto> CreateSurveyAlertAsync(Guid userId, CreateSurveyAlertDto dto, CancellationToken ct = default);
    Task<SurveyTripAlertDto> ToggleSurveyAlertAsync(Guid userId, Guid alertId, CancellationToken ct = default);
    Task DeleteSurveyAlertAsync(Guid userId, Guid alertId, CancellationToken ct = default);
    Task<UserResponseDto> UpdateProfileAsync(Guid userId, UpdateUserDto dto, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid userId, CancellationToken ct = default);
    Task<PaginatedResult<UserResponseDto>> GetAllPaginatedAsync(int page, int pageSize, string? search = null, CancellationToken ct = default);

    /// <summary>
    /// Authentification SSO : valide le token Microsoft, crée ou récupère l'utilisateur, retourne un JWT.
    /// </summary>
    Task<AuthResultDto> AuthenticateWithSsoAsync(string microsoftIdToken, CancellationToken ct = default);

    /// <summary>
    /// Authentification test (ISTESTMODE=true) : email institutionnel uniquement, sans SSO Microsoft.
    /// Crée automatiquement l'utilisateur s'il n'existe pas.
    /// </summary>
    Task<AuthResultDto> AuthenticateWithEmailTestModeAsync(string email, CancellationToken ct = default);
}
