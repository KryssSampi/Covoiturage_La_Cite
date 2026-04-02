using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Report
{
    public Guid Id { get; set; }
    public string PublicReference { get; set; } = string.Empty;
    public Guid TripId { get; set; }
    public Guid ReporterId { get; set; }
    public Guid? ReportedUserId { get; set; }
    public ReportCategory Category { get; set; }
    public string SeverityLevel { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string[] EvidenceUrls { get; set; } = [];
    public string? GpsTraceSnapshot { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? AssignedAdminId { get; set; }
    public string? AdminNote { get; set; }
    public bool AutoPrevBlockUser { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }

    public Trip Trip { get; set; } = null!;
    public User Reporter { get; set; } = null!;
    public User? ReportedUser { get; set; }
}
