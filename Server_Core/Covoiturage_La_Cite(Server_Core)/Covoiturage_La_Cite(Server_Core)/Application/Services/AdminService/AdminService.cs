using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Data.Models;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;

public class AdminService
{
    private readonly AppDbContext _ctx;

    public AdminService(AppDbContext ctx) => _ctx = ctx;

    // ── STATS ────────────────────────────────────────────────────────────────

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        var activeUsers = await _ctx.Users.CountAsync(u => u.IsActive);
        var tripsToday = await _ctx.Trajets.CountAsync(t => t.CreatedAt >= today && t.CreatedAt < tomorrow);
        var pendingDrivers = await _ctx.ProfilsConducteurs.CountAsync(p => p.StatutValidation == "en_attente");
        var openReports = await _ctx.Signalements.CountAsync(s => s.Statut == "Open");
        var co2 = await _ctx.ProfilsConducteurs.SumAsync(p => p.Co2EconomiseKg);

        return new AdminStatsDto(activeUsers, tripsToday, pendingDrivers, openReports, co2);
    }

    // ── USERS ────────────────────────────────────────────────────────────────

    public async Task<List<AdminUserDto>> GetUsersAsync()
    {
        return await _ctx.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserDto
            {
                Id = u.Id.ToString(),
                Email = u.Email,
                Nom = u.Nom,
                Prenom = u.Prenom ?? "",
                Role = u.Role,
                Status = u.IsActive ? "Active" : "Suspended",
                CreatedAt = u.CreatedAt.ToString("O")
            })
            .ToListAsync();
    }

    public async Task SuspendUserAsync(Guid id, string reason)
    {
        var user = await _ctx.Users.FindAsync(id)
            ?? throw new KeyNotFoundException("User not found");
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        _ctx.LogsSecurites.Add(new LogsSecurite
        {
            Id = Guid.NewGuid(),
            UserId = id,
            EventType = "user_suspended",
            DetailsJson = $"{{\"reason\":\"{EscapeJson(reason)}\"}}",
            Severity = "high",
            CreatedAt = DateTime.UtcNow
        });

        await _ctx.SaveChangesAsync();
    }

    public async Task ReactivateUserAsync(Guid id)
    {
        var user = await _ctx.Users.FindAsync(id)
            ?? throw new KeyNotFoundException("User not found");
        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
    }

    // ── DRIVERS ──────────────────────────────────────────────────────────────

    public async Task<List<PendingDriverDto>> GetPendingDriversAsync()
    {
        return await _ctx.ProfilsConducteurs
            .Include(p => p.User)
            .Where(p => p.StatutValidation == "en_attente")
            .Select(p => new PendingDriverDto
            {
                Id = p.UserId.ToString(),
                Email = p.User.Email,
                Nom = p.User.Nom,
                Prenom = p.User.Prenom ?? "",
                TotalTrajets = p.TotalTrajets,
                CreatedAt = p.CreatedAt.ToString("O")
            })
            .ToListAsync();
    }

    public async Task ApproveDriverAsync(Guid userId)
    {
        var profil = await _ctx.ProfilsConducteurs.FirstOrDefaultAsync(p => p.UserId == userId)
            ?? throw new KeyNotFoundException("Driver profile not found");
        profil.StatutValidation = "approuve";
        profil.DateValidation = DateTime.UtcNow;
        profil.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
    }

    public async Task RejectDriverAsync(Guid userId, string reason)
    {
        var profil = await _ctx.ProfilsConducteurs.FirstOrDefaultAsync(p => p.UserId == userId)
            ?? throw new KeyNotFoundException("Driver profile not found");
        profil.StatutValidation = "rejete";
        profil.CommentaireAdmin = reason;
        profil.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
    }

    // ── REPORTS ──────────────────────────────────────────────────────────────

    public async Task<List<ReportDto>> GetReportsAsync()
    {
        return await _ctx.Signalements
            .OrderByDescending(s => s.DateSignalement)
            .Select(s => new ReportDto
            {
                Id = s.Id.ToString(),
                UserId = s.SignaleurId.ToString(),
                ReportedUserId = s.SignaleId.ToString(),
                Category = s.Motif,
                Description = s.Description,
                Status = s.Statut,
                Severity = s.Gravite,
                CreatedAt = s.DateSignalement.ToString("O"),
                ResolvedAt = s.DateResolution.HasValue ? s.DateResolution.Value.ToString("O") : null
            })
            .ToListAsync();
    }

    public async Task UpdateReportStatusAsync(Guid id, string status, string? notes)
    {
        var sig = await _ctx.Signalements.FindAsync(id)
            ?? throw new KeyNotFoundException("Report not found");
        sig.Statut = status;
        if (notes != null) sig.ActionPrise = notes;
        if (status is "Resolved" or "Dismissed")
            sig.DateResolution = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
    }

    public async Task DismissReportAsync(Guid id, string reason)
    {
        var sig = await _ctx.Signalements.FindAsync(id)
            ?? throw new KeyNotFoundException("Report not found");
        sig.Statut = "Dismissed";
        sig.ActionPrise = reason;
        sig.DateResolution = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
    }

    // ── LOGS ─────────────────────────────────────────────────────────────────

    public async Task<List<AuditLogDto>> GetAuditLogsAsync()
    {
        return await _ctx.LogsSecurites
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Take(200)
            .Select(l => new AuditLogDto
            {
                Id = l.Id.ToString(),
                Action = l.EventType,
                Date = l.CreatedAt.ToString("O"),
                AdminEmail = l.User != null ? l.User.Email : "system",
                Severity = l.Severity
            })
            .ToListAsync();
    }

    // ── ANALYTICS ────────────────────────────────────────────────────────────

    public async Task<PlatformAnalyticsDto> GetAnalyticsAsync()
    {
        var today = DateTime.Today;
        var weekAgo = today.AddDays(-7);
        var thisWeekStart = today.AddDays(-7);
        var lastWeekStart = today.AddDays(-14);

        var totalUsers = await _ctx.Users.CountAsync();
        var activeUsersToday = await _ctx.Users.CountAsync(u => u.DernierLogin.HasValue && u.DernierLogin >= today);
        var activeUsersWeek = await _ctx.Users.CountAsync(u => u.DernierLogin.HasValue && u.DernierLogin >= weekAgo);
        var totalTrips = await _ctx.Trajets.CountAsync();
        var tripsToday = await _ctx.Trajets.CountAsync(t => t.CreatedAt >= today);
        var totalRevenue = (double)await _ctx.Transactions.SumAsync(t => t.CommissionAppTotale);
        var totalCo2 = (double)await _ctx.ProfilsConducteurs.SumAsync(p => p.Co2EconomiseKg);
        var pendingApprovals = await _ctx.ProfilsConducteurs.CountAsync(p => p.StatutValidation == "en_attente");
        var reportedIssues = await _ctx.Signalements.CountAsync(s => s.Statut == "Open");

        var ratings = await _ctx.ProfilsConducteurs
            .Where(p => p.NoteMoyenne.HasValue)
            .Select(p => p.NoteMoyenne!.Value)
            .ToListAsync();
        var avgRating = ratings.Count > 0 ? (double)ratings.Average() : 0.0;

        var newUsersThisWeek = await _ctx.Users.CountAsync(u => u.CreatedAt >= thisWeekStart);
        var newUsersLastWeek = await _ctx.Users.CountAsync(u => u.CreatedAt >= lastWeekStart && u.CreatedAt < thisWeekStart);
        var userGrowthRate = newUsersLastWeek == 0 ? 100.0 : (double)(newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek * 100;

        var tripsThisWeek = await _ctx.Trajets.CountAsync(t => t.CreatedAt >= thisWeekStart);
        var tripsLastWeek = await _ctx.Trajets.CountAsync(t => t.CreatedAt >= lastWeekStart && t.CreatedAt < thisWeekStart);
        var tripGrowthRate = tripsLastWeek == 0 ? 100.0 : (double)(tripsThisWeek - tripsLastWeek) / tripsLastWeek * 100;

        return new PlatformAnalyticsDto
        {
            TotalUsers = totalUsers,
            ActiveUsersToday = activeUsersToday,
            ActiveUsersWeek = activeUsersWeek,
            TotalTrips = totalTrips,
            TripsToday = tripsToday,
            TotalRevenue = totalRevenue,
            TotalCO2Saved = totalCo2,
            AverageRating = avgRating,
            PendingApprovals = pendingApprovals,
            ReportedIssues = reportedIssues,
            UserGrowthRate = userGrowthRate,
            TripGrowthRate = tripGrowthRate
        };
    }

    public async Task<List<TimeSeriesDto>> GetUserGrowthAsync()
    {
        var thirtyDaysAgo = DateTime.Today.AddDays(-30);
        var dates = await _ctx.Users
            .Where(u => u.CreatedAt >= thirtyDaysAgo)
            .Select(u => u.CreatedAt)
            .ToListAsync();

        return dates
            .GroupBy(d => d.Date)
            .OrderBy(g => g.Key)
            .Select(g => new TimeSeriesDto(g.Key.ToString("yyyy-MM-dd"), g.Count(), "Nouveaux utilisateurs"))
            .ToList();
    }

    public async Task<List<TimeSeriesDto>> GetTripTrendAsync()
    {
        var thirtyDaysAgo = DateTime.Today.AddDays(-30);
        var dates = await _ctx.Trajets
            .Where(t => t.CreatedAt >= thirtyDaysAgo)
            .Select(t => t.CreatedAt)
            .ToListAsync();

        return dates
            .GroupBy(d => d.Date)
            .OrderBy(g => g.Key)
            .Select(g => new TimeSeriesDto(g.Key.ToString("yyyy-MM-dd"), g.Count(), "Trajets publiés"))
            .ToList();
    }

    public async Task<List<TimeSeriesDto>> GetRevenueAnalyticsAsync()
    {
        var thirtyDaysAgo = DateTime.Today.AddDays(-30);
        var txs = await _ctx.Transactions
            .Where(t => t.CreatedAt >= thirtyDaysAgo)
            .Select(t => new { t.CreatedAt, t.CommissionAppTotale })
            .ToListAsync();

        return txs
            .GroupBy(t => t.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new TimeSeriesDto(
                g.Key.ToString("yyyy-MM-dd"),
                (int)g.Sum(t => (double)t.CommissionAppTotale),
                "Revenus plateforme"
            ))
            .ToList();
    }

    // ── FINANCE ──────────────────────────────────────────────────────────────

    public async Task<FinanceDataDto> GetFinanceAnalyticsAsync()
    {
        var totalTransactions = await _ctx.Transactions.CountAsync();
        var totalRevenue = totalTransactions > 0 ? (double)await _ctx.Transactions.SumAsync(t => t.PrixTotal) : 0;
        var platformShare = totalTransactions > 0 ? (double)await _ctx.Transactions.SumAsync(t => t.CommissionAppTotale) : 0;
        var driverShare = totalTransactions > 0 ? (double)await _ctx.Transactions.SumAsync(t => t.RevenusConducteurNets) : 0;
        var pendingPayouts = await _ctx.Transactions.CountAsync(t => t.Statut == "Pending");
        var failedTransactions = await _ctx.Transactions.CountAsync(t => t.Statut == "Failed");

        return new FinanceDataDto
        {
            TotalRevenue = totalRevenue,
            TotalTransactions = totalTransactions,
            PlatformShare = platformShare,
            DriverShare = driverShare,
            AverageTransactionValue = totalTransactions == 0 ? 0 : totalRevenue / totalTransactions,
            PendingPayouts = pendingPayouts,
            FailedTransactions = failedTransactions
        };
    }

    public async Task<List<TransactionDto>> GetTransactionsAsync()
    {
        return await _ctx.Transactions
            .OrderByDescending(t => t.CreatedAt)
            .Take(200)
            .Select(t => new TransactionDto
            {
                Id = t.Id.ToString(),
                ReservationId = t.ReservationId.ToString(),
                DriverId = t.ConducteurId.ToString(),
                PassengerId = t.PassagerId.ToString(),
                Amount = (double)t.PrixTotal,
                DriverShare = (double)t.RevenusConducteurNets,
                PlatformShare = (double)t.CommissionAppTotale,
                Status = t.Statut,
                PaymentMethod = "carte",
                CreatedAt = t.CreatedAt.ToString("O")
            })
            .ToListAsync();
    }

    public async Task<List<PenaltyDto>> GetPenaltiesAsync()
    {
        return await _ctx.Penalites
            .OrderByDescending(p => p.CreatedAt)
            .Take(200)
            .Select(p => new PenaltyDto
            {
                Id = p.Id.ToString(),
                UserId = p.UserId.ToString(),
                Reason = p.Raison,
                Amount = (double)p.Montant,
                Status = p.Statut,
                CreatedAt = p.CreatedAt.ToString("O")
            })
            .ToListAsync();
    }

    public async Task WavePenaltyAsync(Guid id, string reason)
    {
        var penalty = await _ctx.Penalites.FindAsync(id)
            ?? throw new KeyNotFoundException("Penalty not found");
        penalty.Statut = "remise";
        penalty.MotifContestation = reason;
        penalty.DateContestation = DateTime.UtcNow;
        penalty.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
    }

    // ── MODERATIONS ──────────────────────────────────────────────────────────

    public async Task<List<ModerationItemDto>> GetModerationQueueAsync()
    {
        return await _ctx.Signalements
            .Where(s => s.Statut == "Open" || s.Statut == "InReview")
            .OrderByDescending(s => s.DateSignalement)
            .Select(s => new ModerationItemDto
            {
                Id = s.Id.ToString(),
                Type = "Report",
                ContentId = s.Id.ToString(),
                ReportedBy = s.SignaleurId.ToString(),
                Reason = s.Motif,
                Status = s.Statut == "Open" ? "Pending" : "Reviewing",
                Content = s.Description,
                CreatedAt = s.DateSignalement.ToString("O")
            })
            .ToListAsync();
    }

    public async Task ApproveModerationItemAsync(Guid id, string? notes)
    {
        var sig = await _ctx.Signalements.FindAsync(id)
            ?? throw new KeyNotFoundException("Moderation item not found");
        sig.Statut = "Resolved";
        if (notes != null) sig.ActionPrise = notes;
        sig.DateResolution = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
    }

    public async Task RemoveModerationContentAsync(Guid id, string reason)
    {
        var sig = await _ctx.Signalements.FindAsync(id)
            ?? throw new KeyNotFoundException("Moderation item not found");
        sig.Statut = "Dismissed";
        sig.ActionPrise = reason;
        sig.DateResolution = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
    }

    public Task<List<ChatMessageDto>> GetReportedMessagesAsync()
        => Task.FromResult(new List<ChatMessageDto>());

    // ── COMPLIANCE ───────────────────────────────────────────────────────────

    public async Task<ComplianceStatusDto> GetComplianceStatusAsync()
    {
        var consentCollected = await _ctx.ConsentementsPipeda.CountAsync(c => c.ConsentementPartageDonnees);
        var totalUsers = await _ctx.Users.CountAsync();
        var usersWithConsent = await _ctx.ConsentementsPipeda.Select(c => c.UserId).Distinct().CountAsync();
        var exportRequests = await _ctx.ExportsDonnees.CountAsync(e => e.Statut == "demande");
        var anonRequests = await _ctx.ExportsDonnees.CountAsync(e => e.TypeExport == "anonymisation");
        var lastLog = await _ctx.LogsSecurites.OrderByDescending(l => l.CreatedAt).FirstOrDefaultAsync();

        return new ComplianceStatusDto
        {
            ConsentCollected = consentCollected,
            ConsentPending = Math.Max(0, totalUsers - usersWithConsent),
            ExportRequests = exportRequests,
            AnonymizationRequests = anonRequests,
            LastAuditDate = lastLog?.CreatedAt.ToString("O") ?? DateTime.UtcNow.ToString("O"),
            LastReportGenerated = DateTime.UtcNow.AddDays(-7).ToString("O")
        };
    }

    public async Task<List<UserExportDto>> GetExportRequestsAsync()
    {
        return await _ctx.ExportsDonnees
            .Include(e => e.User)
            .OrderByDescending(e => e.DateDemande)
            .Select(e => new UserExportDto
            {
                UserId = e.UserId.ToString(),
                Email = e.User.Email,
                Status = e.Statut == "demande" ? "Pending"
                       : e.Statut == "traitement" ? "Processing"
                       : e.Statut == "pret" ? "Ready"
                       : "Expired",
                RequestedAt = e.DateDemande.ToString("O"),
                ExpiresAt = e.DateExpirationLien.HasValue ? e.DateExpirationLien.Value.ToString("O") : "",
                DownloadUrl = e.FichierUrl
            })
            .ToListAsync();
    }

    public async Task ProcessExportAsync(Guid exportId)
    {
        var export = await _ctx.ExportsDonnees.FindAsync(exportId)
            ?? throw new KeyNotFoundException("Export not found");
        export.Statut = "pret";
        export.DateCompletion = DateTime.UtcNow;
        export.DateExpirationLien = DateTime.UtcNow.AddDays(7);
        await _ctx.SaveChangesAsync();
    }

    public async Task AnonymizeUserAsync(Guid userId, string reason)
    {
        var user = await _ctx.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");
        user.Email = $"anonymized_{userId:N}@deleted.local";
        user.Nom = "Anonymisé";
        user.Prenom = null;
        user.PhotoUrl = null;
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        _ctx.LogsSecurites.Add(new LogsSecurite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EventType = "user_anonymized",
            DetailsJson = $"{{\"reason\":\"{EscapeJson(reason)}\"}}",
            Severity = "critical",
            CreatedAt = DateTime.UtcNow
        });

        await _ctx.SaveChangesAsync();
    }

    // ── EXPORTS ──────────────────────────────────────────────────────────────

    public async Task<List<ExportDto>> GetExportsAsync()
    {
        return await _ctx.ExportsDonnees
            .OrderByDescending(e => e.DateDemande)
            .Select(e => new ExportDto
            {
                Id = e.Id.ToString(),
                Type = e.TypeExport,
                Format = "json",
                Status = e.Statut == "demande" ? "Processing"
                       : e.Statut == "pret" ? "Ready"
                       : e.Statut == "expire" ? "Expired"
                       : "Failed",
                CreatedAt = e.DateDemande.ToString("O"),
                ExpiresAt = e.DateExpirationLien.HasValue ? e.DateExpirationLien.Value.ToString("O") : null,
                DownloadUrl = e.FichierUrl
            })
            .ToListAsync();
    }

    public async Task<ExportDto> CreateExportAsync(string adminEmail, string type, string format)
    {
        var adminUser = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (adminUser == null) throw new KeyNotFoundException("Admin user not found");

        var export = new ExportsDonnee
        {
            Id = Guid.NewGuid(),
            UserId = adminUser.Id,
            TypeExport = type,
            Statut = "demande",
            DateDemande = DateTime.UtcNow,
            DateExpirationLien = DateTime.UtcNow.AddDays(7)
        };
        _ctx.ExportsDonnees.Add(export);
        await _ctx.SaveChangesAsync();

        return new ExportDto
        {
            Id = export.Id.ToString(),
            Type = export.TypeExport,
            Format = format,
            Status = "Processing",
            CreatedAt = export.DateDemande.ToString("O"),
            ExpiresAt = export.DateExpirationLien!.Value.ToString("O"),
            DownloadUrl = null
        };
    }

    // ── SETTINGS ─────────────────────────────────────────────────────────────

    public async Task<PlatformSettingsDto> GetSettingsAsync()
    {
        var configs = await _ctx.ConfigSystemes.ToListAsync();
        string Get(string key, string def) => configs.FirstOrDefault(c => c.Cle == key)?.Valeur ?? def;

        return new PlatformSettingsDto
        {
            Id = Guid.NewGuid().ToString(),
            SmtpHost = Get("smtp_host", "smtp.collegelacite.ca"),
            SmtpPort = int.TryParse(Get("smtp_port", "587"), out var port) ? port : 587,
            CorsOrigins = Get("cors_origins", "http://localhost:3000").Split(',').ToList(),
            JwtExpiration = int.TryParse(Get("jwt_expiration", "10080"), out var exp) ? exp : 10080,
            MaxLoginAttempts = int.TryParse(Get("max_login_attempts", "5"), out var mla) ? mla : 5,
            RateLimitPerMinute = int.TryParse(Get("rate_limit_per_minute", "60"), out var rl) ? rl : 60,
            PlatformName = Get("platform_name", "Covoiturage La Cité"),
            MaintenanceMode = Get("maintenance_mode", "false") == "true"
        };
    }

    public async Task<PlatformSettingsDto> UpdateSettingsAsync(UpdateSettingsRequest settings)
    {
        var pairs = new Dictionary<string, string>();
        if (settings.SmtpHost != null) pairs["smtp_host"] = settings.SmtpHost;
        if (settings.SmtpPort.HasValue) pairs["smtp_port"] = settings.SmtpPort.Value.ToString();
        if (settings.CorsOrigins != null) pairs["cors_origins"] = string.Join(",", settings.CorsOrigins);
        if (settings.JwtExpiration.HasValue) pairs["jwt_expiration"] = settings.JwtExpiration.Value.ToString();
        if (settings.MaxLoginAttempts.HasValue) pairs["max_login_attempts"] = settings.MaxLoginAttempts.Value.ToString();
        if (settings.RateLimitPerMinute.HasValue) pairs["rate_limit_per_minute"] = settings.RateLimitPerMinute.Value.ToString();
        if (settings.PlatformName != null) pairs["platform_name"] = settings.PlatformName;
        if (settings.MaintenanceMode.HasValue) pairs["maintenance_mode"] = settings.MaintenanceMode.Value ? "true" : "false";

        foreach (var (key, value) in pairs)
        {
            var config = await _ctx.ConfigSystemes.FirstOrDefaultAsync(c => c.Cle == key);
            if (config != null)
            {
                config.Valeur = value;
                config.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _ctx.ConfigSystemes.Add(new ConfigSysteme
                {
                    Id = Guid.NewGuid(),
                    Cle = key,
                    Valeur = value,
                    TypeValeur = "string",
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        await _ctx.SaveChangesAsync();
        return await GetSettingsAsync();
    }

    public async Task ToggleMaintenanceModeAsync(bool enabled)
    {
        var config = await _ctx.ConfigSystemes.FirstOrDefaultAsync(c => c.Cle == "maintenance_mode");
        if (config != null)
        {
            config.Valeur = enabled ? "true" : "false";
            config.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _ctx.ConfigSystemes.Add(new ConfigSysteme
            {
                Id = Guid.NewGuid(),
                Cle = "maintenance_mode",
                Valeur = enabled ? "true" : "false",
                TypeValeur = "boolean",
                UpdatedAt = DateTime.UtcNow
            });
        }
        await _ctx.SaveChangesAsync();
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    private static string EscapeJson(string s) => s.Replace("\\", "\\\\").Replace("\"", "\\\"");
}
