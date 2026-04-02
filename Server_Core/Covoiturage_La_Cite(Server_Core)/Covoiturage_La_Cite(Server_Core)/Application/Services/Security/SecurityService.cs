using System.Security.Cryptography;
using System.Text;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Security;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Security;

public class SecurityService : ISecurityService
{
    private readonly IClientCertificateRepository _certRepo;
    private readonly IUserSecurityActivityRepository _activityRepo;
    private readonly ICertificateRotationEventRepository _rotationRepo;
    private readonly IWebSessionKeyRepository _webKeyRepo;
    private readonly ILogger<SecurityService> _logger;

    public SecurityService(
        IClientCertificateRepository certRepo,
        IUserSecurityActivityRepository activityRepo,
        ICertificateRotationEventRepository rotationRepo,
        IWebSessionKeyRepository webKeyRepo,
        ILogger<SecurityService> logger)
    {
        _certRepo = certRepo;
        _activityRepo = activityRepo;
        _rotationRepo = rotationRepo;
        _webKeyRepo = webKeyRepo;
        _logger = logger;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENRÔLEMENT
    // ═══════════════════════════════════════════════════════════════════════
    public async Task<EnrollResultDto> EnrollDeviceAsync(Guid userId, EnrollDeviceDto dto, CancellationToken ct)
    {
        var existing = await _certRepo.GetByUserAndDeviceAsync(userId, dto.DeviceFingerprint, ct);
        if (existing != null)
            throw new InvalidOperationException("Appareil déjà enrôlé. Utilisez la rotation de clé.");

        var cert = new ClientCertificate
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DeviceFingerprint = dto.DeviceFingerprint,
            CurrentPublicKeyPem = dto.PublicKeyPem,
            CurrentKeyIssuedAt = DateTimeOffset.UtcNow,
            HasGotNewPublicKey = true,
            LastHeartbeatAt = DateTimeOffset.UtcNow,
            Status = "active",
            FailedValidationCount = 0,
            EnrolledAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _certRepo.AddAsync(cert, ct);

        await LogActivityAsync(userId, cert.Id, "mobile_vpn", null, null, "success", "current", false, null, "none", ct);

        return new EnrollResultDto
        {
            CertificateId = cert.Id,
            Status = cert.Status,
            EnrolledAt = cert.EnrolledAt
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION DE SIGNATURE (THREAD B)
    // ═══════════════════════════════════════════════════════════════════════
    public async Task<SignatureValidationResultDto> ValidateSignatureAsync(Guid userId, ValidateSignatureDto dto, CancellationToken ct)
    {
        var cert = await _certRepo.GetByUserAndDeviceAsync(userId, dto.DeviceFingerprint, ct);
        if (cert == null)
        {
            await LogActivityAsync(userId, null, dto.RequestOrigin, dto.IpAddress, dto.UserAgent,
                "no_certificate", "unknown", true, "no_certificate", "none", ct);
            return new SignatureValidationResultDto { IsValid = false, ValidationResult = "no_certificate", ActionTaken = "none" };
        }

        // Cooldown actif ?
        if (cert.CooldownUntil.HasValue && cert.CooldownUntil > DateTimeOffset.UtcNow)
        {
            await LogActivityAsync(userId, cert.Id, dto.RequestOrigin, dto.IpAddress, dto.UserAgent,
                "cooldown_active", "current", true, "cooldown_active", "blocked", ct);
            return new SignatureValidationResultDto { IsValid = false, ValidationResult = "cooldown_active", ActionTaken = "blocked" };
        }

        // Blocked ?
        if (cert.Status == "blocked")
        {
            await LogActivityAsync(userId, cert.Id, dto.RequestOrigin, dto.IpAddress, dto.UserAgent,
                "certificate_blocked", "current", true, "blocked_cert", "blocked", ct);
            return new SignatureValidationResultDto { IsValid = false, ValidationResult = "certificate_blocked", ActionTaken = "blocked" };
        }

        // Vérifier la signature ECC-P256
        var keyVersion = "current";
        var isValid = VerifyEccSignature(cert.CurrentPublicKeyPem, dto.SignatureBase64, dto.PayloadHash);

        if (!isValid && cert.PreviousPublicKeyPem != null)
        {
            isValid = VerifyEccSignature(cert.PreviousPublicKeyPem, dto.SignatureBase64, dto.PayloadHash);
            keyVersion = isValid ? "previous" : "unknown";
        }

        if (isValid)
        {
            cert.LastSuccessfulRequestAt = DateTimeOffset.UtcNow;
            cert.FailedValidationCount = 0;
            cert.UpdatedAt = DateTimeOffset.UtcNow;
            await _certRepo.UpdateAsync(cert, ct);

            await LogActivityAsync(userId, cert.Id, dto.RequestOrigin, dto.IpAddress, dto.UserAgent,
                "success", keyVersion, false, null, "none", ct);

            return new SignatureValidationResultDto
            {
                IsValid = true,
                ValidationResult = "success",
                ActionTaken = "none",
                RotationRequired = !cert.HasGotNewPublicKey
            };
        }

        // ── Signature invalide → escalade ───────────────────────────────────
        cert.FailedValidationCount++;
        cert.UpdatedAt = DateTimeOffset.UtcNow;

        var failedLast24h = await _activityRepo.CountFailedLast24hAsync(userId, ct);
        var (action, severity) = DetermineAction(cert, failedLast24h);

        switch (action)
        {
            case "cooldown":
                cert.Status = "cooldown";
                cert.CooldownUntil = DateTimeOffset.UtcNow.AddMinutes(30);
                break;
            case "forced_logout":
                cert.Status = "cooldown";
                cert.CooldownUntil = DateTimeOffset.UtcNow.AddHours(1);
                break;
            case "blocked":
                cert.Status = "blocked";
                cert.CooldownUntil = DateTimeOffset.UtcNow.AddHours(24);
                cert.RequiresServiceDesk = true;
                break;
        }

        await _certRepo.UpdateAsync(cert, ct);

        await LogActivityAsync(userId, cert.Id, dto.RequestOrigin, dto.IpAddress, dto.UserAgent,
            "invalid_signature", keyVersion, true, severity, action, ct);

        _logger.LogWarning("Kill Switch: User={UserId} Device={Device} Action={Action} Severity={Severity}",
            userId, dto.DeviceFingerprint, action, severity);

        return new SignatureValidationResultDto
        {
            IsValid = false,
            ValidationResult = "invalid_signature",
            ActionTaken = action
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HEARTBEAT
    // ═══════════════════════════════════════════════════════════════════════
    public async Task<HeartbeatResponseDto> ProcessHeartbeatAsync(Guid userId, HeartbeatDto dto, CancellationToken ct)
    {
        var cert = await _certRepo.GetActiveByUserAndDeviceAsync(userId, dto.DeviceFingerprint, ct);
        if (cert == null)
            return new HeartbeatResponseDto { Acknowledged = false, RotationRequired = false };

        // Vérifier la signature du heartbeat
        var isValid = VerifyEccSignature(cert.CurrentPublicKeyPem, dto.SignatureBase64, dto.TimestampIso);

        if (!isValid)
            return new HeartbeatResponseDto { Acknowledged = false, RotationRequired = false };

        cert.LastHeartbeatAt = DateTimeOffset.UtcNow;
        cert.UpdatedAt = DateTimeOffset.UtcNow;
        await _certRepo.UpdateAsync(cert, ct);

        return new HeartbeatResponseDto
        {
            Acknowledged = true,
            RotationRequired = !cert.HasGotNewPublicKey,
            NewServerPublicKeyPem = !cert.HasGotNewPublicKey ? GetServerPublicKeyPem() : null
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ROTATION CLÉ CLIENT
    // ═══════════════════════════════════════════════════════════════════════
    public async Task<RotationAckDto> RotateClientKeyAsync(Guid userId, RotateClientKeyDto dto, CancellationToken ct)
    {
        var cert = await _certRepo.GetByUserAndDeviceAsync(userId, dto.DeviceFingerprint, ct);
        if (cert == null)
            throw new KeyNotFoundException("Certificat introuvable");

        // Vérifier que l'ancienne clé signe bien le payload (continuité légitime)
        var oldKeyValid = VerifyEccSignature(cert.CurrentPublicKeyPem, dto.OldKeySignatureBase64, dto.PayloadHash);
        if (!oldKeyValid && cert.PreviousPublicKeyPem != null)
            oldKeyValid = VerifyEccSignature(cert.PreviousPublicKeyPem, dto.OldKeySignatureBase64, dto.PayloadHash);

        if (!oldKeyValid)
        {
            await KillSwitchAsync(cert.Id, "high", "rotation_invalid_old_key", ct);
            throw new UnauthorizedAccessException("Signature de rotation invalide — Kill Switch déclenché");
        }

        // Transaction atomique : remplacer la clé
        cert.PreviousPublicKeyPem = cert.CurrentPublicKeyPem;
        cert.PreviousKeyRetiredAt = DateTimeOffset.UtcNow;
        cert.CurrentPublicKeyPem = dto.NewPublicKeyPem;
        cert.CurrentKeyIssuedAt = DateTimeOffset.UtcNow;
        cert.HasGotNewPublicKey = true;
        cert.Status = "active";
        cert.FailedValidationCount = 0;
        cert.UpdatedAt = DateTimeOffset.UtcNow;

        await _certRepo.UpdateAsync(cert, ct);

        return new RotationAckDto
        {
            Success = true,
            NewKeyIssuedAt = cert.CurrentKeyIssuedAt
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ROTATION GLOBALE (ADMIN / JOB)
    // ═══════════════════════════════════════════════════════════════════════
    public async Task<GlobalRotationResultDto> TriggerGlobalRotationAsync(string triggeredBy, string? note, CancellationToken ct)
    {
        // Reset global atomique
        var affected = await _certRepo.ResetAllHasGotNewPublicKeyAsync(ct);

        var evt = new CertificateRotationEvent
        {
            Id = Guid.NewGuid(),
            TriggeredBy = triggeredBy,
            AffectedClientsCount = affected,
            NewPublicKeyGeneratedAt = DateTimeOffset.UtcNow,
            Note = note,
            CreatedAt = DateTimeOffset.UtcNow
        };
        await _rotationRepo.AddAsync(evt, ct);

        _logger.LogWarning("Rotation globale déclenchée: {Trigger} — {Count} clients affectés", triggeredBy, affected);

        return new GlobalRotationResultDto
        {
            RotationEventId = evt.Id,
            AffectedClients = affected,
            TriggeredAt = evt.CreatedAt
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // KILL SWITCH
    // ═══════════════════════════════════════════════════════════════════════
    public async Task KillSwitchAsync(Guid certificateId, string severity, string reason, CancellationToken ct)
    {
        var cert = await _certRepo.GetByIdAsync(certificateId, ct);
        if (cert == null) return;

        switch (severity)
        {
            case "medium":
                cert.Status = "cooldown";
                cert.CooldownUntil = DateTimeOffset.UtcNow.AddMinutes(30);
                break;
            case "high":
                cert.Status = "cooldown";
                cert.CooldownUntil = DateTimeOffset.UtcNow.AddHours(1);
                break;
            case "critical":
            case "breach":
                cert.Status = "blocked";
                cert.CooldownUntil = DateTimeOffset.UtcNow.AddHours(24);
                cert.RequiresServiceDesk = true;
                break;
            default:
                cert.Status = "cooldown";
                cert.CooldownUntil = DateTimeOffset.UtcNow.AddMinutes(30);
                break;
        }

        cert.UpdatedAt = DateTimeOffset.UtcNow;
        await _certRepo.UpdateAsync(cert, ct);

        _logger.LogCritical("KILL SWITCH: CertId={CertId} UserId={UserId} Severity={Severity} Reason={Reason}",
            certificateId, cert.UserId, severity, reason);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // WEB SESSION KEYS
    // ═══════════════════════════════════════════════════════════════════════
    public async Task<WebSessionKeyDto> IssueWebSessionKeyAsync(Guid userId, string serverSignature, CancellationToken ct)
    {
        // Révoquer l'ancienne
        await _webKeyRepo.RevokeAllByUserAsync(userId, ct);

        var keyBytes = RandomNumberGenerator.GetBytes(64);
        var keyHash = Convert.ToBase64String(SHA512.HashData(keyBytes));

        var key = new WebSessionKey
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            KeyHash = keyHash,
            Status = "active",
            IssuedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(2),
            ServerSignature = serverSignature
        };

        await _webKeyRepo.AddAsync(key, ct);

        return new WebSessionKeyDto
        {
            Id = key.Id,
            KeyHash = keyHash,
            ExpiresAt = key.ExpiresAt
        };
    }

    public async Task<bool> ValidateWebSessionKeyAsync(string keyHash, CancellationToken ct)
    {
        var key = await _webKeyRepo.GetByKeyHashAsync(keyHash, ct);
        if (key == null || key.ExpiresAt < DateTimeOffset.UtcNow) return false;

        // Sliding expiration
        key.LastUsedAt = DateTimeOffset.UtcNow;
        key.ExpiresAt = DateTimeOffset.UtcNow.AddHours(2);
        await _webKeyRepo.UpdateAsync(key, ct);
        return true;
    }

    public async Task RevokeWebSessionAsync(Guid userId, CancellationToken ct)
        => await _webKeyRepo.RevokeAllByUserAsync(userId, ct);

    // ═══════════════════════════════════════════════════════════════════════
    // AUDIT
    // ═══════════════════════════════════════════════════════════════════════
    public async Task<List<SecurityActivityDto>> GetSecurityLogAsync(Guid userId, int count, CancellationToken ct)
    {
        var activities = await _activityRepo.GetRecentByUserAsync(userId, count, ct);
        return activities.Select(a => new SecurityActivityDto
        {
            Id = a.Id,
            RequestOrigin = a.RequestOrigin,
            IpAddress = a.IpAddress,
            GeoLocation = a.GeoLocation,
            RecordedAt = a.RecordedAt,
            ValidationResult = a.ValidationResult,
            UsedKeyVersion = a.UsedKeyVersion,
            WasAnomaly = a.WasAnomaly,
            AnomalyType = a.AnomalyType,
            ActionTaken = a.ActionTaken
        }).ToList();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITAIRES PRIVÉS
    // ═══════════════════════════════════════════════════════════════════════

    private static bool VerifyEccSignature(string publicKeyPem, string signatureBase64, string data)
    {
        try
        {
            using var ecdsa = ECDsa.Create();
            ecdsa.ImportFromPem(publicKeyPem);
            var dataBytes = Encoding.UTF8.GetBytes(data);
            var sigBytes = Convert.FromBase64String(signatureBase64);
            return ecdsa.VerifyData(dataBytes, sigBytes, HashAlgorithmName.SHA256);
        }
        catch
        {
            return false;
        }
    }

    private static (string action, string severity) DetermineAction(ClientCertificate cert, int failedLast24h)
    {
        // Séquence 5.3 — Kill Switch Décisionnel
        if (failedLast24h >= 10)
            return ("blocked", "breach");
        if (cert.FailedValidationCount >= 3)
            return ("cooldown", "medium");
        if (failedLast24h >= 5)
            return ("forced_logout", "high");
        return ("warned", "low");
    }

    private static string GetServerPublicKeyPem()
    {
        // TODO: Charger la clé publique du serveur depuis la configuration / KeyVault
        return "-----BEGIN PUBLIC KEY-----\nSERVER_PUBLIC_KEY_PLACEHOLDER\n-----END PUBLIC KEY-----";
    }

    private async Task LogActivityAsync(Guid userId, Guid? certId, string origin, string? ip, string? ua,
        string result, string keyVersion, bool anomaly, string? anomalyType, string action, CancellationToken ct)
    {
        var activity = new UserSecurityActivity
        {
            UserId = userId,
            CertificateId = certId,
            RequestOrigin = origin,
            IpAddress = ip,
            UserAgent = ua,
            RecordedAt = DateTimeOffset.UtcNow,
            ValidationResult = result,
            UsedKeyVersion = keyVersion,
            WasAnomaly = anomaly,
            AnomalyType = anomalyType,
            ActionTaken = action
        };
        await _activityRepo.AddAsync(activity, ct);
    }
}
