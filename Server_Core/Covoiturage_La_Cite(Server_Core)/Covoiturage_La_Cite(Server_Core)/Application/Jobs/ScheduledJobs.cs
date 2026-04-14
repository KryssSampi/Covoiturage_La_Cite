using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Covoiturage_La_Cite_Server_Core_.Application.Jobs;

/// <summary>
/// Expire les pénalités dont la date de contestation est passée.
/// </summary>
public class PenaltyExpiryJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PenaltyExpiryJob> _logger;
    public PenaltyExpiryJob(IServiceScopeFactory scopeFactory, ILogger<PenaltyExpiryJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTimeOffset.UtcNow;
        var expired = await db.Penalties
            .Where(p => p.Status == PenaltyStatus.Active && p.ContestDeadline < now)
            .ToListAsync();

        foreach (var p in expired)
            p.Status = PenaltyStatus.Expired;

        if (expired.Count > 0)
        {
            await db.SaveChangesAsync();
            _logger.LogInformation("PenaltyExpiry: {Count} pénalités expirées", expired.Count);
        }
    }
}

/// <summary>
/// Recalcule les stats de la plateforme (dashboard admin).
/// </summary>
public class PlatformStatsJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PlatformStatsJob> _logger;
    public PlatformStatsJob(IServiceScopeFactory scopeFactory, ILogger<PlatformStatsJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(now.UtcDateTime);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var thirtyDaysAgo = now.AddDays(-30);

        var stats = await db.PlatformStats.OrderByDescending(s => s.ComputedAt).FirstOrDefaultAsync();
        if (stats == null)
        {
            stats = new Domain.Entities.PlatformStats { Id = Guid.NewGuid() };
            db.PlatformStats.Add(stats);
        }

        stats.TotalUsers = await db.Users.CountAsync();
        stats.ActiveUsersLast30Days = await db.Users.CountAsync(u => u.LastLoginAt >= thirtyDaysAgo);
        stats.TotalTrips = await db.Trips.CountAsync();
        stats.TripsToday = await db.Trips.CountAsync(t => t.DepartureDate == today);
        stats.TripsThisMonth = await db.Trips.CountAsync(t => t.DepartureDate >= monthStart);
        stats.TotalCo2SavedKg = await db.Trips.Where(t => t.Co2SavedKg != null).SumAsync(t => t.Co2SavedKg!.Value);
        stats.TotalRevenuePlatform = await db.Transactions.Where(t => t.PlatformFee > 0).SumAsync(t => t.PlatformFee);
        stats.PendingReports = await db.Reports.CountAsync(r => r.Status == "pending" || r.Status == "in_review");
        stats.ComputedAt = now;

        await db.SaveChangesAsync();
        _logger.LogInformation("PlatformStats recalculées à {Time}", now);
    }
}

/// <summary>
/// Détecte les comportements anormaux : taux d'annulation élevé, vitesses GPS suspectes.
/// </summary>
public class AnomalyDetectionJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AnomalyDetectionJob> _logger;
    public AnomalyDetectionJob(IServiceScopeFactory scopeFactory, ILogger<AnomalyDetectionJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Détection: utilisateurs avec >5 annulations dans les 7 derniers jours
        var sevenDaysAgo = DateTimeOffset.UtcNow.AddDays(-7);
        var suspiciousCancellers = await db.Reservations
            .Where(r => r.Status == ReservationStatus.CancelledByPassenger && r.UpdatedAt >= sevenDaysAgo)
            .GroupBy(r => r.PassengerId)
            .Where(g => g.Count() > 5)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToListAsync();

        foreach (var s in suspiciousCancellers)
            _logger.LogWarning("Anomalie: Utilisateur {UserId} a {Count} annulations en 7 jours", s.UserId, s.Count);

        // Détection: vitesses GPS > 200 km/h (GPS spoofing probable)
        var recentGps = DateTimeOffset.UtcNow.AddHours(-1);
        var speedAnomalies = await db.GpsPositions
            .Where(g => g.CapturedAt >= recentGps && g.SpeedKmh > 200)
            .Select(g => new { g.UserId, g.TripId, g.SpeedKmh })
            .Take(20)
            .ToListAsync();

        foreach (var a in speedAnomalies)
            _logger.LogWarning("Anomalie GPS: Vitesse {Speed} km/h pour user {UserId} trip {TripId}", a.SpeedKmh, a.UserId, a.TripId);
    }
}

/// <summary>
/// Escalade les alertes SOS non traitées après 5 minutes.
/// </summary>
public class SosEscalationJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SosEscalationJob> _logger;
    public SosEscalationJob(IServiceScopeFactory scopeFactory, ILogger<SosEscalationJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var fiveMinAgo = DateTimeOffset.UtcNow.AddMinutes(-5);
        var unhandled = await db.SosAlerts
            .Where(a => a.Status == "triggered" && a.TriggeredAt < fiveMinAgo && a.AdminContactedAt == null)
            .ToListAsync();

        foreach (var alert in unhandled)
        {
            alert.Status = "escalated";
            alert.AdminContactedAt = DateTimeOffset.UtcNow;
            _logger.LogCritical("SOS Escalation: Alerte {AlertId} non traitée depuis {Time}", alert.Id, alert.TriggeredAt);
        }

        if (unhandled.Count > 0)
            await db.SaveChangesAsync();
    }
}

/// <summary>
/// Placeholder pour le recalcul ETA dynamique.
/// </summary>
public class EtaRecalculationJob
{
    private readonly ILogger<EtaRecalculationJob> _logger;
    public EtaRecalculationJob(ILogger<EtaRecalculationJob> logger) => _logger = logger;

    public Task ExecuteAsync()
    {
        // TODO: Intégrer OSRM pour recalcul ETA dynamique
        _logger.LogDebug("EtaRecalculation: stub — intégrer OSRM");
        return Task.CompletedTask;
    }
}
