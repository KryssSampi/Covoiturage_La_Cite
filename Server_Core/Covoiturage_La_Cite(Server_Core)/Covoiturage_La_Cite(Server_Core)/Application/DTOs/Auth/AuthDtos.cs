namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;

/// <summary>
/// DTO pour la requête d'authentification SSO.
/// </summary>
public record SsoCallbackRequest
{
    /// <summary>
    /// Token Microsoft Azure AD (id_token) à valider.
    /// </summary>
    public string IdToken { get; init; } = string.Empty;
}

/// <summary>
/// DTO pour l'authentification en mode test (ISTESTMODE=true).
/// Accepte un email institutionnel sans validation Microsoft SSO.
/// </summary>
public record TestSigninRequest
{
    public string Email { get; init; } = string.Empty;
}

/// <summary>
/// Résultat de l'authentification : JWT + profil utilisateur.
/// </summary>
public record AuthResultDto
{
    public string AccessToken { get; init; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; init; }
    public UserSummaryDto User { get; init; } = null!;
    public bool IsNewUser { get; init; }
}

/// <summary>
/// Résumé utilisateur retourné dans le token d'auth.
/// </summary>
public record UserSummaryDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public string Role { get; init; } = string.Empty;
    public string SchoolRole { get; init; } = string.Empty;
    public bool CanBeDriver { get; init; }
}
