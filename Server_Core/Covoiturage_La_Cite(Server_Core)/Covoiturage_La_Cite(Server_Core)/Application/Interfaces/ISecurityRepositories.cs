using Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

// ── ClientCertificate ───────────────────────────────────────────────────────
public interface IClientCertificateRepository
{
    Task<ClientCertificate?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ClientCertificate?> GetByUserAndDeviceAsync(Guid userId, string deviceFingerprint, CancellationToken ct = default);
    Task<List<ClientCertificate>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<ClientCertificate?> GetActiveByUserAndDeviceAsync(Guid userId, string deviceFingerprint, CancellationToken ct = default);
    Task AddAsync(ClientCertificate cert, CancellationToken ct = default);
    Task UpdateAsync(ClientCertificate cert, CancellationToken ct = default);
    /// <summary>Met HasGotNewPublicKey = false pour TOUS les certificats actifs (rotation globale).</summary>
    Task<int> ResetAllHasGotNewPublicKeyAsync(CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

// ── UserSecurityActivity ────────────────────────────────────────────────────
public interface IUserSecurityActivityRepository
{
    Task AddAsync(UserSecurityActivity activity, CancellationToken ct = default);
    Task<List<UserSecurityActivity>> GetRecentByUserAsync(Guid userId, int count = 50, CancellationToken ct = default);
    Task<int> CountFailedLast24hAsync(Guid userId, CancellationToken ct = default);
    Task<UserSecurityActivity?> GetLastSuccessfulAsync(Guid userId, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

// ── CertificateRotationEvent ────────────────────────────────────────────────
public interface ICertificateRotationEventRepository
{
    Task AddAsync(CertificateRotationEvent evt, CancellationToken ct = default);
    Task<CertificateRotationEvent?> GetLatestAsync(CancellationToken ct = default);
    Task<List<CertificateRotationEvent>> GetRecentAsync(int count = 20, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

// ── WebSessionKey ───────────────────────────────────────────────────────────
public interface IWebSessionKeyRepository
{
    Task<WebSessionKey?> GetActiveByUserAsync(Guid userId, CancellationToken ct = default);
    Task<WebSessionKey?> GetByKeyHashAsync(string keyHash, CancellationToken ct = default);
    Task AddAsync(WebSessionKey key, CancellationToken ct = default);
    Task UpdateAsync(WebSessionKey key, CancellationToken ct = default);
    Task RevokeAllByUserAsync(Guid userId, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

// ── AuthSession ─────────────────────────────────────────────────────────────
public interface IAuthSessionRepository
{
    Task<AuthSession?> GetByIdKeyHashAsync(string idKeyHash, CancellationToken ct = default);
    Task<AuthSession?> GetByPublicIdAsync(string publicId, CancellationToken ct = default);
    Task<AuthSession?> GetByRefreshTokenHashAsync(string refreshTokenHash, CancellationToken ct = default);
    Task AddAsync(AuthSession session, CancellationToken ct = default);
    Task UpdateAsync(AuthSession session, CancellationToken ct = default);
    Task DeleteExpiredAsync(CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
