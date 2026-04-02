using Covoiturage_La_Cite_Server_Core_.Data.Models;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

// ── Consentements PIPEDA ────────────────────────────────────────────────────
public interface IConsentementRepository
{
    Task<ConsentementsPipedum?> GetByUserAsync(Guid userId, CancellationToken ct = default);
    Task<ConsentementsPipedum?> GetByUserAndVersionAsync(Guid userId, string version, CancellationToken ct = default);
    Task AddAsync(ConsentementsPipedum consent, CancellationToken ct = default);
    Task UpdateAsync(ConsentementsPipedum consent, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

// ── Exports de données ──────────────────────────────────────────────────────
public interface IDataExportRepository
{
    Task<ExportsDonnee?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<ExportsDonnee>> GetByUserAsync(Guid userId, CancellationToken ct = default);
    Task<List<ExportsDonnee>> GetPendingExportsAsync(CancellationToken ct = default);
    Task AddAsync(ExportsDonnee export, CancellationToken ct = default);
    Task UpdateAsync(ExportsDonnee export, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
