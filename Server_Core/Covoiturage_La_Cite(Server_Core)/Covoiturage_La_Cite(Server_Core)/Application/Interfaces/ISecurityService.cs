using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Security;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface ISecurityService
{
    // ── Enrôlement ──────────────────────────────────────────────────────────
    /// <summary>Enrôle un appareil : le client envoie sa première clé publique ECC-P256.</summary>
    Task<EnrollResultDto> EnrollDeviceAsync(Guid userId, EnrollDeviceDto dto, CancellationToken ct = default);

    // ── Validation de signature ─────────────────────────────────────────────
    /// <summary>Vérifie la signature ECC d'une requête (Thread B). Retourne le verdict.</summary>
    Task<SignatureValidationResultDto> ValidateSignatureAsync(Guid userId, ValidateSignatureDto dto, CancellationToken ct = default);

    // ── Heartbeat ───────────────────────────────────────────────────────────
    /// <summary>Réception d'un heartbeat mobile. Retourne si rotation_required.</summary>
    Task<HeartbeatResponseDto> ProcessHeartbeatAsync(Guid userId, HeartbeatDto dto, CancellationToken ct = default);

    // ── Rotation de clés (client) ───────────────────────────────────────────
    /// <summary>Le client envoie sa nouvelle clé publique, signée avec l'ancienne. ACK de rotation.</summary>
    Task<RotationAckDto> RotateClientKeyAsync(Guid userId, RotateClientKeyDto dto, CancellationToken ct = default);

    // ── Rotation globale (admin / job) ──────────────────────────────────────
    /// <summary>Déclenche une rotation globale des certificats (irrégulière, imprévisible).</summary>
    Task<GlobalRotationResultDto> TriggerGlobalRotationAsync(string triggeredBy, string? note = null, CancellationToken ct = default);

    // ── Kill Switch ─────────────────────────────────────────────────────────
    /// <summary>Déclenche le Kill Switch pour un certificat spécifique.</summary>
    Task KillSwitchAsync(Guid certificateId, string severity, string reason, CancellationToken ct = default);

    // ── Web Session Keys ────────────────────────────────────────────────────
    Task<WebSessionKeyDto> IssueWebSessionKeyAsync(Guid userId, string serverSignature, CancellationToken ct = default);
    Task<bool> ValidateWebSessionKeyAsync(string keyHash, CancellationToken ct = default);
    Task RevokeWebSessionAsync(Guid userId, CancellationToken ct = default);

    // ── Audit ───────────────────────────────────────────────────────────────
    Task<List<SecurityActivityDto>> GetSecurityLogAsync(Guid userId, int count = 50, CancellationToken ct = default);
}
