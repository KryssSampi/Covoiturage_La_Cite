using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Admin;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IAdminService
{
    // Dashboard
    Task<PlatformStatsDto> GetDashboardStatsAsync(CancellationToken ct = default);
    /// <summary>
    /// Statistiques publiques de la plateforme (sans auth) — utilisé par la page About.
    /// </summary>
    Task<PlatformStatsDto> GetPublicPlatformStatsAsync(CancellationToken ct = default);

    // User Management
    Task SuspendUserAsync(Guid adminId, Guid userId, string reason, CancellationToken ct = default);
    Task UnsuspendUserAsync(Guid adminId, Guid userId, CancellationToken ct = default);
    Task BanUserAsync(Guid adminId, Guid userId, string reason, CancellationToken ct = default);

    // Report Management
    Task<ReportAdminDto> AssignReportAsync(Guid adminId, Guid reportId, CancellationToken ct = default);
    Task<ReportAdminDto> ResolveReportAsync(Guid adminId, Guid reportId, string note, string resolution, CancellationToken ct = default);

    // Platform Config
    Task<IEnumerable<PlatformConfigDto>> GetAllConfigAsync(CancellationToken ct = default);
    Task<PlatformConfigDto> SetConfigAsync(Guid adminId, SetConfigDto dto, CancellationToken ct = default);

    // Audit Log
    Task<IEnumerable<AuditLogDto>> GetRecentAuditLogsAsync(int count = 50, CancellationToken ct = default);
    Task<IEnumerable<AuditLogDto>> GetAuditLogsByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default);

    // Simulation (admin only — outil de test)
    Task<SimulateEventResultDto> SimulateEventAsync(Guid adminId, SimulateEventRequestDto dto, CancellationToken ct = default);

    // Helpers
    Task LogAuditAsync(Guid? actorId, string actorRole, string action, string entityType, Guid? entityId,
        string? previousValue = null, string? newValue = null, string? ip = null, string? userAgent = null, CancellationToken ct = default);
}
