namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Auth;

// ── Requêtes ────────────────────────────────────────────────────────────────

/// <summary>Réponse à la création d'une AuthSession (étape 0).</summary>
public record InitSessionResponse
{
    public string PublicId { get; init; } = null!;
    public string IdKey { get; init; } = null!; // en clair, stocké côté client en cookie httpOnly
    public DateTimeOffset ExpiresAt { get; init; }
}

/// <summary>Requête de vérification d'email (étape 1).</summary>
public record VerifyEmailRequest
{
    public string Email { get; init; } = string.Empty;
}

/// <summary>Réponse verify-email : indique si l'email existe et si un OTP a été envoyé.</summary>
public record VerifyEmailResponse
{
    /// <summary>True si l'email correspond à un utilisateur existant.</summary>
    public bool UserExists { get; init; }

    /// <summary>True si un code OTP a été envoyé (pour les nouveaux utilisateurs).</summary>
    public bool OtpSent { get; init; }
}

/// <summary>Requête de vérification du code OTP (étape 2 pour nouveaux, étape 3 pour existants).</summary>
public record VerifyCodeRequest
{
    public string Code { get; init; } = string.Empty;
    /// <summary>Si true, désactive l'OTP 2FA pour 30 jours sur ce compte (utilisateurs existants uniquement).</summary>
    public bool RememberOtp { get; init; }
}

/// <summary>Réponse verify-code.</summary>
public record VerifyCodeResponse
{
    public bool Success { get; init; }
    public int RemainingAttempts { get; init; }
}

/// <summary>Requête de renouvellement du code OTP.</summary>
public record RenewCodeResponse
{
    public bool Success { get; init; }
    public int RemainingResends { get; init; }
}

/// <summary>Statut OTP pour le client (date d'expiration + resends restants)</summary>
public record OtpStatusResponse
{
    public bool HasOtp { get; init; }
    public DateTimeOffset? OtpExpiresAt { get; init; }
    public DateTimeOffset? LastSentAt { get; init; }
    public int RemainingResends { get; init; }
}

/// <summary>Requête de login par mot de passe (étape 2 pour utilisateurs existants).</summary>
public record PasswordLoginRequest
{
    public string Password { get; init; } = string.Empty;
}

/// <summary>Réponse de login réussi : tokens + user.</summary>
public record LoginResultDto
{
    public string AccessToken { get; init; } = null!;
    public DateTimeOffset AccessTokenExpiresAt { get; init; }
    public UserSummaryDto User { get; init; } = null!;
}

/// <summary>Résultat d'un refresh : nouveau access token + (optionnellement) nouveau refresh token.</summary>
public record RefreshResultDto
{
    public string AccessToken { get; init; } = null!;
    public DateTimeOffset AccessTokenExpiresAt { get; init; }

    // Raw refresh token renvoyé au BFF pour écriture en cookie httpOnly. Stocker uniquement le hash côté serveur.
    public string? RefreshToken { get; init; }
    public DateTimeOffset? RefreshTokenExpiresAt { get; init; }
}

/// <summary>Requête envoyée pour rafraîchir le token (optionnel si le token est présent en cookie httpOnly).</summary>
public record RefreshRequest
{
    public string? RefreshToken { get; init; }
}

/// <summary>Info de blocage envoyée au client.</summary>
public record BlockedResponse
{
    public bool IsBlocked { get; init; } = true;
    public DateTimeOffset BlockedUntil { get; init; }
    public int RemainingSeconds { get; init; }
}

/// <summary>Requête de création de compte (après validation OTP pour nouvel utilisateur).</summary>
public record RegisterRequest
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
