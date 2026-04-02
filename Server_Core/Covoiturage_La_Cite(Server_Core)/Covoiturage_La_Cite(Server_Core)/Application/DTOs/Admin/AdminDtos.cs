namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Admin;

public class PlatformStatsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsersLast30Days { get; set; }
    public int TotalTrips { get; set; }
    public int TripsToday { get; set; }
    public int TripsThisMonth { get; set; }
    public decimal TotalCo2SavedKg { get; set; }
    public decimal TotalRevenuePlatform { get; set; }
    public int PendingReports { get; set; }
    public int PendingDriverApplications { get; set; }
    public DateTimeOffset ComputedAt { get; set; }
}

public class PlatformConfigDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class SetConfigDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
}

public class AuditLogDto
{
    public long Id { get; set; }
    public Guid? ActorId { get; set; }
    public string ActorRole { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string? PreviousValueJson { get; set; }
    public string? NewValueJson { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class ReportAdminDto
{
    public Guid Id { get; set; }
    public string PublicReference { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string SeverityLevel { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? AssignedAdminId { get; set; }
    public string? AdminNote { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }
}
