using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Admin;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepo;
    private readonly IReportRepository _reportRepo;
    private readonly IPlatformConfigRepository _configRepo;
    private readonly IAuditLogRepository _auditRepo;
    private readonly IPlatformStatsRepository _statsRepo;
    private readonly ILogger<AdminService> _logger;

    public AdminService(
        IUserRepository userRepo,
        IReportRepository reportRepo,
        IPlatformConfigRepository configRepo,
        IAuditLogRepository auditRepo,
        IPlatformStatsRepository statsRepo,
        ILogger<AdminService> logger)
    {
        _userRepo = userRepo;
        _reportRepo = reportRepo;
        _configRepo = configRepo;
        _auditRepo = auditRepo;
        _statsRepo = statsRepo;
        _logger = logger;
    }

    // ── Dashboard ────────────────────────────────────────────────────────────

    public async Task<PlatformStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var stats = await _statsRepo.GetLatestAsync(ct);
        if (stats == null)
            return new PlatformStatsDto { ComputedAt = DateTimeOffset.UtcNow };

        return new PlatformStatsDto
        {
            TotalUsers = stats.TotalUsers,
            ActiveUsersLast30Days = stats.ActiveUsersLast30Days,
            TotalTrips = stats.TotalTrips,
            TripsToday = stats.TripsToday,
            TripsThisMonth = stats.TripsThisMonth,
            TotalCo2SavedKg = stats.TotalCo2SavedKg,
            TotalRevenuePlatform = stats.TotalRevenuePlatform,
            PendingReports = stats.PendingReports,
            PendingDriverApplications = stats.PendingDriverApplications,
            ComputedAt = stats.ComputedAt
        };
    }

    // ── User Management ──────────────────────────────────────────────────────

    public async Task SuspendUserAsync(Guid adminId, Guid userId, string reason, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        var previousStatus = user.Status.ToString();
        user.Status = UserStatus.Suspended;
        await _userRepo.UpdateAsync(user, ct);

        await LogAuditAsync(adminId, "admin", "user.suspend", "User", userId,
            previousStatus, "Suspended", ct: ct);
        _logger.LogWarning("Utilisateur {UserId} suspendu par admin {AdminId}: {Reason}", userId, adminId, reason);
    }

    public async Task UnsuspendUserAsync(Guid adminId, Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        var previousStatus = user.Status.ToString();
        user.Status = UserStatus.Active;
        await _userRepo.UpdateAsync(user, ct);

        await LogAuditAsync(adminId, "admin", "user.unsuspend", "User", userId,
            previousStatus, "Active", ct: ct);
    }

    public async Task BanUserAsync(Guid adminId, Guid userId, string reason, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        var previousStatus = user.Status.ToString();
        user.Status = UserStatus.Banned;
        await _userRepo.UpdateAsync(user, ct);

        await LogAuditAsync(adminId, "admin", "user.ban", "User", userId,
            previousStatus, "Banned", ct: ct);
        _logger.LogWarning("Utilisateur {UserId} banni par admin {AdminId}: {Reason}", userId, adminId, reason);
    }

    // ── Report Management ────────────────────────────────────────────────────

    public async Task<ReportAdminDto> AssignReportAsync(Guid adminId, Guid reportId, CancellationToken ct = default)
    {
        var report = await _reportRepo.GetByIdAsync(reportId, ct)
            ?? throw new KeyNotFoundException("Signalement introuvable");

        report.AssignedAdminId = adminId;
        report.Status = "in_review";
        await _reportRepo.UpdateAsync(report, ct);

        await LogAuditAsync(adminId, "admin", "report.assign", "Report", reportId, ct: ct);
        return MapReport(report);
    }

    public async Task<ReportAdminDto> ResolveReportAsync(Guid adminId, Guid reportId, string note, string resolution, CancellationToken ct = default)
    {
        var report = await _reportRepo.GetByIdAsync(reportId, ct)
            ?? throw new KeyNotFoundException("Signalement introuvable");

        report.Status = resolution; // resolved | dismissed | escalated
        report.AdminNote = note;
        report.ResolvedAt = DateTimeOffset.UtcNow;
        await _reportRepo.UpdateAsync(report, ct);

        await LogAuditAsync(adminId, "admin", "report.resolve", "Report", reportId,
            newValue: resolution, ct: ct);
        return MapReport(report);
    }

    // ── Platform Config ──────────────────────────────────────────────────────

    public async Task<IEnumerable<PlatformConfigDto>> GetAllConfigAsync(CancellationToken ct = default)
    {
        var configs = await _configRepo.GetAllAsync(ct);
        return configs.Select(MapConfig);
    }

    public async Task<PlatformConfigDto> SetConfigAsync(Guid adminId, SetConfigDto dto, CancellationToken ct = default)
    {
        var config = new PlatformConfig
        {
            Key = dto.Key,
            Value = dto.Value,
            DataType = dto.DataType,
            Category = dto.Category,
            Description = dto.Description,
            LastModifiedByAdminId = adminId,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _configRepo.UpsertAsync(config, ct);
        await LogAuditAsync(adminId, "admin", "config.update", "PlatformConfig", null,
            newValue: $"{dto.Key}={dto.Value}", ct: ct);
        return MapConfig(config);
    }

    // ── Audit Log ────────────────────────────────────────────────────────────

    public async Task<IEnumerable<AuditLogDto>> GetRecentAuditLogsAsync(int count = 50, CancellationToken ct = default)
    {
        var logs = await _auditRepo.GetRecentAsync(count, ct);
        return logs.Select(MapAuditLog);
    }

    public async Task<IEnumerable<AuditLogDto>> GetAuditLogsByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default)
    {
        var logs = await _auditRepo.GetByEntityAsync(entityType, entityId, ct);
        return logs.Select(MapAuditLog);
    }

    public async Task LogAuditAsync(Guid? actorId, string actorRole, string action, string entityType, Guid? entityId,
        string? previousValue = null, string? newValue = null, string? ip = null, string? userAgent = null, CancellationToken ct = default)
    {
        var log = new AuditLog
        {
            ActorId = actorId,
            ActorRole = actorRole,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            PreviousValueJson = previousValue,
            NewValueJson = newValue,
            IpAddress = ip,
            UserAgent = userAgent,
            CreatedAt = DateTimeOffset.UtcNow
        };
        await _auditRepo.AddAsync(log, ct);
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private static PlatformConfigDto MapConfig(PlatformConfig c) => new()
    {
        Key = c.Key, Value = c.Value, DataType = c.DataType,
        Category = c.Category, Description = c.Description, UpdatedAt = c.UpdatedAt
    };

    private static AuditLogDto MapAuditLog(AuditLog l) => new()
    {
        Id = l.Id, ActorId = l.ActorId, ActorRole = l.ActorRole,
        Action = l.Action, EntityType = l.EntityType, EntityId = l.EntityId,
        PreviousValueJson = l.PreviousValueJson, NewValueJson = l.NewValueJson,
        CreatedAt = l.CreatedAt
    };

    private static ReportAdminDto MapReport(Report r) => new()
    {
        Id = r.Id, PublicReference = r.PublicReference,
        Category = r.Category.ToString(), SeverityLevel = r.SeverityLevel,
        Description = r.Description, Status = r.Status,
        AssignedAdminId = r.AssignedAdminId, AdminNote = r.AdminNote,
        CreatedAt = r.CreatedAt, ResolvedAt = r.ResolvedAt
    };
}
