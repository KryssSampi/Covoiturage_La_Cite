using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Covoiturage_La_Cite_Server_Core_.Application.Jobs;

/// <summary>
/// Démarre automatiquement les trajets dont l'heure de départ est passée.
/// </summary>
public class TripAutoStartJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TripAutoStartJob> _logger;
    public TripAutoStartJob(IServiceScopeFactory scopeFactory, ILogger<TripAutoStartJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var now = DateTimeOffset.UtcNow;
            var today = DateOnly.FromDateTime(now.UtcDateTime);
            var currentTime = TimeOnly.FromDateTime(now.UtcDateTime);

            // Buffer 10 min : ne démarre pas un trajet créé dans la dernière heure avec heure dépassée
            var tenMinutesAgo = TimeOnly.FromDateTime(now.AddMinutes(-10).UtcDateTime);
            var trips = await db.Trips
                .Where(t => t.Status == TripStatus.Published
                    && t.DepartureDate == today
                    && t.DepartureTime <= tenMinutesAgo)
                .ToListAsync();

            foreach (var trip in trips)
            {
                trip.Status = TripStatus.InProgress;
                // ActualStartedAt n'est PAS défini ici — seul le conducteur peut confirmer
                // le démarrage physique via POST /api/trips/{id}/start
                trip.UpdatedAt = now;
            }

            if (trips.Count > 0)
            {
                await db.SaveChangesAsync();
                _logger.LogInformation("TripAutoStart: {Count} trajets démarrés", trips.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TripAutoStartJob: erreur non critique — {Message}", ex.Message);
        }
    }
}

/// <summary>
/// Expire les réservations en attente après 30 minutes.
/// </summary>
public class ReservationExpiryJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReservationExpiryJob> _logger;
    public ReservationExpiryJob(IServiceScopeFactory scopeFactory, ILogger<ReservationExpiryJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var cutoff = DateTimeOffset.UtcNow.AddMinutes(-30);
            var expired = await db.Reservations
                .Where(r => r.Status == ReservationStatus.Pending && r.CreatedAt < cutoff)
                .ToListAsync();

            foreach (var r in expired)
            {
                r.Status = ReservationStatus.Expired;
                r.UpdatedAt = DateTimeOffset.UtcNow;
            }

            if (expired.Count > 0)
            {
                await db.SaveChangesAsync();
                _logger.LogInformation("ReservationExpiry: {Count} réservations expirées", expired.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ReservationExpiryJob: erreur non critique — {Message}", ex.Message);
        }
    }
}

/// <summary>
/// Annule les trajets InProgress bloqués depuis plus de 3x la durée estimée (max 4h).
/// Seul le driver peut compléter un trajet — ce job n'a pas cette autorité.
/// </summary>
public class TripAutoCompleteJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TripAutoCompleteJob> _logger;
    public TripAutoCompleteJob(IServiceScopeFactory scopeFactory, ILogger<TripAutoCompleteJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTimeOffset.UtcNow;
        var trips = await db.Trips
            .Where(t => t.Status == TripStatus.InProgress && t.ActualStartedAt != null)
            .ToListAsync();

        var cancelled = 0;
        foreach (var trip in trips)
        {
            // Timeout : 3x la durée estimée, minimum 2h, maximum 4h
            var estimatedMinutes = trip.EstimatedDurationMinutes > 0 ? trip.EstimatedDurationMinutes : 60;
            var timeoutMinutes = Math.Clamp(estimatedMinutes * 3, 120, 240);
            var timeout = TimeSpan.FromMinutes(timeoutMinutes);

            if (now - trip.ActualStartedAt!.Value > timeout)
            {
                trip.Status = TripStatus.Cancelled;
                trip.UpdatedAt = now;
                cancelled++;
            }
        }

        if (cancelled > 0)
        {
            await db.SaveChangesAsync();
            _logger.LogInformation("TripAutoCancel: {Count} trajets InProgress annulés (timeout)", cancelled);
        }
    }
}

/// <summary>
/// Nettoie les positions GPS de plus de 30 jours (PIPEDA).
/// </summary>
public class GpsCleanupJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<GpsCleanupJob> _logger;
    public GpsCleanupJob(IServiceScopeFactory scopeFactory, ILogger<GpsCleanupJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoff = DateTimeOffset.UtcNow.AddDays(-30);
        var deleted = await db.GpsPositions.Where(g => g.CapturedAt < cutoff).ExecuteDeleteAsync();
        if (deleted > 0)
            _logger.LogInformation("GpsCleanup: {Count} positions GPS supprimées (>30j)", deleted);
    }
}
