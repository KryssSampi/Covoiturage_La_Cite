using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Media;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Media;

public class MediaStorageService : IMediaStorageService
{
    private readonly IMediaStorageRepository _mediaRepository;
    private readonly IMediaLogRepository _logRepository;
    private readonly ILogger<MediaStorageService> _logger;

    public MediaStorageService(
        IMediaStorageRepository mediaRepository,
        IMediaLogRepository logRepository,
        ILogger<MediaStorageService> logger)
    {
        _mediaRepository = mediaRepository;
        _logRepository = logRepository;
        _logger = logger;
    }

    // ── Legacy API (sans CancellationToken) ───────────────────────────────────

    public async Task<Guid> CreateAsync(CreateMediaDto dto)
    {
        var result = await UploadMediaAsync(dto, "system");
        return result.Id;
    }

    public async Task<bool> ArchiveAsync(Guid id)
        => await ArchiveMediaAsync(id, new ArchiveMediaDto { ArchiveReason = "manual" });

    public async Task<bool> RestoreAsync(Guid id)
        => await RestoreMediaAsync(id, new RestoreMediaDto());

    public async Task<MediaStorageResponseDto?> GetByIdAsync(Guid id)
        => await GetMediaAsync(id);

    public async Task<IEnumerable<MediaStorageResponseDto>> QueryAsync(MediaQueryParams query)
        => await QueryMediaAsync(query);

    // ── Upload ────────────────────────────────────────────────────────────────

    public async Task<MediaStorageResponseDto> UploadMediaAsync(
        CreateMediaDto createDto,
        string uploadedBy,
        CancellationToken cancellationToken = default)
    {
        var mediaId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        var media = new MediaStorage
        {
            Id = mediaId,
            OriginalFileName = createDto.OriginalFileName,
            StoredFileName = $"{mediaId}{Path.GetExtension(createDto.OriginalFileName)}",
            MimeType = createDto.MimeType,
            FileSize = createDto.FileSize,
            Url = createDto.Url,
            Sector = createDto.Sector,
            MediaType = DetermineMediaType(createDto.MimeType).ToString(),
            OwnerId = createDto.OwnerId,
            OwnerType = createDto.OwnerType,
            ArchiveStatus = "Active",
            UploadedAt = now,
            UploadedBy = uploadedBy,
            CreatedAt = now,
            UpdatedAt = now,
            Metadata = createDto.Metadata,
        };

        await _mediaRepository.AddAsync(media, cancellationToken);
        await LogAsync(mediaId, createDto.Sector, "Upload", "Success", uploadedBy, $"Uploaded: {createDto.OriginalFileName}", cancellationToken);

        return MapToDto(media);
    }

    // ── Get ───────────────────────────────────────────────────────────────────

    public async Task<MediaStorageResponseDto?> GetMediaAsync(Guid mediaId, CancellationToken cancellationToken = default)
    {
        var media = await _mediaRepository.GetByIdAsync(mediaId, cancellationToken);
        if (media == null || string.Equals(media.ArchiveStatus, "Deleted", StringComparison.OrdinalIgnoreCase))
            return null;
        return MapToDto(media);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public async Task<bool> UpdateMediaAsync(Guid mediaId, UpdateMediaDto updateDto, CancellationToken cancellationToken = default)
    {
        var media = await _mediaRepository.GetByIdAsync(mediaId, cancellationToken);
        if (media == null) return false;

        if (updateDto.OriginalFileName != null) media.OriginalFileName = updateDto.OriginalFileName;
        if (updateDto.Url != null) media.Url = updateDto.Url;
        if (updateDto.Sector != null) media.Sector = updateDto.Sector;
        if (updateDto.OwnerId != null) media.OwnerId = updateDto.OwnerId;
        if (updateDto.OwnerType != null) media.OwnerType = updateDto.OwnerType;
        if (updateDto.Metadata != null) media.Metadata = updateDto.Metadata;
        media.UpdatedAt = DateTimeOffset.UtcNow;

        await _mediaRepository.UpdateAsync(media, cancellationToken);
        return true;
    }

    // ── Archive ───────────────────────────────────────────────────────────────

    public async Task<bool> ArchiveMediaAsync(Guid mediaId, ArchiveMediaDto archiveDto, CancellationToken cancellationToken = default)
    {
        var media = await _mediaRepository.GetByIdAsync(mediaId, cancellationToken);
        if (media == null) return false;

        media.ArchiveStatus = "Archived";
        media.ArchivedAt = DateTimeOffset.UtcNow;
        media.ArchiveReason = archiveDto.ArchiveReason;
        media.UpdatedAt = DateTimeOffset.UtcNow;

        await _mediaRepository.UpdateAsync(media, cancellationToken);
        await LogAsync(mediaId, media.Sector, "Archive", "Success", null, archiveDto.ArchiveReason, cancellationToken);
        return true;
    }

    // ── Restore ───────────────────────────────────────────────────────────────

    public async Task<bool> RestoreMediaAsync(Guid mediaId, RestoreMediaDto restoreDto, CancellationToken cancellationToken = default)
    {
        var media = await _mediaRepository.GetByIdAsync(mediaId, cancellationToken);
        if (media == null) return false;

        media.ArchiveStatus = "Active";
        media.ArchivedAt = null;
        media.ArchiveReason = null;
        media.UpdatedAt = DateTimeOffset.UtcNow;

        await _mediaRepository.UpdateAsync(media, cancellationToken);
        await LogAsync(mediaId, media.Sector, "Restore", "Success", null, restoreDto.RestoreReason ?? "restored", cancellationToken);
        return true;
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public async Task<bool> DeleteMediaPermanentlyAsync(Guid mediaId, CancellationToken cancellationToken = default)
    {
        var media = await _mediaRepository.GetByIdAsync(mediaId, cancellationToken);
        if (media == null) return false;

        media.ArchiveStatus = "Deleted";
        media.UpdatedAt = DateTimeOffset.UtcNow;
        await _mediaRepository.UpdateAsync(media, cancellationToken);
        await LogAsync(mediaId, media.Sector, "Delete", "Success", null, "hard delete", cancellationToken);
        return true;
    }

    // ── Query ─────────────────────────────────────────────────────────────────

    public async Task<List<MediaStorageResponseDto>> QueryMediaAsync(MediaQueryParams queryParams, CancellationToken cancellationToken = default)
    {
        var results = await _mediaRepository.QueryAsync(
            sector: queryParams.Sector,
            mediaType: queryParams.MediaType,
            ownerId: queryParams.OwnerId,
            ownerType: queryParams.OwnerType,
            archiveStatus: queryParams.ArchiveStatus,
            cancellationToken: cancellationToken);

        return results.Select(MapToDto).ToList();
    }

    // ── Logs ──────────────────────────────────────────────────────────────────

    public async Task<List<MediaLogDto>> GetMediaLogsAsync(Guid mediaId, CancellationToken cancellationToken = default)
    {
        var logs = await _logRepository.GetByMediaIdAsync(mediaId, cancellationToken);
        return logs.Select(MapLogToDto).ToList();
    }

    public async Task<List<MediaLogDto>> GetLogsBySectorAsync(string sector, int limit = 100, CancellationToken cancellationToken = default)
    {
        var logs = await _logRepository.GetBySectorAsync(sector, limit, cancellationToken);
        return logs.Select(MapLogToDto).ToList();
    }

    // ── Maintenance ───────────────────────────────────────────────────────────

    public async Task<int> ArchiveOldMediaAsync(DateTimeOffset olderThan, CancellationToken cancellationToken = default)
    {
        var count = await _mediaRepository.ArchiveOldMediaAsync(olderThan, cancellationToken);
        _logger.LogInformation("ArchiveOldMedia: {Count} médias archivés (plus vieux que {Date})", count, olderThan);
        return count;
    }

    public async Task<int> CleanupDeletedMediaAsync(CancellationToken cancellationToken = default)
    {
        var count = await _mediaRepository.DeletePermanentlyAsync(DateTimeOffset.UtcNow, cancellationToken);
        _logger.LogInformation("CleanupDeletedMedia: {Count} médias supprimés", count);
        return count;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static MediaType DetermineMediaType(string mimeType)
    {
        if (string.IsNullOrWhiteSpace(mimeType)) return MediaType.Other;
        if (mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)) return MediaType.Image;
        if (mimeType.StartsWith("video/", StringComparison.OrdinalIgnoreCase)) return MediaType.Video;
        if (mimeType.StartsWith("audio/", StringComparison.OrdinalIgnoreCase)) return MediaType.Audio;
        if (mimeType.Contains("pdf", StringComparison.OrdinalIgnoreCase) || mimeType.Contains("document", StringComparison.OrdinalIgnoreCase)) return MediaType.Document;
        if (mimeType.Contains("zip", StringComparison.OrdinalIgnoreCase) || mimeType.Contains("compressed", StringComparison.OrdinalIgnoreCase)) return MediaType.Archive;
        return MediaType.Other;
    }

    private static MediaStorageResponseDto MapToDto(MediaStorage m) => new()
    {
        Id = m.Id,
        OriginalFileName = m.OriginalFileName,
        StoredFileName = m.StoredFileName,
        MimeType = m.MimeType,
        FileSize = m.FileSize,
        Url = m.Url,
        Sector = m.Sector,
        MediaType = m.MediaType,
        OwnerId = m.OwnerId,
        OwnerType = m.OwnerType,
        ArchiveStatus = m.ArchiveStatus,
        UploadedAt = m.UploadedAt,
        UploadedBy = m.UploadedBy,
        ArchivedAt = m.ArchivedAt,
        ArchiveReason = m.ArchiveReason,
        Metadata = m.Metadata,
        CreatedAt = m.CreatedAt,
        UpdatedAt = m.UpdatedAt,
    };

    private static MediaLogDto MapLogToDto(MediaLog l) => new()
    {
        Id = l.Id,
        MediaId = l.MediaId,
        Sector = l.Sector,
        Operation = l.Operation,
        Result = l.Result,
        UserId = l.UserId,
        IpAddress = l.IpAddress,
        UserAgent = l.UserAgent,
        Message = l.Message,
        ErrorDetails = l.ErrorDetails,
        ContextData = l.ContextData,
        DurationMs = l.DurationMs,
        CreatedAt = l.CreatedAt,
    };

    private async Task LogAsync(Guid mediaId, string sector, string operation, string result, string? userId, string message, CancellationToken ct)
    {
        try
        {
            await _logRepository.AddAsync(new MediaLog
            {
                Id = Guid.NewGuid(),
                MediaId = mediaId,
                Sector = sector,
                Operation = operation,
                Result = result,
                UserId = userId,
                Message = message,
                CreatedAt = DateTimeOffset.UtcNow,
            }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write media log for {MediaId}", mediaId);
        }
    }
}
