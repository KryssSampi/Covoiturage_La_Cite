using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Pipeda;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IPipedaComplianceService
{
    // ── Consentements ───────────────────────────────────────────────────────
    Task<ConsentementDto> GetConsentAsync(Guid userId, CancellationToken ct = default);
    Task<ConsentementDto> UpdateConsentAsync(Guid userId, UpdateConsentDto dto, CancellationToken ct = default);

    // ── Export de données (droit d'accès PIPEDA) ────────────────────────────
    Task<DataExportRequestDto> RequestDataExportAsync(Guid userId, string? ipAddress, CancellationToken ct = default);
    Task<List<DataExportStatusDto>> GetMyExportsAsync(Guid userId, CancellationToken ct = default);

    // ── Suppression de compte (droit à l'effacement) ────────────────────────
    /// <summary>
    /// Anonymise le compte conformément à PIPEDA.
    /// Remplace les données nominatives par des valeurs anonymisées.
    /// Conserve les données transactionnelles pendant 7 ans (obligation légale).
    /// </summary>
    Task AnonymizeAccountAsync(Guid userId, string? reason, CancellationToken ct = default);

    // ── Traitement batch (Hangfire) ─────────────────────────────────────────
    Task ProcessPendingExportsAsync(CancellationToken ct = default);
}
