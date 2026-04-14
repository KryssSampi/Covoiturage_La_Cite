namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Media;

// <summary>
/// DTO for creating a new media storage entry
/// </summary>
public record CreateMediaDto
{
    /// <summary>
    /// Original filename
    /// </summary>
    public string OriginalFileName { get; init; } = string.Empty;

    /// <summary>
    /// MIME type of the file
    /// </summary>
    public string MimeType { get; init; } = string.Empty;

    /// <summary>
    /// Size of the file in bytes
    /// </summary>
    public long FileSize { get; init; }

    /// <summary>
    /// URL where the file is stored
    /// </summary>
    public string Url { get; init; } = string.Empty;

    /// <summary>
    /// Sector/category of the media
    /// </summary>
    public string Sector { get; init; } = string.Empty;

    /// <summary>
    /// Type of media (Image, Video, Document, etc.)
    /// </summary>
    public string MediaType { get; init; } = string.Empty;

    /// <summary>
    /// ID of the owner entity
    /// </summary>
    public string? OwnerId { get; init; }

    /// <summary>
    /// Type of owner (User, Trip, Vehicle, etc.)
    /// </summary>
    public string? OwnerType { get; init; }

    /// <summary>
    /// Additional metadata (JSON format)
    /// </summary>
    public string? Metadata { get; init; }
}

/// <summary>
/// DTO for updating media storage
/// </summary>
public record UpdateMediaDto
{
    /// <summary>
    /// New filename (optional)
    /// </summary>
    public string? OriginalFileName { get; init; }

    /// <summary>
    /// New URL if file moved (optional)
    /// </summary>
    public string? Url { get; init; }

    /// <summary>
    /// New sector (optional)
    /// </summary>
    public string? Sector { get; init; }

    /// <summary>
    /// New owner ID (optional)
    /// </summary>
    public string? OwnerId { get; init; }

    /// <summary>
    /// New owner type (optional)
    /// </summary>
    public string? OwnerType { get; init; }

    /// <summary>
    /// Additional metadata (JSON format, optional)
    /// </summary>
    public string? Metadata { get; init; }
}

/// <summary>
/// DTO for archiving media
/// </summary>
public record ArchiveMediaDto
{
    /// <summary>
    /// Reason for archiving
    /// </summary>
    public string ArchiveReason { get; init; } = string.Empty;
}

/// <summary>
/// DTO for restoring archived media
/// </summary>
public record RestoreMediaDto
{
    /// <summary>
    /// Reason for restoring
    /// </summary>
    public string? RestoreReason { get; init; }
}

/// <summary>
/// Response DTO for media storage
/// </summary>
public record MediaStorageResponseDto
{
    public Guid Id { get; init; }
    public string OriginalFileName { get; init; } = string.Empty;
    public string StoredFileName { get; init; } = string.Empty;
    public string MimeType { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public string Url { get; init; } = string.Empty;
    public string Sector { get; init; } = string.Empty;
    public string MediaType { get; init; } = string.Empty;
    public string? OwnerId { get; init; }
    public string? OwnerType { get; init; }
    public string ArchiveStatus { get; init; } = string.Empty;
    public DateTimeOffset UploadedAt { get; init; }
    public string? UploadedBy { get; init; }
    public DateTimeOffset? ArchivedAt { get; init; }
    public string? ArchiveReason { get; init; }
    public string? Metadata { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}

/// <summary>
/// DTO for media log entry
/// </summary>
public record MediaLogDto
{
    public Guid Id { get; init; }
    public Guid MediaId { get; init; }
    public string Sector { get; init; } = string.Empty;
    public string Operation { get; init; } = string.Empty;
    public string Result { get; init; } = string.Empty;
    public string? UserId { get; init; }
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public string Message { get; init; } = string.Empty;
    public string? ErrorDetails { get; init; }
    public string? ContextData { get; init; }
    public int? DurationMs { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

/// <summary>
/// Query parameters for filtering media
/// </summary>
public record MediaQueryParams
{
    /// <summary>
    /// Filter by sector
    /// </summary>
    public string? Sector { get; init; }

    /// <summary>
    /// Filter by media type
    /// </summary>
    public string? MediaType { get; init; }

    /// <summary>
    /// Filter by owner ID
    /// </summary>
    public string? OwnerId { get; init; }

    /// <summary>
    /// Filter by owner type
    /// </summary>
    public string? OwnerType { get; init; }

    /// <summary>
    /// Filter by archive status
    /// </summary>
    public string? ArchiveStatus { get; init; }

    /// <summary>
    /// Filter by user who uploaded
    /// </summary>
    public string? UploadedBy { get; init; }

    /// <summary>
    /// Date from (inclusive)
    /// </summary>
    public DateTimeOffset? DateFrom { get; init; }

    /// <summary>
    /// Date to (inclusive)
    /// </summary>
    public DateTimeOffset? DateTo { get; init; }

    /// <summary>
    /// Search in original filename
    /// </summary>
    public string? Search { get; init; }
}
