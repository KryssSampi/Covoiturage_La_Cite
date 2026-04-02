using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Application.Jobs;

/// <summary>
/// Démarre automatiquement les trajets dont l'heure de départ est passée.
/// </summary>
public class TripAutoStartJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<TripAutoStartJob> _logger;
    public TripAutoStartJob(AppDbContext db, ILogger<TripAutoStartJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var now = DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(now.UtcDateTime);
        var currentTime = TimeOnly.FromDateTime(now.UtcDateTime);

        var trips = await _db.Trips
            .Where(t => t.Status == TripStatus.Published
                && t.DepartureDate == today
                && t.DepartureTime <= currentTime)
            .ToListAsync();

        foreach (var trip in trips)
        {
            trip.Status = TripStatus.InProgress;
            trip.ActualStartedAt = now;
            trip.UpdatedAt = now;
        }

        if (trips.Count > 0)
        {
            await _db.SaveChangesAsync();
            _logger.LogInformation("TripAutoStart: {Count} trajets démarrés", trips.Count);
        }
    }
}

/// <summary>
/// Expire les réservations en attente après 30 minutes.
/// </summary>
public class ReservationExpiryJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<ReservationExpiryJob> _logger;
    public ReservationExpiryJob(AppDbContext db, ILogger<ReservationExpiryJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var cutoff = DateTimeOffset.UtcNow.AddMinutes(-30);
        var expired = await _db.Reservations
            .Where(r => r.Status == ReservationStatus.Pending && r.CreatedAt < cutoff)
            .ToListAsync();

        foreach (var r in expired)
        {
            r.Status = ReservationStatus.Expired;
            r.UpdatedAt = DateTimeOffset.UtcNow;
        }

        if (expired.Count > 0)
        {
            await _db.SaveChangesAsync();
            _logger.LogInformation("ReservationExpiry: {Count} réservations expirées", expired.Count);
        }
    }
}

/// <summary>
/// Auto-complète les trajets en cours depuis plus de 2x la durée estimée.
/// </summary>
public class TripAutoCompleteJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<TripAutoCompleteJob> _logger;
    public TripAutoCompleteJob(AppDbContext db, ILogger<TripAutoCompleteJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var now = DateTimeOffset.UtcNow;
        var trips = await _db.Trips
            .Where(t => t.Status == TripStatus.InProgress && t.ActualStartedAt != null)
            .ToListAsync();

        var completed = 0;
        foreach (var trip in trips)
        {
            var maxDuration = TimeSpan.FromMinutes(trip.EstimatedDurationMinutes * 2);
            if (now - trip.ActualStartedAt!.Value > maxDuration)
            {
                trip.Status = TripStatus.Completed;
                trip.ActualCompletedAt = now;
                trip.UpdatedAt = now;
                completed++;
            }
        }

        if (completed > 0)
        {
            await _db.SaveChangesAsync();
            _logger.LogInformation("TripAutoComplete: {Count} trajets auto-complétés", completed);
        }
    }
}

/// <summary>
/// Nettoie les positions GPS de plus de 30 jours (PIPEDA).
/// </summary>
public class GpsCleanupJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<GpsCleanupJob> _logger;
    public GpsCleanupJob(AppDbContext db, ILogger<GpsCleanupJob> logger) { _db = db; _logger = logger; }

    public async Task ExecuteAsync()
    {
        var cutoff = DateTimeOffset.UtcNow.AddDays(-30);
        var deleted = await _db.GpsPositions.Where(g => g.CapturedAt < cutoff).ExecuteDeleteAsync();
        if (deleted > 0)
            _logger.LogInformation("GpsCleanup: {Count} positions GPS supprimées (>30j)", deleted);
    }
}
