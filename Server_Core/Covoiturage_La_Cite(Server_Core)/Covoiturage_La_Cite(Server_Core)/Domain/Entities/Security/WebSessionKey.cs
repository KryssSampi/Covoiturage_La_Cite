namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;

public class WebSessionKey
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }                            // 1 actif par user
    public string KeyHash { get; set; } = null!;                // SHA-512, stocké en HttpOnly cookie
    public string Status { get; set; } = "active";             // active | expired | revoked
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }               // rotation forcée ou 2h inactivité
    public DateTimeOffset? LastUsedAt { get; set; }             // sliding expiration
    public string ServerSignature { get; set; } = null!;        // Web Server signe la clé avec son certificat

    // Navigation
    public User User { get; set; } = null!;
}
