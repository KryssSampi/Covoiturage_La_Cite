using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class DriverDocument
{
    public Guid Id { get; set; }
    public Guid DriverProfileId { get; set; }
    public DocumentType DocumentType { get; set; }
    public string FileUrl { get; set; } = null!;        // CDN restricted
    public DateOnly? ExpiryDate { get; set; }
    public string Status { get; set; } = "pending";     // pending | approved | rejected | expired
    public DateTimeOffset SubmittedAt { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? AdminNote { get; set; }

    // Navigation
    public DriverProfile DriverProfile { get; set; } = null!;
}
