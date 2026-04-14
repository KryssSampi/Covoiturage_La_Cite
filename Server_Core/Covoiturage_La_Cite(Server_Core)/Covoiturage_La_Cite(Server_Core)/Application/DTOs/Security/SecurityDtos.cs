namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Security;

// ── Enrôlement ──────────────────────────────────────────────────────────────
public class EnrollDeviceDto
{
    public string DeviceFingerprint { get; set; } = null!;
    public string PublicKeyPem { get; set; } = null!;
}

public class EnrollResultDto
{
    public Guid CertificateId { get; set; }
    public string Status { get; set; } = "active";
    public DateTimeOffset EnrolledAt { get; set; }
}

// ── Validation de signature ─────────────────────────────────────────────────
public class ValidateSignatureDto
{
    public string DeviceFingerprint { get; set; } = null!;
    public string SignatureBase64 { get; set; } = null!;
    public string PayloadHash { get; set; } = null!;            // SHA-256 du body
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string RequestOrigin { get; set; } = "unknown";      // mobile_vpn | web_internal
}

public class SignatureValidationResultDto
{
    public bool IsValid { get; set; }
    public string ValidationResult { get; set; } = null!;       // success | invalid_signature | expired_key | ...
    public string? ActionTaken { get; set; }                     // none | warned | cooldown | blocked | forced_logout
    public bool RotationRequired { get; set; }
}

// ── Heartbeat ───────────────────────────────────────────────────────────────
public class HeartbeatDto
{
    public string DeviceFingerprint { get; set; } = null!;
    public string SignatureBase64 { get; set; } = null!;        // signature du timestamp
    public string TimestampIso { get; set; } = null!;
}

public class HeartbeatResponseDto
{
    public bool Acknowledged { get; set; }
    public bool RotationRequired { get; set; }
    public string? NewServerPublicKeyPem { get; set; }          // si rotation en cours
}

// ── Rotation clé client ─────────────────────────────────────────────────────
public class RotateClientKeyDto
{
    public string DeviceFingerprint { get; set; } = null!;
    public string NewPublicKeyPem { get; set; } = null!;
    public string OldKeySignatureBase64 { get; set; } = null!;  // signé avec l'ancienne clé pour prouver continuité
    public string PayloadHash { get; set; } = null!;
}

public class RotationAckDto
{
    public bool Success { get; set; }
    public DateTimeOffset NewKeyIssuedAt { get; set; }
}

// ── Rotation globale ────────────────────────────────────────────────────────
public class GlobalRotationResultDto
{
    public Guid RotationEventId { get; set; }
    public int AffectedClients { get; set; }
    public DateTimeOffset TriggeredAt { get; set; }
}

// ── Web Session Key ─────────────────────────────────────────────────────────
public class WebSessionKeyDto
{
    public Guid Id { get; set; }
    public string KeyHash { get; set; } = null!;
    public DateTimeOffset ExpiresAt { get; set; }
}

// ── Security Activity Log ───────────────────────────────────────────────────
public class SecurityActivityDto
{
    public long Id { get; set; }
    public string RequestOrigin { get; set; } = null!;
    public string? IpAddress { get; set; }
    public string? GeoLocation { get; set; }
    public DateTimeOffset RecordedAt { get; set; }
    public string ValidationResult { get; set; } = null!;
    public string UsedKeyVersion { get; set; } = null!;
    public bool WasAnomaly { get; set; }
    public string? AnomalyType { get; set; }
    public string ActionTaken { get; set; } = null!;
}
