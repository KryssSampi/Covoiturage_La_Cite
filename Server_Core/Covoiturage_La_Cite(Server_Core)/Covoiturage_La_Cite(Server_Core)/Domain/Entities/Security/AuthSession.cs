namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;

/// <summary>
/// Session d'authentification temporaire.
/// Chaque tentative de connexion crée une AuthSession (durée max 1h).
/// Le code OTP est nullable et renouvelable (5 min de validité, max 3 renouvellements).
/// </summary>
public class AuthSession
{
    public Guid Id { get; set; }

    /// <summary>Clé secrète hashée (SHA-256). Stockée en cookie httpOnly côté client.</summary>
    public string IdKeyHash { get; set; } = null!;

    /// <summary>Identifiant public court pour l'URL (non secret, lisible).</summary>
    public string PublicId { get; set; } = null!;

    /// <summary>Email soumis par l'utilisateur (null tant que non soumis).</summary>
    public string? Email { get; set; }

    // ── Contexte réseau ───────────────────────────────────────────────────────
    public string IpAddress { get; set; } = null!;
    public string UserAgent { get; set; } = null!;

    // ── Durée de vie de la session (1h) ──────────────────────────────────────
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    // ── OTP ──────────────────────────────────────────────────────────────────
    /// <summary>Code OTP hashé (SHA-256). Null si pas encore envoyé.</summary>
    public string? OtpCodeHash { get; set; }

    /// <summary>Date d'expiration du code OTP actuel (5 min).</summary>
    public DateTimeOffset? OtpExpiresAt { get; set; }

    /// <summary>Nombre total de tentatives de saisie du code (toutes générations confondues, max 10).</summary>
    public int OtpTotalAttempts { get; set; }

    /// <summary>Nombre de tentatives de saisie du code actuel (max 5, reset à chaque renouvellement).</summary>
    public int OtpCurrentAttempts { get; set; }

    /// <summary>Nombre de fois que le code a été renvoyé (max 3).</summary>
    public int OtpResendCount { get; set; }

    // ── Blocage ──────────────────────────────────────────────────────────────
    public bool IsBlocked { get; set; }
    public DateTimeOffset? BlockedUntil { get; set; }

    // ── Résultat ─────────────────────────────────────────────────────────────
    /// <summary>True une fois l'authentification complètement réussie.</summary>
    public bool IsValidated { get; set; }

    /// <summary>UserId lié si l'email correspond à un utilisateur existant.</summary>
    public Guid? UserId { get; set; }
}
