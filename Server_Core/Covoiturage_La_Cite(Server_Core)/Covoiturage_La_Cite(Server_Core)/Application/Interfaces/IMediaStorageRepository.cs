using Covoiturage_La_Cite_Server_Core_.Domain.Entities;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

    /// <summary>
    /// Repository for managing MediaStorage entities
    /// </summary>
    public interface IMediaStorageRepository
    {
        Task<MediaStorage?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<MediaStorage>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<List<MediaStorage>> QueryAsync(
            string? sector = null,
            string? mediaType = null,
            string? ownerId = null,
            string? ownerType = null,
            string? archiveStatus = null,
            string? uploadedBy = null,
            DateTimeOffset? dateFrom = null,
            DateTimeOffset? dateTo = null,
            string? search = null,
            CancellationToken cancellationToken = default);
        Task<MediaStorage> AddAsync(MediaStorage media, CancellationToken cancellationToken = default);
        Task<MediaStorage> UpdateAsync(MediaStorage media, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<int> CountAsync(CancellationToken cancellationToken = default);
        Task<int> ArchiveOldMediaAsync(DateTimeOffset olderThan, CancellationToken cancellationToken = default);
        Task<int> DeletePermanentlyAsync(DateTimeOffset olderThan, CancellationToken cancellationToken = default);
    }