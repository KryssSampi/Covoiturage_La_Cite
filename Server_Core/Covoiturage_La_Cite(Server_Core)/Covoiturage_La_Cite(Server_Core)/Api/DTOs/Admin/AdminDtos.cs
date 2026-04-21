namespace Covoiturage_La_Cite_Server_Core_.Api.DTOs.Admin;

public record AdminStatsDto(
    int ActiveUsers,
    int TripsToday,
    int PendingDrivers,
    int OpenReports,
    decimal TotalCO2SavedKg
);

public class AdminUserDto
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string Nom { get; set; } = "";
    public string Prenom { get; set; } = "";
    public string Role { get; set; } = "";
    public string Status { get; set; } = "Active";
    public string CreatedAt { get; set; } = "";
}

public class PendingDriverDto
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string Nom { get; set; } = "";
    public string Prenom { get; set; } = "";
    public int TotalTrajets { get; set; }
    public string CreatedAt { get; set; } = "";
}

public class ReportDto
{
    public string Id { get; set; } = "";
    public string UserId { get; set; } = "";
    public string ReportedUserId { get; set; } = "";
    public string Category { get; set; } = "";
    public string Description { get; set; } = "";
    public string Status { get; set; } = "";
    public string Severity { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public string? ResolvedAt { get; set; }
}

public class AuditLogDto
{
    public string Id { get; set; } = "";
    public string Action { get; set; } = "";
    public string Date { get; set; } = "";
    public string AdminEmail { get; set; } = "";
    public string Severity { get; set; } = "";
}

public class PlatformAnalyticsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsersToday { get; set; }
    public int ActiveUsersWeek { get; set; }
    public int TotalTrips { get; set; }
    public int TripsToday { get; set; }
    public double TotalRevenue { get; set; }
    public double TotalCO2Saved { get; set; }
    public double AverageRating { get; set; }
    public int PendingApprovals { get; set; }
    public int ReportedIssues { get; set; }
    public double UserGrowthRate { get; set; }
    public double TripGrowthRate { get; set; }
}

public record TimeSeriesDto(string Date, int Value, string Label);

public class FinanceDataDto
{
    public double TotalRevenue { get; set; }
    public int TotalTransactions { get; set; }
    public double PlatformShare { get; set; }
    public double DriverShare { get; set; }
    public double AverageTransactionValue { get; set; }
    public int PendingPayouts { get; set; }
    public int FailedTransactions { get; set; }
}

public class TransactionDto
{
    public string Id { get; set; } = "";
    public string ReservationId { get; set; } = "";
    public string DriverId { get; set; } = "";
    public string PassengerId { get; set; } = "";
    public double Amount { get; set; }
    public double DriverShare { get; set; }
    public double PlatformShare { get; set; }
    public string Status { get; set; } = "";
    public string PaymentMethod { get; set; } = "";
    public string CreatedAt { get; set; } = "";
}

public class PenaltyDto
{
    public string Id { get; set; } = "";
    public string UserId { get; set; } = "";
    public string Reason { get; set; } = "";
    public double Amount { get; set; }
    public string Status { get; set; } = "";
    public string CreatedAt { get; set; } = "";
}

public class ModerationItemDto
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string ContentId { get; set; } = "";
    public string ReportedBy { get; set; } = "";
    public string Reason { get; set; } = "";
    public string Status { get; set; } = "";
    public string Content { get; set; } = "";
    public string CreatedAt { get; set; } = "";
}

public class ChatMessageDto
{
    public string Id { get; set; } = "";
    public string TripId { get; set; } = "";
    public string SenderId { get; set; } = "";
    public string SenderEmail { get; set; } = "";
    public string Message { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public bool IsReported { get; set; }
}

public class ComplianceStatusDto
{
    public int ConsentCollected { get; set; }
    public int ConsentPending { get; set; }
    public int ExportRequests { get; set; }
    public int AnonymizationRequests { get; set; }
    public string LastAuditDate { get; set; } = "";
    public string LastReportGenerated { get; set; } = "";
}

public class UserExportDto
{
    public string UserId { get; set; } = "";
    public string Email { get; set; } = "";
    public string Status { get; set; } = "";
    public string RequestedAt { get; set; } = "";
    public string ExpiresAt { get; set; } = "";
    public string? DownloadUrl { get; set; }
}

public class ExportDto
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string? Format { get; set; }
    public string Status { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public string? ExpiresAt { get; set; }
    public string? DownloadUrl { get; set; }
}

public class PlatformSettingsDto
{
    public string Id { get; set; } = "";
    public string SmtpHost { get; set; } = "";
    public int SmtpPort { get; set; }
    public List<string> CorsOrigins { get; set; } = new();
    public int JwtExpiration { get; set; }
    public int MaxLoginAttempts { get; set; }
    public int RateLimitPerMinute { get; set; }
    public string PlatformName { get; set; } = "";
    public bool MaintenanceMode { get; set; }
}

// ---- Request models ----
public record SuspendUserRequest(string Reason);
public record UpdateReportStatusRequest(string Status, string? Notes);
public record DismissReportRequest(string Reason);
public record ModerationActionRequest(string? Notes);
public record RemoveModerationRequest(string Reason);
public record WavePenaltyRequest(string Reason);
public record FinanceReportRequest(string StartDate, string EndDate);
public record AnonymizeUserRequest(string Reason);
public record ToggleMaintenanceRequest(bool Enabled);
public record CreateExportRequest(string Type, string Format);

public class UpdateSettingsRequest
{
    public string? SmtpHost { get; set; }
    public int? SmtpPort { get; set; }
    public List<string>? CorsOrigins { get; set; }
    public int? JwtExpiration { get; set; }
    public int? MaxLoginAttempts { get; set; }
    public int? RateLimitPerMinute { get; set; }
    public string? PlatformName { get; set; }
    public bool? MaintenanceMode { get; set; }
}
