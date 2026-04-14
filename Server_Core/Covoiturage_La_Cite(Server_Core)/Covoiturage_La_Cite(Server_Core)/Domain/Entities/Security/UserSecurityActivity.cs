namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;

public class UserSecurityActivity
{
    public long Id { get; set; }                                // append-only
    public Guid UserId { get; set; }
    public Guid? CertificateId { get; set; }
    public string RequestOrigin { get; set; } = null!;          // mobile_vpn | web_internal | unknown
    public string? IpAddress { get; set; }
    public string? GeoLocation { get; set; }                    // ville approx depuis IP
    public string? UserAgent { get; set; }
    public DateTimeOffset RecordedAt { get; set; }              // TimescaleDB partition by day
    public string ValidationResult { get; set; } = null!;      // success | invalid_signature | expired_key | no_certificate | schema_rejected | vpn_bypass_attempt
    public string UsedKeyVersion { get; set; } = "current";    // current | previous | unknown
    public bool WasAnomaly { get; set; }
    public string? AnomalyType { get; set; }
    public string ActionTaken { get; set; } = "none";           // none | warned | cooldown | blocked | forced_logout

    // Navigation
    public User User { get; set; } = null!;
    public ClientCertificate? Certificate { get; set; }
}
