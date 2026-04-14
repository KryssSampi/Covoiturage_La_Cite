namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

/// <summary>
/// Log entries for media operations, categorized by sector
/// </summary>
public class MediaLog
{
    /// <summary>
    /// Unique identifier for the log entry
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// ID of the media file this log refers to
    /// </summary>
    public Guid MediaId { get; set; }

    /// <summary>
    /// Sector/category of the media (Profile, Trip, Document, Chat, etc.)
    /// </summary>
    public string Sector { get; set; } = string.Empty;

    /// <summary>
    /// Type of operation (Upload, Download, Delete, Archive, Restore, etc.)
    /// </summary>
    public string Operation { get; set; } = string.Empty;

    /// <summary>
    /// Result of the operation (Success, Failure, Warning)
    /// </summary>
    public string Result { get; set; } = string.Empty;

    /// <summary>
    /// User ID who performed the operation
    /// </summary>
    public string? UserId { get; set; }

    /// <summary>
    /// IP address of the requester
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// User agent of the requester
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Detailed message about the operation
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Error details if operation failed
    /// </summary>
    public string? ErrorDetails { get; set; }

    /// <summary>
    /// Additional context data (JSON format)
    /// </summary>
    public string? ContextData { get; set; }

    /// <summary>
    /// Duration of the operation in milliseconds
    /// </summary>
    public int? DurationMs { get; set; }

    /// <summary>
    /// Date and time when the log entry was created
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
