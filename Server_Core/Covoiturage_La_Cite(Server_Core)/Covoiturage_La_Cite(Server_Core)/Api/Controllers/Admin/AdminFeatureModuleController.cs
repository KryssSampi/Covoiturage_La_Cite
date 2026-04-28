using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminFeatureModuleController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<AdminFeatureModuleController> _logger;

    public AdminFeatureModuleController(AppDbContext db, ILogger<AdminFeatureModuleController> logger)
    {
        _db = db;
        _logger = logger;
    }

    // Stats/Dashboard
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var sevenDaysAgo = DateTimeOffset.UtcNow.AddDays(-7);

        var stats = new AdminStatsVm
        {

            ActiveUsers = await _db.Users.CountAsync(u => u.Status == UserStatus.Active, ct),
            TripsToday = await _db.Trips.CountAsync(t => t.DepartureDate == today, ct),
            PendingDrivers = await _db.DriverProfiles.CountAsync(p => p.ValidationStatus == DriverValidationStatus.Pending, ct),
            OpenReports = await _db.Reports.CountAsync(r =>
                                                         r.Status != null &&
                                                         (r.Status.Trim().ToLower() == "open" ||
                                                          r.Status.Trim().ToLower() == "inreview" ||
                                                          r.Status.Trim().ToLower() == "in_review"), ct),
            TotalCO2SavedKg = await _db.DriverProfiles.SumAsync(p => (decimal?)p.Co2SavedKg, ct) ?? 0m
        };

        _logger.LogInformation(
            "Admin stats requested by {AdminId} ({ActiveUsers} users, {TripsToday} trips today).",
            GetUid(),
            stats.ActiveUsers,
            stats.TripsToday
        );

        return Ok(ApiResponse<AdminStatsVm>.Ok(stats));
    }

    // Users
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
    {
        var users = await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserVm
            {
                Id = u.Id.ToString(),
                Email = u.Email,
                Status = u.Status == UserStatus.Active ? "Active" : "Suspended"
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<AdminUserVm>>.Ok(users));
    }

    [HttpPut("users/{id:guid}/suspend")]
    public async Task<IActionResult> SuspendUser(Guid id, [FromBody] SuspendUserRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null) return NotFound(ApiResponse.NotFound("Utilisateur introuvable"));

        user.Status = UserStatus.Suspended;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        await AddAuditAsync("user.suspend", "User", id, request.Reason, ct);
        return Ok(ApiResponse.Ok("Utilisateur suspendu"));
    }

    [HttpPut("users/{id:guid}/reactivate")]
    public async Task<IActionResult> ReactivateUser(Guid id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null) return NotFound(ApiResponse.NotFound("Utilisateur introuvable"));

        user.Status = UserStatus.Active;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        await AddAuditAsync("user.reactivate", "User", id, null, ct);
        return Ok(ApiResponse.Ok("Utilisateur réactivé"));
    }

    // Drivers
    [HttpGet("drivers/pending")]
    public async Task<IActionResult> GetPendingDrivers(CancellationToken ct)
    {
        var drivers = await _db.DriverProfiles
            .Include(p => p.User)
            .Where(p => p.ValidationStatus == DriverValidationStatus.Pending)
            .OrderByDescending(p => p.User.CreatedAt)
            .Select(p => new PendingDriverVm
            {
                Id = p.UserId.ToString(),
                Email = p.User.Email
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<PendingDriverVm>>.Ok(drivers));
    }

    [HttpPut("drivers/{id:guid}/approve")]
    public async Task<IActionResult> ApproveDriver(Guid id, CancellationToken ct)
    {
        var profile = await _db.DriverProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == id, ct);

        if (profile == null) return NotFound(ApiResponse.NotFound("Profil conducteur introuvable"));

        profile.ValidationStatus = DriverValidationStatus.Approved;
        profile.ValidatedAt = DateTimeOffset.UtcNow;
        profile.ValidatedByAdminId = GetUid();
        profile.RejectionReason = null;
        profile.User.CanBeDriver = true;

        await _db.SaveChangesAsync(ct);
        await AddAuditAsync("driver.approve", "DriverProfile", profile.Id, null, ct);
        return Ok(ApiResponse.Ok("Conducteur approuvé"));
    }

    [HttpPut("drivers/{id:guid}/reject")]
    public async Task<IActionResult> RejectDriver(Guid id, [FromQuery] string? reason, CancellationToken ct)
    {
        var profile = await _db.DriverProfiles
            .FirstOrDefaultAsync(p => p.UserId == id, ct);

        if (profile == null) return NotFound(ApiResponse.NotFound("Profil conducteur introuvable"));

        profile.ValidationStatus = DriverValidationStatus.Rejected;
        profile.ValidatedAt = DateTimeOffset.UtcNow;
        profile.ValidatedByAdminId = GetUid();
        profile.RejectionReason = string.IsNullOrWhiteSpace(reason) ? "Documents invalides" : reason;

        await _db.SaveChangesAsync(ct);
        await AddAuditAsync("driver.reject", "DriverProfile", profile.Id, profile.RejectionReason, ct);
        return Ok(ApiResponse.Ok("Conducteur rejeté"));
    }

    // Reports
    [HttpGet("reports")]
    public async Task<IActionResult> GetReports(CancellationToken ct)
    {
        var reports = await _db.Reports
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReportVm
            {
                Id = r.Id.ToString(),
                UserId = r.ReporterId.ToString(),
                ReportedUserId = r.ReportedUserId.HasValue ? r.ReportedUserId.Value.ToString() : Guid.Empty.ToString(),
                Category = r.Category.ToString(),
                Description = r.Description,
                Status = NormalizeReportStatus(r.Status),
                Severity = NormalizeSeverity(r.SeverityLevel),
                CreatedAt = r.CreatedAt,
                ResolvedAt = r.ResolvedAt
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<ReportVm>>.Ok(reports));
    }

    [HttpPut("reports/{id:guid}/status")]
    public async Task<IActionResult> UpdateReportStatus(Guid id, [FromBody] UpdateReportStatusRequest request, CancellationToken ct)
    {
        var report = await _db.Reports.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (report == null) return NotFound(ApiResponse.NotFound("Signalement introuvable"));

        report.Status = ToStoredReportStatus(request.Status);
        report.AdminNote = request.Notes;
        if (string.Equals(report.Status, "resolved", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(report.Status, "dismissed", StringComparison.OrdinalIgnoreCase))
        {
            report.ResolvedAt = DateTimeOffset.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        await AddAuditAsync("report.update_status", "Report", id, request.Status, ct);
        return Ok(ApiResponse.Ok("Statut du signalement mis à jour"));
    }

    [HttpPut("reports/{id:guid}/dismiss")]
    public async Task<IActionResult> DismissReport(Guid id, [FromBody] DismissReportRequest request, CancellationToken ct)
    {
        var report = await _db.Reports.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (report == null) return NotFound(ApiResponse.NotFound("Signalement introuvable"));

        report.Status = "dismissed";
        report.AdminNote = request.Reason;
        report.ResolvedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        await AddAuditAsync("report.dismiss", "Report", id, request.Reason, ct);
        return Ok(ApiResponse.Ok("Signalement rejeté"));
    }

    // Vehicles
    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles(CancellationToken ct)
    {
        var vehicles = await _db.Vehicles
            .Include(v => v.DriverProfile)
                .ThenInclude(p => p.Documents)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync(ct);

        var result = vehicles.Select(v =>
        {
            var docs = v.DriverProfile.Documents.ToList();
            var lastInspection = docs
                .Where(d => d.DocumentType == DocumentType.DriversLicense)
                .OrderByDescending(d => d.ReviewedAt ?? d.SubmittedAt)
                .Select(d => d.ReviewedAt ?? d.SubmittedAt)
                .FirstOrDefault();

            return new AdminVehicleVm
            {
                Id = v.Id.ToString(),
                DriverId = v.DriverProfile.UserId.ToString(),
                Make = v.Make,
                Model = v.Model,
                Year = v.Year,
                LicensePlate = v.LicensePlate,
                Color = v.Color,
                Seats = v.Capacity,
                IsApproved = v.Verified,
                LastInspection = lastInspection,
                Documents = new VehicleDocumentsStatusVm
                {
                    Insurance = docs.Any(d => d.DocumentType == DocumentType.Insurance && IsApprovedDoc(d.Status)),
                    Registration = docs.Any(d => d.DocumentType == DocumentType.VehicleRegistration && IsApprovedDoc(d.Status)),
                    Inspection = docs.Any(d => d.DocumentType == DocumentType.DriversLicense && IsApprovedDoc(d.Status))
                }
            };
        }).ToList();

        return Ok(ApiResponse<List<AdminVehicleVm>>.Ok(result));
    }

    [HttpPut("vehicles/{id:guid}/approve")]
    public async Task<IActionResult> ApproveVehicle(Guid id, CancellationToken ct)
    {
        var vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == id, ct);
        if (vehicle == null) return NotFound(ApiResponse.NotFound("Véhicule introuvable"));

        vehicle.Verified = true;
        vehicle.IsActive = true;
        vehicle.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        await AddAuditAsync("vehicle.approve", "Vehicle", id, null, ct);
        return Ok(ApiResponse.Ok("Véhicule approuvé"));
    }

    [HttpPut("vehicles/{id:guid}/reject")]
    public async Task<IActionResult> RejectVehicle(Guid id, [FromBody] RejectVehicleRequest request, CancellationToken ct)
    {
        var vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == id, ct);
        if (vehicle == null) return NotFound(ApiResponse.NotFound("Véhicule introuvable"));

        vehicle.Verified = false;
        vehicle.IsActive = false;
        vehicle.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        await AddAuditAsync("vehicle.reject", "Vehicle", id, request.Reason, ct);
        return Ok(ApiResponse.Ok("Véhicule rejeté"));
    }

    [HttpGet("vehicles/{id:guid}/documents")]
    public async Task<IActionResult> GetVehicleDocuments(Guid id, CancellationToken ct)
    {
        var vehicle = await _db.Vehicles
            .Include(v => v.DriverProfile)
                .ThenInclude(p => p.Documents)
            .FirstOrDefaultAsync(v => v.Id == id, ct);

        if (vehicle == null) return NotFound(ApiResponse.NotFound("Véhicule introuvable"));

        var result = new VehicleDocumentsVm
        {
            VehicleId = vehicle.Id.ToString(),
            LicensePlate = vehicle.LicensePlate,
            Documents = vehicle.DriverProfile.Documents
                .OrderByDescending(d => d.SubmittedAt)
                .Select(d => new VehicleDocumentVm
                {
                    Id = d.Id.ToString(),
                    Type = d.DocumentType.ToString(),
                    Url = d.FileUrl,
                    Status = d.Status,
                    ExpirationDate = d.ExpiryDate?.ToString("yyyy-MM-dd"),
                    SubmittedAt = d.SubmittedAt,
                    ValidatedAt = d.ReviewedAt
                })
                .ToList()
        };

        return Ok(ApiResponse<VehicleDocumentsVm>.Ok(result));
    }

    // Analytics
    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics(CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekAgo = DateTimeOffset.UtcNow.AddDays(-7);
        var startOfToday = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero);
        var thisWeekStart = DateTimeOffset.UtcNow.AddDays(-7);
        var lastWeekStart = DateTimeOffset.UtcNow.AddDays(-14);

        var totalUsers = await _db.Users.CountAsync(ct);
        var activeUsersToday = await _db.Users.CountAsync(u => u.LastLoginAt.HasValue && u.LastLoginAt >= startOfToday, ct);
        var activeUsersWeek = await _db.Users.CountAsync(u => u.LastLoginAt.HasValue && u.LastLoginAt >= weekAgo, ct);
        var totalTrips = await _db.Trips.CountAsync(ct);
        var tripsToday = await _db.Trips.CountAsync(t => t.DepartureDate == today, ct);
        var totalRevenue = await _db.Transactions.SumAsync(t => (decimal?)t.Amount, ct) ?? 0m;
        var totalCo2 = await _db.DriverProfiles.SumAsync(p => (decimal?)p.Co2SavedKg, ct) ?? 0m;
        var pendingApprovals = await _db.DriverProfiles.CountAsync(p => p.ValidationStatus == DriverValidationStatus.Pending, ct);
        var reportedIssues = await _db.Reports.CountAsync(r =>
    r.Status != null &&
    (r.Status.Trim().ToLower() == "open" ||
     r.Status.Trim().ToLower() == "inreview" ||
     r.Status.Trim().ToLower() == "in_review"), ct);
        var averageRating = await _db.Reviews.Select(r => (double?)r.Rating).AverageAsync(ct) ?? 0d;

        var newUsersThisWeek = await _db.Users.CountAsync(u => u.CreatedAt >= thisWeekStart, ct);
        var newUsersLastWeek = await _db.Users.CountAsync(u => u.CreatedAt >= lastWeekStart && u.CreatedAt < thisWeekStart, ct);
        var userGrowthRate = ComputeGrowthRate(newUsersThisWeek, newUsersLastWeek);

        var tripsThisWeek = await _db.Trips.CountAsync(t => t.CreatedAt >= thisWeekStart, ct);
        var tripsLastWeek = await _db.Trips.CountAsync(t => t.CreatedAt >= lastWeekStart && t.CreatedAt < thisWeekStart, ct);
        var tripGrowthRate = ComputeGrowthRate(tripsThisWeek, tripsLastWeek);

        var result = new PlatformAnalyticsVm
        {
            TotalUsers = totalUsers,
            ActiveUsersToday = activeUsersToday,
            ActiveUsersWeek = activeUsersWeek,
            TotalTrips = totalTrips,
            TripsToday = tripsToday,
            TotalRevenue = decimal.ToDouble(totalRevenue),
            TotalCO2Saved = decimal.ToDouble(totalCo2),
            AverageRating = averageRating,
            PendingApprovals = pendingApprovals,
            ReportedIssues = reportedIssues,
            UserGrowthRate = userGrowthRate,
            TripGrowthRate = tripGrowthRate
        };

        return Ok(ApiResponse<PlatformAnalyticsVm>.Ok(result));
    }

    [HttpGet("analytics/user-growth")]
    public async Task<IActionResult> GetUserGrowth(CancellationToken ct)
    {
        var since = DateTime.UtcNow.Date.AddDays(-30);
        var created = await _db.Users
            .Where(u => u.CreatedAt >= since)
            .Select(u => u.CreatedAt)
            .ToListAsync(ct);

        var points = BuildTimeSeries(created, "Nouveaux utilisateurs");
        return Ok(ApiResponse<List<TimeSeriesVm>>.Ok(points));
    }

    [HttpGet("analytics/trip-trend")]
    public async Task<IActionResult> GetTripTrend(CancellationToken ct)
    {
        var since = DateTime.UtcNow.Date.AddDays(-30);
        var created = await _db.Trips
            .Where(t => t.CreatedAt >= since)
            .Select(t => t.CreatedAt)
            .ToListAsync(ct);

        var points = BuildTimeSeries(created, "Trajets publiés");
        return Ok(ApiResponse<List<TimeSeriesVm>>.Ok(points));
    }

    [HttpGet("analytics/revenue")]
    public async Task<IActionResult> GetRevenueTrend(CancellationToken ct)
    {
        var since = DateTime.UtcNow.Date.AddDays(-30);
        var txs = await _db.Transactions
            .Where(t => t.CreatedAt >= since)
            .Select(t => new { t.CreatedAt, t.PlatformShare })
            .ToListAsync(ct);

        var points = txs
            .GroupBy(t => t.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new TimeSeriesVm
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                Value = decimal.ToDouble(g.Sum(v => v.PlatformShare)),
                Label = "Revenus plateforme"
            })
            .ToList();

        return Ok(ApiResponse<List<TimeSeriesVm>>.Ok(points));
    }

    // Finance
    [HttpGet("finance/analytics")]
    public async Task<IActionResult> GetFinanceAnalytics(CancellationToken ct)
    {
        var totalTransactions = await _db.Transactions.CountAsync(ct);
        var totalRevenue = await _db.Transactions.SumAsync(t => (decimal?)t.Amount, ct) ?? 0m;
        var platformShare = await _db.Transactions.SumAsync(t => (decimal?)t.PlatformShare, ct) ?? 0m;
        var driverShare = await _db.Transactions.SumAsync(t => (decimal?)t.DriverShare, ct) ?? 0m;
        var pendingPayouts = await _db.Transactions.CountAsync(t => t.Status == PaymentStatus.Pending || t.Status == PaymentStatus.PreAuthorized, ct);
        var failedTransactions = await _db.Transactions.CountAsync(t => t.Status == PaymentStatus.Failed, ct);

        var data = new FinanceAnalyticsVm
        {
            TotalRevenue = decimal.ToDouble(totalRevenue),
            TotalTransactions = totalTransactions,
            PlatformShare = decimal.ToDouble(platformShare),
            DriverShare = decimal.ToDouble(driverShare),
            AverageTransactionValue = totalTransactions == 0 ? 0 : decimal.ToDouble(totalRevenue / totalTransactions),
            PendingPayouts = pendingPayouts,
            FailedTransactions = failedTransactions
        };

        return Ok(ApiResponse<FinanceAnalyticsVm>.Ok(data));
    }

    [HttpGet("finance/transactions")]
    public async Task<IActionResult> GetFinanceTransactions(CancellationToken ct)
    {
        var txs = await _db.Transactions
            .OrderByDescending(t => t.CreatedAt)
            .Take(200)
            .Select(t => new FinanceTransactionVm
            {
                Id = t.Id.ToString(),
                ReservationId = t.ReservationId.ToString(),
                DriverId = t.DriverId.ToString(),
                PassengerId = t.PassengerId.ToString(),
                Amount = decimal.ToDouble(t.Amount),
                DriverShare = decimal.ToDouble(t.DriverShare),
                PlatformShare = decimal.ToDouble(t.PlatformShare),
                Status = NormalizePaymentStatus(t.Status),
                PaymentMethod = t.PaymentMethod.ToString(),
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<FinanceTransactionVm>>.Ok(txs));
    }

    [HttpGet("finance/penalties")]
    public async Task<IActionResult> GetPenalties(CancellationToken ct)
    {
        var penalties = await _db.Penalties
            .OrderByDescending(p => p.CreatedAt)
            .Take(200)
            .Select(p => new PenaltyVm
            {
                Id = p.Id.ToString(),
                UserId = p.UserId.ToString(),
                Reason = p.TriggerReason,
                Amount = decimal.ToDouble(p.Amount),
                Status = NormalizePenaltyStatus(p.Status),
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<PenaltyVm>>.Ok(penalties));
    }

    [HttpPut("finance/penalties/{id:guid}/wave")]
    public async Task<IActionResult> WaivePenalty(Guid id, [FromBody] WaivePenaltyRequest request, CancellationToken ct)
    {
        var penalty = await _db.Penalties.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (penalty == null) return NotFound(ApiResponse.NotFound("Pénalité introuvable"));

        penalty.Status = PenaltyStatus.Waived;
        penalty.AdminDecision = request.Reason;
        await _db.SaveChangesAsync(ct);

        await AddAuditAsync("penalty.waive", "Penalty", id, request.Reason, ct);
        return Ok(ApiResponse.Ok("Pénalité annulée"));
    }

    [HttpPost("finance/report")]
    public IActionResult GenerateFinanceReport([FromBody] FinanceReportRequest request)
    {
        var result = new
        {
            reportId = Guid.NewGuid(),
            request.StartDate,
            request.EndDate,
            generatedAt = DateTimeOffset.UtcNow
        };
        return Ok(ApiResponse<object>.Ok(result, "Rapport financier généré"));
    }

    // Moderations
    [HttpGet("moderations")]
    public async Task<IActionResult> GetModerationQueue(CancellationToken ct)
    {
        var items = await _db.Reports
           .Where(r =>
                       r.Status.Trim().ToLower() == "open" ||
                       r.Status.Trim().ToLower() == "inreview" ||
                       r.Status.Trim().ToLower() == "in_review")
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ModerationItemVm
            {
                Id = r.Id.ToString(),
                Type = "Report",
                ContentId = r.Id.ToString(),
                ReportedBy = r.ReporterId.ToString(),
                Reason = r.Category.ToString(),
                Status = NormalizeModerationStatus(r.Status),
                Content = r.Description,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<ModerationItemVm>>.Ok(items));
    }

    [HttpGet("moderations/messages")]
    public IActionResult GetReportedMessages()
    {
        // Aucun stockage de messages signalés dédié dans l'architecture actuelle.
        return Ok(ApiResponse<List<ChatMessageVm>>.Ok(new List<ChatMessageVm>()));
    }

    [HttpPut("moderations/{id:guid}/approve")]
    public async Task<IActionResult> ApproveModeration(Guid id, [FromBody] ModerationApproveRequest request, CancellationToken ct)
    {
        var report = await _db.Reports.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (report == null) return NotFound(ApiResponse.NotFound("Élément de modération introuvable"));

        report.Status = "resolved";
        report.AdminNote = request.Notes;
        report.ResolvedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        await AddAuditAsync("moderation.approve", "Report", id, request.Notes, ct);
        return Ok(ApiResponse.Ok("Contenu approuvé"));
    }

    [HttpPut("moderations/{id:guid}/remove")]
    public async Task<IActionResult> RemoveModeration(Guid id, [FromBody] ModerationRemoveRequest request, CancellationToken ct)
    {
        var report = await _db.Reports.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (report == null) return NotFound(ApiResponse.NotFound("Élément de modération introuvable"));

        report.Status = "dismissed";
        report.AdminNote = request.Reason;
        report.ResolvedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        await AddAuditAsync("moderation.remove", "Report", id, request.Reason, ct);
        return Ok(ApiResponse.Ok("Contenu retiré"));
    }

    // Compliance
    [HttpGet("compliance/status")]
    public async Task<IActionResult> GetComplianceStatus(CancellationToken ct)
    {
        var totalUsers = await _db.Users.CountAsync(ct);
        var consentCollected = await _db.Set<ConsentementsPipedum>().CountAsync(c => c.ConsentementPartageDonnees, ct);
        var usersWithConsent = await _db.Set<ConsentementsPipedum>().Select(c => c.UserId).Distinct().CountAsync(ct);
        var exportRequests = await _db.Set<ExportsDonnee>().CountAsync(e => IsPendingExportStatus(e.Statut), ct);
        var anonymizationRequests = await _db.Users.CountAsync(u => u.DeletedAt != null, ct);
        var lastAuditDate = await _db.AuditLogs
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => (DateTimeOffset?)a.CreatedAt)
            .FirstOrDefaultAsync(ct);

        var lastReportGenerated = await _db.Set<ExportsDonnee>()
            .Where(e => e.TypeExport.ToLower().Contains("compliance"))
            .OrderByDescending(e => e.DateDemande)
            .Select(e => (DateTime?)e.DateDemande)
            .FirstOrDefaultAsync(ct);

        var result = new ComplianceStatusVm
        {
            ConsentCollected = consentCollected,
            ConsentPending = Math.Max(0, totalUsers - usersWithConsent),
            ExportRequests = exportRequests,
            AnonymizationRequests = anonymizationRequests,
            LastAuditDate = lastAuditDate ?? DateTimeOffset.UtcNow,
            LastReportGenerated = lastReportGenerated.HasValue
                ? new DateTimeOffset(DateTime.SpecifyKind(lastReportGenerated.Value, DateTimeKind.Utc))
                : DateTimeOffset.UtcNow
        };

        return Ok(ApiResponse<ComplianceStatusVm>.Ok(result));
    }

    [HttpGet("compliance/exports")]
    public async Task<IActionResult> GetComplianceExports(CancellationToken ct)
    {
        var exports = await _db.Set<ExportsDonnee>()
            .OrderByDescending(e => e.DateDemande)
            .Take(200)
            .ToListAsync(ct);

        var userIds = exports.Select(e => e.UserId).Distinct().ToList();
        var emailByUserId = await _db.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Email, ct);

        var result = exports.Select(e => new UserExportVm
        {
            Id = e.Id.ToString(),
            UserId = e.UserId.ToString(),
            Email = emailByUserId.TryGetValue(e.UserId, out var email) ? email : "unknown",
            Status = NormalizeExportStatus(e.Statut),
            RequestedAt = AsUtc(e.DateDemande),
            ExpiresAt = e.DateExpirationLien.HasValue ? AsUtc(e.DateExpirationLien.Value) : null,
            DownloadUrl = e.FichierUrl
        }).ToList();

        return Ok(ApiResponse<List<UserExportVm>>.Ok(result));
    }

    [HttpPost("compliance/exports/{id:guid}/process")]
    public async Task<IActionResult> ProcessComplianceExport(Guid id, CancellationToken ct)
    {
        var export = await _db.Set<ExportsDonnee>().FirstOrDefaultAsync(e => e.Id == id, ct);
        if (export == null) return NotFound(ApiResponse.NotFound("Export introuvable"));

        export.Statut = "ready";
        export.DateCompletion = DateTime.UtcNow;
        export.DateExpirationLien = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync(ct);

        await AddAuditAsync("compliance.export.process", "Export", id, null, ct);
        return Ok(ApiResponse.Ok("Export traité"));
    }

    [HttpPost("compliance/users/{id:guid}/anonymize")]
    public async Task<IActionResult> AnonymizeUser(Guid id, [FromBody] AnonymizeUserRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null) return NotFound(ApiResponse.NotFound("Utilisateur introuvable"));

        user.Email = $"anonymized_{id:N}@deleted.local";
        user.FirstName = "Utilisateur";
        user.LastName = "Supprime";
        user.PhoneNumber = null;
        user.AvatarUrl = null;
        user.Bio = null;
        user.Status = UserStatus.Deleted;
        user.DeletedAt = DateTimeOffset.UtcNow;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        await AddAuditAsync("compliance.user.anonymize", "User", id, request.Reason, ct);

        return Ok(ApiResponse.Ok("Utilisateur anonymisé"));
    }

    [HttpGet("compliance/audit-logs")]
    public async Task<IActionResult> GetComplianceAuditLogs([FromQuery] int days = 30, CancellationToken ct = default)
    {
        var since = DateTimeOffset.UtcNow.AddDays(-Math.Max(1, days));
        var logs = await _db.AuditLogs
            .Where(a => a.CreatedAt >= since)
            .OrderByDescending(a => a.CreatedAt)
            .Take(500)
            .Select(a => new AuditLogVm
            {
                Id = a.Id.ToString(CultureInfo.InvariantCulture),
                Action = a.Action,
                Date = a.CreatedAt,
                AdminEmail = a.ActorRole
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<AuditLogVm>>.Ok(logs));
    }

    [HttpPost("compliance/report")]
    public async Task<IActionResult> GenerateComplianceReport(CancellationToken ct)
    {
        var export = new ExportsDonnee
        {
            Id = Guid.NewGuid(),
            UserId = GetUid(),
            TypeExport = "compliance_report",
            Statut = "ready",
            DateDemande = DateTime.UtcNow,
            DateCompletion = DateTime.UtcNow,
            DateExpirationLien = DateTime.UtcNow.AddDays(7)
        };

        await _db.Set<ExportsDonnee>().AddAsync(export, ct);
        await _db.SaveChangesAsync(ct);
        await AddAuditAsync("compliance.report.generate", "Export", export.Id, null, ct);

        return Ok(ApiResponse<object>.Ok(new { reportId = export.Id, generatedAt = DateTimeOffset.UtcNow }));
    }

    // Exports
    [HttpGet("exports")]
    public async Task<IActionResult> GetExports(CancellationToken ct)
    {
        var exports = await _db.Set<ExportsDonnee>()
            .OrderByDescending(e => e.DateDemande)
            .Take(200)
            .Select(e => new ExportVm
            {
                Id = e.Id.ToString(),
                Type = e.TypeExport,
                Format = ExtractFormat(e.TablesExporteesJson),
                Status = NormalizeExportStatus(e.Statut),
                CreatedAt = AsUtc(e.DateDemande),
                ExpiresAt = e.DateExpirationLien.HasValue ? AsUtc(e.DateExpirationLien.Value) : null,
                DownloadUrl = e.FichierUrl
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<ExportVm>>.Ok(exports));
    }

    [HttpPost("exports")]
    public async Task<IActionResult> CreateExport([FromBody] CreateExportRequest request, CancellationToken ct)
    {
        var format = string.IsNullOrWhiteSpace(request.Format) ? "json" : request.Format.Trim().ToLowerInvariant();
        var type = string.IsNullOrWhiteSpace(request.Type) ? "users" : request.Type.Trim().ToLowerInvariant();

        var export = new ExportsDonnee
        {
            Id = Guid.NewGuid(),
            UserId = GetUid(),
            TypeExport = type,
            TablesExporteesJson = $"{{\"format\":\"{format}\"}}",
            Statut = "en_attente",
            DateDemande = DateTime.UtcNow,
            DateExpirationLien = DateTime.UtcNow.AddDays(7)
        };

        await _db.Set<ExportsDonnee>().AddAsync(export, ct);
        await _db.SaveChangesAsync(ct);
        await AddAuditAsync("export.create", "Export", export.Id, $"{type}:{format}", ct);

        return Ok(ApiResponse<ExportVm>.Ok(new ExportVm
        {
            Id = export.Id.ToString(),
            Type = export.TypeExport,
            Format = format,
            Status = NormalizeExportStatus(export.Statut),
            CreatedAt = AsUtc(export.DateDemande),
            ExpiresAt = export.DateExpirationLien.HasValue ? AsUtc(export.DateExpirationLien.Value) : null,
            DownloadUrl = export.FichierUrl
        }));
    }

    // Logs
    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs(CancellationToken ct)
    {
        var logs = await _db.AuditLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(200)
            .ToListAsync(ct);

        var actorIds = logs.Where(l => l.ActorId.HasValue).Select(l => l.ActorId!.Value).Distinct().ToList();
        var actorEmailMap = await _db.Users
            .Where(u => actorIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Email, ct);

        var result = logs.Select(l => new AuditLogVm
        {
            Id = l.Id.ToString(CultureInfo.InvariantCulture),
            Action = l.Action,
            Date = l.CreatedAt,
            AdminEmail = l.ActorId.HasValue && actorEmailMap.TryGetValue(l.ActorId.Value, out var email)
                ? email
                : l.ActorRole
        }).ToList();

        return Ok(ApiResponse<List<AuditLogVm>>.Ok(result));
    }

    // Settings
    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings(CancellationToken ct)
    {
        var settings = await BuildSettingsAsync(ct);
        return Ok(ApiResponse<PlatformSettingsVm>.Ok(settings));
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request, CancellationToken ct)
    {
        if (request.SmtpHost != null) await UpsertConfigAsync("smtp_host", request.SmtpHost, "string", ct);
        if (request.SmtpPort.HasValue) await UpsertConfigAsync("smtp_port", request.SmtpPort.Value.ToString(CultureInfo.InvariantCulture), "int", ct);
        if (request.CorsOrigins != null) await UpsertConfigAsync("cors_origins", string.Join(",", request.CorsOrigins), "string", ct);
        if (request.JwtExpiration.HasValue) await UpsertConfigAsync("jwt_expiration", request.JwtExpiration.Value.ToString(CultureInfo.InvariantCulture), "int", ct);
        if (request.MaxLoginAttempts.HasValue) await UpsertConfigAsync("max_login_attempts", request.MaxLoginAttempts.Value.ToString(CultureInfo.InvariantCulture), "int", ct);
        if (request.RateLimitPerMinute.HasValue) await UpsertConfigAsync("rate_limit_per_minute", request.RateLimitPerMinute.Value.ToString(CultureInfo.InvariantCulture), "int", ct);
        if (request.PlatformName != null) await UpsertConfigAsync("platform_name", request.PlatformName, "string", ct);
        if (request.MaintenanceMode.HasValue) await UpsertConfigAsync("maintenance_mode", request.MaintenanceMode.Value ? "true" : "false", "bool", ct);

        await _db.SaveChangesAsync(ct);
        await AddAuditAsync("settings.update", "PlatformConfig", null, "bulk_update", ct);
        return Ok(ApiResponse<PlatformSettingsVm>.Ok(await BuildSettingsAsync(ct)));
    }

    [HttpPut("settings/maintenance")]
    public async Task<IActionResult> ToggleMaintenance([FromBody] ToggleMaintenanceRequest request, CancellationToken ct)
    {
        await UpsertConfigAsync("maintenance_mode", request.Enabled ? "true" : "false", "bool", ct);
        await _db.SaveChangesAsync(ct);
        await AddAuditAsync("settings.maintenance", "PlatformConfig", null, request.Enabled ? "true" : "false", ct);
        return Ok(ApiResponse<object>.Ok(new { maintenanceMode = request.Enabled }));
    }

    // Trips
    [HttpGet("trips")]
    public async Task<IActionResult> GetTrips(CancellationToken ct)
    {
        var trips = await _db.Trips
            .OrderByDescending(t => t.CreatedAt)
            .Take(500)
            .Select(t => new AdminTripVm
            {
                Id = t.Id.ToString(),
                DriverId = t.DriverId.ToString(),
                DepartureLabel = t.DepartureLabel,
                ArrivalLabel = t.ArrivalLabel,
                DepartureDate = t.DepartureDate.ToString("yyyy-MM-dd"),
                DepartureTime = t.DepartureTime.ToString("HH\\:mm"),
                Status = t.Status.ToString(),
                CurrentPassengers = t.CurrentPassengers,
                MaxPassengers = t.MaxPassengers,
                PricePerPassenger = decimal.ToDouble(t.PricePerPassenger),
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<AdminTripVm>>.Ok(trips));
    }

    // Helpers
    private Guid GetUid()
    {
        var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value
                  ?? throw new InvalidOperationException("Admin identity missing.");
        return Guid.Parse(raw);
    }

    private async Task AddAuditAsync(string action, string entityType, Guid? entityId, string? newValue, CancellationToken ct)
    {
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            ActorId = GetUid(),
            ActorRole = "admin",
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            NewValueJson = newValue,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            CreatedAt = DateTimeOffset.UtcNow
        }, ct);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<PlatformSettingsVm> BuildSettingsAsync(CancellationToken ct)
    {
        var keys = new[]
        {
            "smtp_host",
            "smtp_port",
            "cors_origins",
            "jwt_expiration",
            "max_login_attempts",
            "rate_limit_per_minute",
            "platform_name",
            "maintenance_mode"
        };

        var configs = await _db.PlatformConfigs
            .Where(c => keys.Contains(c.Key))
            .ToDictionaryAsync(c => c.Key, c => c.Value, ct);

        string Get(string key, string defaultValue) => configs.TryGetValue(key, out var value) ? value : defaultValue;
        int GetInt(string key, int defaultValue) => int.TryParse(Get(key, defaultValue.ToString(CultureInfo.InvariantCulture)), out var value) ? value : defaultValue;

        return new PlatformSettingsVm
        {
            Id = "platform",
            SmtpHost = Get("smtp_host", "smtp.collegelacite.ca"),
            SmtpPort = GetInt("smtp_port", 587),
            CorsOrigins = Get("cors_origins", "http://localhost:3000").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
            JwtExpiration = GetInt("jwt_expiration", 21600),
            MaxLoginAttempts = GetInt("max_login_attempts", 5),
            RateLimitPerMinute = GetInt("rate_limit_per_minute", 100),
            PlatformName = Get("platform_name", "Covoiturage La Cité"),
            MaintenanceMode = string.Equals(Get("maintenance_mode", "false"), "true", StringComparison.OrdinalIgnoreCase)
        };
    }

    private async Task UpsertConfigAsync(string key, string value, string dataType, CancellationToken ct)
    {
        var config = await _db.PlatformConfigs.FirstOrDefaultAsync(c => c.Key == key, ct);
        if (config == null)
        {
            await _db.PlatformConfigs.AddAsync(new PlatformConfig
            {
                Key = key,
                Value = value,
                DataType = dataType,
                UpdatedAt = DateTimeOffset.UtcNow,
                LastModifiedByAdminId = GetUid()
            }, ct);
            return;
        }

        config.Value = value;
        config.DataType = dataType;
        config.UpdatedAt = DateTimeOffset.UtcNow;
        config.LastModifiedByAdminId = GetUid();
    }

    private static bool IsOpenReportStatus(string status)
    {
        var normalized = status.Trim().ToLowerInvariant();
        return normalized is "open" or "inreview" or "in_review";
    }

    private static string NormalizeReportStatus(string status)
    {
        var normalized = status.Trim().ToLowerInvariant();
        return normalized switch
        {
            "open" => "Open",
            "in_review" => "InReview",
            "inreview" => "InReview",
            "resolved" => "Resolved",
            "dismissed" => "Dismissed",
            _ => "Open"
        };
    }

    private static string ToStoredReportStatus(string status)
    {
        var normalized = status.Trim().ToLowerInvariant();
        return normalized switch
        {
            "open" => "open",
            "inreview" => "in_review",
            "in_review" => "in_review",
            "resolved" => "resolved",
            "dismissed" => "dismissed",
            _ => "open"
        };
    }

    private static string NormalizeSeverity(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return "Low";
        var normalized = value.Trim().ToLowerInvariant();
        return normalized switch
        {
            "low" => "Low",
            "medium" => "Medium",
            "high" => "High",
            "critical" => "Critical",
            _ => "Low"
        };
    }

    private static bool IsApprovedDoc(string status)
        => string.Equals(status, "approved", StringComparison.OrdinalIgnoreCase)
        || string.Equals(status, "approuve", StringComparison.OrdinalIgnoreCase)
        || string.Equals(status, "valid", StringComparison.OrdinalIgnoreCase);

    private static double ComputeGrowthRate(int current, int previous)
    {
        if (previous == 0) return current > 0 ? 100d : 0d;
        return Math.Round(((double)(current - previous) / previous) * 100d, 2);
    }

    private static List<TimeSeriesVm> BuildTimeSeries(IEnumerable<DateTimeOffset> points, string label)
    {
        return points
            .GroupBy(p => p.Date)
            .OrderBy(g => g.Key)
            .Select(g => new TimeSeriesVm
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                Value = g.Count(),
                Label = label
            })
            .ToList();
    }

    private static string NormalizePaymentStatus(PaymentStatus status)
    {
        return status switch
        {
            PaymentStatus.Captured => "Captured",
            PaymentStatus.RefundedFull => "Refunded",
            PaymentStatus.RefundedPartial => "Refunded",
            PaymentStatus.Failed => "Failed",
            _ => "Pending"
        };
    }

    private static string NormalizePenaltyStatus(PenaltyStatus status)
    {
        return status switch
        {
            PenaltyStatus.Waived => "Waived",
            PenaltyStatus.Applied => "Paid",
            PenaltyStatus.Expired => "Paid",
            _ => "Active"
        };
    }

    private static string NormalizeModerationStatus(string status)
    {
        var normalized = status.Trim().ToLowerInvariant();
        return normalized switch
        {
            "resolved" => "Approved",
            "dismissed" => "Removed",
            "in_review" => "Reviewing",
            _ => "Pending"
        };
    }

    private static bool IsPendingExportStatus(string status)
    {
        var normalized = status.Trim().ToLowerInvariant();
        return normalized is "pending" or "en_attente" or "demande" or "processing" or "en_cours" or "traitement";
    }

    private static string NormalizeExportStatus(string status)
    {
        var normalized = status.Trim().ToLowerInvariant();
        return normalized switch
        {
            "ready" or "pret" or "termine" => "Ready",
            "processing" or "en_cours" or "traitement" => "Processing",
            "expired" or "expire" => "Expired",
            "failed" or "erreur" => "Failed",
            _ => "Pending"
        };
    }

    private static DateTimeOffset AsUtc(DateTime dateTime)
        => new(DateTime.SpecifyKind(dateTime, DateTimeKind.Utc));

    private static string ExtractFormat(string? tablesJson)
    {
        if (string.IsNullOrWhiteSpace(tablesJson)) return "json";
        if (tablesJson.Contains("csv", StringComparison.OrdinalIgnoreCase)) return "csv";
        return "json";
    }
}

public sealed class AdminStatsVm
{
    public int ActiveUsers { get; set; }
    public int TripsToday { get; set; }
    public int PendingDrivers { get; set; }
    public int OpenReports { get; set; }
    public decimal TotalCO2SavedKg { get; set; }
}

public sealed class AdminUserVm
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
}

public sealed class SuspendUserRequest
{
    public string Reason { get; set; } = string.Empty;
}

public sealed class PendingDriverVm
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public sealed class ReportVm
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ReportedUserId { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Open";
    public string Severity { get; set; } = "Low";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }
}

public sealed class UpdateReportStatusRequest
{
    public string Status { get; set; } = "Open";
    public string? Notes { get; set; }
}

public sealed class DismissReportRequest
{
    public string Reason { get; set; } = string.Empty;
}

public sealed class RejectVehicleRequest
{
    public string Reason { get; set; } = string.Empty;
}

public sealed class AdminVehicleVm
{
    public string Id { get; set; } = string.Empty;
    public string DriverId { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int Seats { get; set; }
    public VehicleDocumentsStatusVm Documents { get; set; } = new();
    public bool IsApproved { get; set; }
    public DateTimeOffset? LastInspection { get; set; }
}

public sealed class VehicleDocumentsStatusVm
{
    public bool Insurance { get; set; }
    public bool Registration { get; set; }
    public bool Inspection { get; set; }
}

public sealed class VehicleDocumentsVm
{
    public string VehicleId { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public List<VehicleDocumentVm> Documents { get; set; } = new();
}

public sealed class VehicleDocumentVm
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ExpirationDate { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public DateTimeOffset? ValidatedAt { get; set; }
}

public sealed class PlatformAnalyticsVm
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

public sealed class TimeSeriesVm
{
    public string Date { get; set; } = string.Empty;
    public double Value { get; set; }
    public string Label { get; set; } = string.Empty;
}

public sealed class FinanceAnalyticsVm
{
    public double TotalRevenue { get; set; }
    public int TotalTransactions { get; set; }
    public double PlatformShare { get; set; }
    public double DriverShare { get; set; }
    public double AverageTransactionValue { get; set; }
    public int PendingPayouts { get; set; }
    public int FailedTransactions { get; set; }
}

public sealed class FinanceTransactionVm
{
    public string Id { get; set; } = string.Empty;
    public string ReservationId { get; set; } = string.Empty;
    public string DriverId { get; set; } = string.Empty;
    public string PassengerId { get; set; } = string.Empty;
    public double Amount { get; set; }
    public double DriverShare { get; set; }
    public double PlatformShare { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class PenaltyVm
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public double Amount { get; set; }
    public string Status { get; set; } = "Active";
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class WaivePenaltyRequest
{
    public string Reason { get; set; } = string.Empty;
}

public sealed class FinanceReportRequest
{
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
}

public sealed class ModerationItemVm
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "Report";
    public string ContentId { get; set; } = string.Empty;
    public string ReportedBy { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string Content { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class ChatMessageVm
{
    public string Id { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public string SenderId { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public bool IsReported { get; set; }
}

public sealed class ModerationApproveRequest
{
    public string? Notes { get; set; }
}

public sealed class ModerationRemoveRequest
{
    public string Reason { get; set; } = string.Empty;
}

public sealed class ComplianceStatusVm
{
    public int ConsentCollected { get; set; }
    public int ConsentPending { get; set; }
    public int ExportRequests { get; set; }
    public int AnonymizationRequests { get; set; }
    public DateTimeOffset LastAuditDate { get; set; }
    public DateTimeOffset LastReportGenerated { get; set; }
}

public sealed class UserExportVm
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public string? DownloadUrl { get; set; }
}

public sealed class AnonymizeUserRequest
{
    public string Reason { get; set; } = string.Empty;
}

public sealed class ExportVm
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Format { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public string? DownloadUrl { get; set; }
}

public sealed class CreateExportRequest
{
    public string Type { get; set; } = "users";
    public string Format { get; set; } = "json";
}

public sealed class AuditLogVm
{
    public string Id { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public DateTimeOffset Date { get; set; }
    public string AdminEmail { get; set; } = string.Empty;
}

public sealed class PlatformSettingsVm
{
    public string Id { get; set; } = "platform";
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public List<string> CorsOrigins { get; set; } = new();
    public int JwtExpiration { get; set; }
    public int MaxLoginAttempts { get; set; }
    public int RateLimitPerMinute { get; set; }
    public string PlatformName { get; set; } = string.Empty;
    public bool MaintenanceMode { get; set; }
}

public sealed class UpdateSettingsRequest
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

public sealed class ToggleMaintenanceRequest
{
    public bool Enabled { get; set; }
}

public sealed class AdminTripVm
{
    public string Id { get; set; } = string.Empty;
    public string DriverId { get; set; } = string.Empty;
    public string DepartureLabel { get; set; } = string.Empty;
    public string ArrivalLabel { get; set; } = string.Empty;
    public string DepartureDate { get; set; } = string.Empty;
    public string DepartureTime { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CurrentPassengers { get; set; }
    public int MaxPassengers { get; set; }
    public double PricePerPassenger { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
