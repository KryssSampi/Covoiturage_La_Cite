using Covoiturage_La_Cite_Server_Core_.Domain.Entities;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

    /// <summary>
    /// Repository for managing MediaLog entities
    /// </summary>
    public interface IMediaLogRepository
    {
        Task<MediaLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<MediaLog>> GetByMediaIdAsync(Guid mediaId, CancellationToken cancellationToken = default);
        Task<List<MediaLog>> GetBySectorAsync(string sector, int limit = 100, CancellationToken cancellationToken = default);
        Task<List<MediaLog>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<MediaLog> AddAsync(MediaLog log, CancellationToken cancellationToken = default);
        Task<int> AddRangeAsync(IEnumerable<MediaLog> logs, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<int> DeleteByMediaIdAsync(Guid mediaId, CancellationToken cancellationToken = default);
        Task<int> DeleteOlderThanAsync(DateTimeOffset olderThan, CancellationToken cancellationToken = default);
        Task<int> CountAsync(CancellationToken cancellationToken = default);
    }

