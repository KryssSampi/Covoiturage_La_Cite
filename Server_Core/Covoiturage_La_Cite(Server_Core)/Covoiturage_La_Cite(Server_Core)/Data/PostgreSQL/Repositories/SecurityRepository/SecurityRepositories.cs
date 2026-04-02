using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.SecurityRepository;

// ═══════════════════════════════════════════════════════════════════════════
// ClientCertificateRepository
// ═══════════════════════════════════════════════════════════════════════════
public class ClientCertificateRepository : IClientCertificateRepository
{
    private readonly AppDbContext _db;
    public ClientCertificateRepository(AppDbContext db) => _db = db;

    public Task<ClientCertificate?> GetByIdAsync(Guid id, CancellationToken ct)
        => _db.ClientCertificates.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<ClientCertificate?> GetByUserAndDeviceAsync(Guid userId, string deviceFingerprint, CancellationToken ct)
        => _db.ClientCertificates.FirstOrDefaultAsync(c => c.UserId == userId && c.DeviceFingerprint == deviceFingerprint, ct);

    public Task<List<ClientCertificate>> GetByUserIdAsync(Guid userId, CancellationToken ct)
        => _db.ClientCertificates.Where(c => c.UserId == userId).ToListAsync(ct);

    public Task<ClientCertificate?> GetActiveByUserAndDeviceAsync(Guid userId, string deviceFingerprint, CancellationToken ct)
        => _db.ClientCertificates.FirstOrDefaultAsync(c =>
            c.UserId == userId && c.DeviceFingerprint == deviceFingerprint && c.Status == "active", ct);

    public async Task AddAsync(ClientCertificate cert, CancellationToken ct)
    {
        await _db.ClientCertificates.AddAsync(cert, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ClientCertificate cert, CancellationToken ct)
    {
        _db.ClientCertificates.Update(cert);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> ResetAllHasGotNewPublicKeyAsync(CancellationToken ct)
        => await _db.ClientCertificates
            .Where(c => c.Status == "active" || c.Status == "pending_rotation")
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.HasGotNewPublicKey, false), ct);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

// ═══════════════════════════════════════════════════════════════════════════
// UserSecurityActivityRepository
// ═══════════════════════════════════════════════════════════════════════════
public class UserSecurityActivityRepository : IUserSecurityActivityRepository
{
    private readonly AppDbContext _db;
    public UserSecurityActivityRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(UserSecurityActivity activity, CancellationToken ct)
    {
        await _db.UserSecurityActivities.AddAsync(activity, ct);
        await _db.SaveChangesAsync(ct);
    }

    public Task<List<UserSecurityActivity>> GetRecentByUserAsync(Guid userId, int count, CancellationToken ct)
        => _db.UserSecurityActivities
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.RecordedAt)
            .Take(count)
            .ToListAsync(ct);

    public Task<int> CountFailedLast24hAsync(Guid userId, CancellationToken ct)
    {
        var since = DateTimeOffset.UtcNow.AddHours(-24);
        return _db.UserSecurityActivities
            .CountAsync(a => a.UserId == userId && a.RecordedAt >= since && a.ValidationResult != "success", ct);
    }

    public Task<UserSecurityActivity?> GetLastSuccessfulAsync(Guid userId, CancellationToken ct)
        => _db.UserSecurityActivities
            .Where(a => a.UserId == userId && a.ValidationResult == "success")
            .OrderByDescending(a => a.RecordedAt)
            .FirstOrDefaultAsync(ct);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

// ═══════════════════════════════════════════════════════════════════════════
// CertificateRotationEventRepository
// ═══════════════════════════════════════════════════════════════════════════
public class CertificateRotationEventRepository : ICertificateRotationEventRepository
{
    private readonly AppDbContext _db;
    public CertificateRotationEventRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(CertificateRotationEvent evt, CancellationToken ct)
    {
        await _db.CertificateRotationEvents.AddAsync(evt, ct);
        await _db.SaveChangesAsync(ct);
    }

    public Task<CertificateRotationEvent?> GetLatestAsync(CancellationToken ct)
        => _db.CertificateRotationEvents.OrderByDescending(e => e.CreatedAt).FirstOrDefaultAsync(ct);

    public Task<List<CertificateRotationEvent>> GetRecentAsync(int count, CancellationToken ct)
        => _db.CertificateRotationEvents.OrderByDescending(e => e.CreatedAt).Take(count).ToListAsync(ct);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

// ═══════════════════════════════════════════════════════════════════════════
// WebSessionKeyRepository
// ═══════════════════════════════════════════════════════════════════════════
public class WebSessionKeyRepository : IWebSessionKeyRepository
{
    private readonly AppDbContext _db;
    public WebSessionKeyRepository(AppDbContext db) => _db = db;

    public Task<WebSessionKey?> GetActiveByUserAsync(Guid userId, CancellationToken ct)
        => _db.WebSessionKeys.FirstOrDefaultAsync(k => k.UserId == userId && k.Status == "active", ct);

    public Task<WebSessionKey?> GetByKeyHashAsync(string keyHash, CancellationToken ct)
        => _db.WebSessionKeys.FirstOrDefaultAsync(k => k.KeyHash == keyHash && k.Status == "active", ct);

    public async Task AddAsync(WebSessionKey key, CancellationToken ct)
    {
        await _db.WebSessionKeys.AddAsync(key, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(WebSessionKey key, CancellationToken ct)
    {
        _db.WebSessionKeys.Update(key);
        await _db.SaveChangesAsync(ct);
    }

    public async Task RevokeAllByUserAsync(Guid userId, CancellationToken ct)
        => await _db.WebSessionKeys
            .Where(k => k.UserId == userId && k.Status == "active")
            .ExecuteUpdateAsync(s => s.SetProperty(k => k.Status, "revoked"), ct);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
