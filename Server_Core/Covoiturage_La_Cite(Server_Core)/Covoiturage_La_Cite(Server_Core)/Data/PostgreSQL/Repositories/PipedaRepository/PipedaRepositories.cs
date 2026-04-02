using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.Models;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.PipedaRepository;

// ═══════════════════════════════════════════════════════════════════════════
// ConsentementRepository
// ═══════════════════════════════════════════════════════════════════════════
public class ConsentementRepository : IConsentementRepository
{
    private readonly AppDbContext _db;
    public ConsentementRepository(AppDbContext db) => _db = db;

    public Task<ConsentementsPipedum?> GetByUserAsync(Guid userId, CancellationToken ct)
        => _db.Set<ConsentementsPipedum>()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.DateConsentement)
            .FirstOrDefaultAsync(ct);

    public Task<ConsentementsPipedum?> GetByUserAndVersionAsync(Guid userId, string version, CancellationToken ct)
        => _db.Set<ConsentementsPipedum>()
            .FirstOrDefaultAsync(c => c.UserId == userId && c.VersionPolitique == version, ct);

    public async Task AddAsync(ConsentementsPipedum consent, CancellationToken ct)
    {
        await _db.Set<ConsentementsPipedum>().AddAsync(consent, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ConsentementsPipedum consent, CancellationToken ct)
    {
        _db.Set<ConsentementsPipedum>().Update(consent);
        await _db.SaveChangesAsync(ct);
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

// ═══════════════════════════════════════════════════════════════════════════
// DataExportRepository
// ═══════════════════════════════════════════════════════════════════════════
public class DataExportRepository : IDataExportRepository
{
    private readonly AppDbContext _db;
    public DataExportRepository(AppDbContext db) => _db = db;

    public Task<ExportsDonnee?> GetByIdAsync(Guid id, CancellationToken ct)
        => _db.Set<ExportsDonnee>().FirstOrDefaultAsync(e => e.Id == id, ct);

    public Task<List<ExportsDonnee>> GetByUserAsync(Guid userId, CancellationToken ct)
        => _db.Set<ExportsDonnee>()
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.DateDemande)
            .ToListAsync(ct);

    public Task<List<ExportsDonnee>> GetPendingExportsAsync(CancellationToken ct)
        => _db.Set<ExportsDonnee>()
            .Where(e => e.Statut == "en_attente" || e.Statut == "en_cours")
            .OrderBy(e => e.DateDemande)
            .ToListAsync(ct);

    public async Task AddAsync(ExportsDonnee export, CancellationToken ct)
    {
        await _db.Set<ExportsDonnee>().AddAsync(export, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ExportsDonnee export, CancellationToken ct)
    {
        _db.Set<ExportsDonnee>().Update(export);
        await _db.SaveChangesAsync(ct);
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
