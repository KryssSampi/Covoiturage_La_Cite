namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;

public class ClientCertificate
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string DeviceFingerprint { get; set; } = null!;      // SHA-512 (Android ID + Build / iOS DeviceCheck)
    public string CurrentPublicKeyPem { get; set; } = null!;    // ECC-P256, signé à l'enrôlement
    public string? PreviousPublicKeyPem { get; set; }            // rotation handshake uniquement
    public DateTimeOffset CurrentKeyIssuedAt { get; set; }
    public DateTimeOffset? PreviousKeyRetiredAt { get; set; }
    public bool HasGotNewPublicKey { get; set; }                 // reset global lors d'une rotation
    public DateTimeOffset LastHeartbeatAt { get; set; }
    public DateTimeOffset? LastSuccessfulRequestAt { get; set; }
    public string Status { get; set; } = "active";              // active | pending_rotation | revoked | cooldown | blocked
    public DateTimeOffset? CooldownUntil { get; set; }
    public bool RequiresServiceDesk { get; set; }               // faille critique
    public int FailedValidationCount { get; set; }
    public DateTimeOffset EnrolledAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<UserSecurityActivity> SecurityActivities { get; set; } = new List<UserSecurityActivity>();
}
