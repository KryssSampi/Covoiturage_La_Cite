namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

/// <summary>
/// Represents a stored media file (image, video, document, etc.)
/// </summary>
public class MediaStorage
{
    /// <summary>
    /// Unique identifier for the media
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Original filename provided by the user
    /// </summary>
    public string OriginalFileName { get; set; } = string.Empty;

    /// <summary>
    /// Stored filename on disk/cloud (unique)
    /// </summary>
    public string StoredFileName { get; set; } = string.Empty;

    /// <summary>
    /// MIME type of the media (image/jpeg, video/mp4, application/pdf, etc.)
    /// </summary>
    public string MimeType { get; set; } = string.Empty;

    /// <summary>
    /// Size of the file in bytes
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// URL or path to access the media
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Sector/category this media belongs to (e.g., Profile, Trip, Document, Chat, etc.)
    /// </summary>
    public string Sector { get; set; } = string.Empty;

    /// <summary>
    /// Type of media (Image, Video, Document, Audio, etc.)
    /// </summary>
    public string MediaType { get; set; } = string.Empty;

    /// <summary>
    /// ID of the entity that owns this media (user ID, trip ID, etc.)
    /// </summary>
    public string? OwnerId { get; set; }

    /// <summary>
    /// Type of owner (User, Trip, Vehicle, etc.)
    /// </summary>
    public string? OwnerType { get; set; }

    /// <summary>
    /// Current status (Active, Archived, Deleted)
    /// </summary>
    public string ArchiveStatus { get; set; } = "Active";

    /// <summary>
    /// Date and time when the media was uploaded
    /// </summary>
    public DateTimeOffset UploadedAt { get; set; }

    /// <summary>
    /// User ID who uploaded the media
    /// </summary>
    public string? UploadedBy { get; set; }

    /// <summary>
    /// Date and time when the media was archived (if applicable)
    /// </summary>
    public DateTimeOffset? ArchivedAt { get; set; }

    /// <summary>
    /// Reason for archiving (if applicable)
    /// </summary>
    public string? ArchiveReason { get; set; }

    /// <summary>
    /// Additional metadata (JSON format)
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Date and time when the record was created
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Date and time when the record was last updated
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }
}
