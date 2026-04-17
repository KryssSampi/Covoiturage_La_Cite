using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
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

                // Notifier les passagers confirmés pour chaque trip auto-démarré
                foreach (var trip in trips)
                {
                    var confirmedPassengerIds = await db.Reservations
                        .Where(r => r.TripId == trip.Id && r.Status == ReservationStatus.Confirmed)
                        .Select(r => r.PassengerId)
                        .ToListAsync();

                    var departure = trip.DepartureLabel ?? "";
                    var destination = trip.ArrivalLabel ?? "";

                    foreach (var passengerId in confirmedPassengerIds)
                    {
                        try
                        {
                            await scope.ServiceProvider.GetRequiredService<INotificationService>().CreateAsync(new CreateNotificationDto
                            {
                                UserId = passengerId,
                                Type = NotificationType.TripStarted,
                                Title = "Votre trajet a démarré !",
                                Body = $"Le trajet {departure} → {destination} est en cours. Retrouvez votre conducteur au point de départ.",
                                IsImportant = true,
                                DeepLink = $"/trajet-en-cours/{trip.Id}",
                            });
                        }
                        catch { /* non bloquant */ }
                    }
                }
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

            var now = DateTimeOffset.UtcNow;
            var expired = await db.Reservations
                .Where(r => r.Status == ReservationStatus.Pending && r.ExpiresAt <= now)
                .Include(r => r.Trip)
                .ToListAsync();

            foreach (var r in expired)
            {
                r.Status = ReservationStatus.Expired;
                r.UpdatedAt = DateTimeOffset.UtcNow;

                // Notifier passager — demande expirée
                try
                {
                    if (r.Trip != null)
                    {
                        var departure = r.Trip.DepartureLabel ?? "";
                        var destination = r.Trip.ArrivalLabel ?? "";

                        await scope.ServiceProvider.GetRequiredService<INotificationService>().CreateAsync(new CreateNotificationDto
                        {
                            UserId = r.PassengerId,
                            Type = NotificationType.ReservationCancelled,
                            Title = "Demande expirée",
                            Body = $"Votre demande de réservation pour le trajet {departure} → {destination} a expiré. Le conducteur n'a pas répondu dans les délais.",
                            IsImportant = false,
                            DeepLink = "/search",
                        });
                    }
                }
                catch { /* non bloquant */ }

                // Notifier conducteur — demande non traitée
                try
                {
                    if (r.Trip != null)
                    {
                        var departure = r.Trip.DepartureLabel ?? "";
                        var destination = r.Trip.ArrivalLabel ?? "";

                        await scope.ServiceProvider.GetRequiredService<INotificationService>().CreateAsync(new CreateNotificationDto
                        {
                            UserId = r.Trip.DriverId,
                            Type = NotificationType.ReservationCancelled,
                            Title = "Demande de réservation expirée",
                            Body = $"Une demande pour votre trajet {departure} → {destination} a expiré faute de réponse.",
                            IsImportant = false,
                            DeepLink = "/driver/reservations",
                        });
                    }
                }
                catch { /* non bloquant */ }
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
        var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

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
                // Cascade : annuler toutes les réservations actives
                var activeReservations = await db.Reservations
                    .Where(r => r.TripId == trip.Id &&
                                (r.Status == ReservationStatus.Pending ||
                                 r.Status == ReservationStatus.Confirmed ||
                                 r.Status == ReservationStatus.InProgress))
                    .ToListAsync();

                var departure = trip.DepartureLabel ?? "";
                var destination = trip.ArrivalLabel ?? "";
                var tripDate = $"{trip.DepartureDate:dd MMM yyyy}";

                foreach (var reservation in activeReservations)
                {
                    reservation.Status = ReservationStatus.Cancelled;
                    reservation.CancelledAt = now;
                    reservation.CancellationReason = "Trajet annulé automatiquement (timeout)";

                    try
                    {
                        await notifications.CreateAsync(new CreateNotificationDto
                        {
                            UserId = reservation.PassengerId,
                            Type = NotificationType.TripCancelled,
                            Title = "Trajet annulé automatiquement",
                            Body = $"Le trajet {departure} → {destination} du {tripDate} a été interrompu. Nous nous en excusons.",
                            IsImportant = true,
                            DeepLink = "/search",
                        });
                    }
                    catch { /* non bloquant */ }
                }

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
