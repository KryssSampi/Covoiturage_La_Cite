using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Media;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IMediaStorageService
{
    Task<Guid> CreateAsync(CreateMediaDto dto);
    Task<bool> ArchiveAsync(Guid id);
    Task<bool> RestoreAsync(Guid id);
    Task<MediaStorageResponseDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<MediaStorageResponseDto>> QueryAsync(MediaQueryParams query);

   /// <summary>
        /// Upload a new media file
        /// </summary>
        Task<MediaStorageResponseDto> UploadMediaAsync(
            CreateMediaDto createDto,
            string uploadedBy,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Get media by ID
        /// </summary>
        Task<MediaStorageResponseDto?> GetMediaAsync(Guid mediaId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Update media metadata
        /// </summary>
        Task<bool> UpdateMediaAsync(Guid mediaId, UpdateMediaDto updateDto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Archive media (soft delete with retention)
        /// </summary>
        Task<bool> ArchiveMediaAsync(Guid mediaId, ArchiveMediaDto archiveDto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Restore archived media
        /// </summary>
        Task<bool> RestoreMediaAsync(Guid mediaId, RestoreMediaDto restoreDto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Permanently delete media (hard delete)
        /// </summary>
        Task<bool> DeleteMediaPermanentlyAsync(Guid mediaId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Query media with filters
        /// </summary>
        Task<List<MediaStorageResponseDto>> QueryMediaAsync(
            MediaQueryParams queryParams,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Get media logs for a specific media
        /// </summary>
        Task<List<MediaLogDto>> GetMediaLogsAsync(Guid mediaId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Get logs by sector
        /// </summary>
        Task<List<MediaLogDto>> GetLogsBySectorAsync(string sector, int limit = 100, CancellationToken cancellationToken = default);

        /// <summary>
        /// Archive old media automatically (maintenance job)
        /// </summary>
        Task<int> ArchiveOldMediaAsync(DateTimeOffset olderThan, CancellationToken cancellationToken = default);

        /// <summary>
        /// Clean up permanently deleted media files (maintenance job)
        /// </summary>
        Task<int> CleanupDeletedMediaAsync(CancellationToken cancellationToken = default);
    }

