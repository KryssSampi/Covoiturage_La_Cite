using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Covoiturage_La_Cite_Server_Core_.Application.Jobs;

/// <summary>
/// Auto-bascule les trajets Published/Full en InProgress quand l'heure de depart est atteinte.
/// </summary>
public class TripAutoStartJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TripAutoStartJob> _logger;
    public TripAutoStartJob(IServiceScopeFactory scopeFactory, ILogger<TripAutoStartJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var now = DateTimeOffset.UtcNow;
        var candidates = await db.Trips
            .Where(t => (t.Status == TripStatus.Published || t.Status == TripStatus.Full) && t.ActualStartedAt == null)
            .ToListAsync();

        var startedTrips = new List<Domain.Entities.Trip>();
        foreach (var trip in candidates)
        {
            var departureUtc = DateTime.SpecifyKind(trip.DepartureDate.ToDateTime(trip.DepartureTime), DateTimeKind.Utc);
            if (now.UtcDateTime < departureUtc) continue;

            trip.Status = TripStatus.InProgress;
            trip.ActualStartedAt = now;
            trip.UpdatedAt = now;
            startedTrips.Add(trip);
        }

        if (startedTrips.Count == 0) return;
        await db.SaveChangesAsync();

        foreach (var trip in startedTrips)
        {
            var passengerIds = await db.Reservations
                .Where(r => r.TripId == trip.Id && r.Status == ReservationStatus.Confirmed)
                .Select(r => r.PassengerId)
                .Distinct()
                .ToListAsync();

            foreach (var passengerId in passengerIds)
            {
                try
                {
                    await notifications.CreateAsync(new CreateNotificationDto
                    {
                        UserId = passengerId,
                        Type = NotificationType.TripStarted,
                        Title = "Trajet demarre automatiquement",
                        Body = $"Le trajet {trip.DepartureLabel} -> {trip.ArrivalLabel} est maintenant en cours.",
                        IsImportant = true,
                        DeepLink = $"/trajet-en-cours/{trip.Id}",
                        RelatedTripId = trip.Id
                    });
                }
                catch { }
            }
        }

        _logger.LogInformation("TripAutoStart: {Count} trajets bascules en InProgress", startedTrips.Count);
    }
}

/// <summary>
/// Annule automatiquement les trajets non dÃ©marrÃ©s aprÃ¨s timeout :
/// heure de dÃ©part UTC + durÃ©e estimÃ©e + 1 heure.
/// </summary>
public class TripAutoCancelUnstartedJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TripAutoCancelUnstartedJob> _logger;
    public TripAutoCancelUnstartedJob(IServiceScopeFactory scopeFactory, ILogger<TripAutoCancelUnstartedJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var now = DateTimeOffset.UtcNow;
            var candidates = await db.Trips
                .Where(t =>
                    (t.Status == TripStatus.Published || t.Status == TripStatus.Full)
                    && t.ActualStartedAt == null)
                .ToListAsync();

            var cancelledTrips = new List<Domain.Entities.Trip>();
            foreach (var trip in candidates)
            {
                var departureUtc = DateTime.SpecifyKind(trip.DepartureDate.ToDateTime(trip.DepartureTime), DateTimeKind.Utc);
                var estimatedMinutes = trip.EstimatedDurationMinutes > 0 ? trip.EstimatedDurationMinutes : 60;
                var deadline = new DateTimeOffset(departureUtc, TimeSpan.Zero)
                    .AddMinutes(estimatedMinutes)
                    .AddHours(1);

                if (now <= deadline) continue;

                var activeReservations = await db.Reservations
                    .Where(r => r.TripId == trip.Id &&
                                (r.Status == ReservationStatus.Pending ||
                                 r.Status == ReservationStatus.Confirmed ||
                                 r.Status == ReservationStatus.InProgress))
                    .ToListAsync();

                foreach (var r in activeReservations)
                {
                    r.Status = ReservationStatus.Cancelled;
                    r.CancelledAt = now;
                    r.CancellationReason = "Trajet annulÃ© automatiquement (non dÃ©marrÃ© dans les dÃ©lais)";
                }

                trip.Status = TripStatus.Cancelled;
                trip.UpdatedAt = now;
                cancelledTrips.Add(trip);
            }

            if (cancelledTrips.Count == 0) return;

            await db.SaveChangesAsync();
            _logger.LogInformation("TripAutoCancelUnstarted: {Count} trajets annulÃ©s", cancelledTrips.Count);

            foreach (var trip in cancelledTrips)
            {
                var departure = trip.DepartureLabel ?? "";
                var destination = trip.ArrivalLabel ?? "";

                try
                {
                    await notifications.CreateAsync(new CreateNotificationDto
                    {
                        UserId = trip.DriverId,
                        Type = NotificationType.TripCancelled,
                        Title = "Trajet annulÃ© automatiquement",
                        Body = $"Votre trajet {departure} â†’ {destination} a Ã©tÃ© annulÃ© (non dÃ©marrÃ© dans les dÃ©lais).",
                        IsImportant = true,
                        DeepLink = "/driver/reservations",
                    });
                }
                catch { /* non bloquant */ }

                var passengerIds = await db.Reservations
                    .Where(r => r.TripId == trip.Id && r.Status == ReservationStatus.Cancelled)
                    .Select(r => r.PassengerId)
                    .Distinct()
                    .ToListAsync();

                foreach (var passengerId in passengerIds)
                {
                    try
                    {
                        await notifications.CreateAsync(new CreateNotificationDto
                        {
                            UserId = passengerId,
                            Type = NotificationType.TripCancelled,
                            Title = "Trajet annulÃ© automatiquement",
                            Body = $"Le trajet {departure} â†’ {destination} n'a pas dÃ©marrÃ© dans les dÃ©lais et a Ã©tÃ© annulÃ©.",
                            IsImportant = true,
                            DeepLink = "/search",
                        });
                    }
                    catch { /* non bloquant */ }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TripAutoCancelUnstartedJob: erreur non critique â€” {Message}", ex.Message);
        }
    }
}

/// <summary>
/// Expire les rÃ©servations en attente aprÃ¨s 30 minutes.
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

                // Notifier passager â€” demande expirÃ©e
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
                            Title = "Demande expirÃ©e",
                            Body = $"Votre demande de rÃ©servation pour le trajet {departure} â†’ {destination} a expirÃ©. Le conducteur n'a pas rÃ©pondu dans les dÃ©lais.",
                            IsImportant = false,
                            DeepLink = "/search",
                        });
                    }
                }
                catch { /* non bloquant */ }

                // Notifier conducteur â€” demande non traitÃ©e
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
                            Title = "Demande de rÃ©servation expirÃ©e",
                            Body = $"Une demande pour votre trajet {departure} â†’ {destination} a expirÃ© faute de rÃ©ponse.",
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
                _logger.LogInformation("ReservationExpiry: {Count} rÃ©servations expirÃ©es", expired.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ReservationExpiryJob: erreur non critique â€” {Message}", ex.Message);
        }
    }
}

/// <summary>
/// Annule les trajets InProgress bloquÃ©s depuis plus de 3x la durÃ©e estimÃ©e (max 4h).
/// Seul le driver peut complÃ©ter un trajet â€” ce job n'a pas cette autoritÃ©.
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
            // Timeout : 3x la durÃ©e estimÃ©e, minimum 2h, maximum 4h
            var estimatedMinutes = trip.EstimatedDurationMinutes > 0 ? trip.EstimatedDurationMinutes : 60;
            var timeoutMinutes = Math.Clamp(estimatedMinutes * 3, 120, 240);
            var timeout = TimeSpan.FromMinutes(timeoutMinutes);

            if (now - trip.ActualStartedAt!.Value > timeout)
            {
                // Cascade : annuler toutes les rÃ©servations actives
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
                    reservation.CancellationReason = "Trajet annulÃ© automatiquement (timeout)";

                    try
                    {
                        await notifications.CreateAsync(new CreateNotificationDto
                        {
                            UserId = reservation.PassengerId,
                            Type = NotificationType.TripCancelled,
                            Title = "Trajet annulÃ© automatiquement",
                            Body = $"Le trajet {departure} â†’ {destination} du {tripDate} a Ã©tÃ© interrompu. Nous nous en excusons.",
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
            _logger.LogInformation("TripAutoCancel: {Count} trajets InProgress annulÃ©s (timeout)", cancelled);
        }
    }
}

/// <summary>
/// Rappelle conducteur + passagers confirmÃ©s ~1h avant le dÃ©part.
/// Tourne toutes les 15 min â€” fenÃªtre de dÃ©tection : [45min, 75min] avant dÃ©part.
/// </summary>
public class TripReminderJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TripReminderJob> _logger;
    public TripReminderJob(IServiceScopeFactory scopeFactory, ILogger<TripReminderJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db            = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var now     = DateTimeOffset.UtcNow;
            var today   = DateOnly.FromDateTime(now.UtcDateTime);
            var in45min = TimeOnly.FromDateTime(now.AddMinutes(45).UtcDateTime);
            var in75min = TimeOnly.FromDateTime(now.AddMinutes(75).UtcDateTime);

            var trips = await db.Trips
                .Where(t => (t.Status == TripStatus.Published || t.Status == TripStatus.Full)
                    && t.DepartureDate == today
                    && t.DepartureTime >= in45min
                    && t.DepartureTime <= in75min)
                .ToListAsync();

            foreach (var trip in trips)
            {
                var departure   = trip.DepartureLabel ?? "";
                var destination = trip.ArrivalLabel   ?? "";
                var timeStr     = trip.DepartureTime.ToString("HH:mm");

                try
                {
                    var alreadySentToDriver = await db.Notifications.AnyAsync(n =>
                        n.UserId == trip.DriverId &&
                        n.Type == NotificationType.TripReminder &&
                        n.RelatedTripId == trip.Id &&
                        n.CreatedAt >= now.AddHours(-2));
                    if (alreadySentToDriver) continue;

                    await notifications.CreateAsync(new CreateNotificationDto
                    {
                        UserId      = trip.DriverId,
                        Type        = NotificationType.TripReminder,
                        Title       = "Rappel : votre trajet dÃ©marre bientÃ´t",
                        Body        = $"Votre trajet {departure} â†’ {destination} dÃ©marre Ã  {timeStr}. Soyez prÃªt !",
                        IsImportant = true,
                        DeepLink    = $"/driver/trajet/{trip.Id}",
                        RelatedTripId = trip.Id,
                    });
                }
                catch { /* non bloquant */ }

                var confirmedPassengerIds = await db.Reservations
                    .Where(r => r.TripId == trip.Id && r.Status == ReservationStatus.Confirmed)
                    .Select(r => r.PassengerId)
                    .ToListAsync();

                foreach (var passengerId in confirmedPassengerIds)
                {
                    try
                    {
                        var alreadySentToPassenger = await db.Notifications.AnyAsync(n =>
                            n.UserId == passengerId &&
                            n.Type == NotificationType.TripReminder &&
                            n.RelatedTripId == trip.Id &&
                            n.CreatedAt >= now.AddHours(-2));
                        if (alreadySentToPassenger) continue;

                        await notifications.CreateAsync(new CreateNotificationDto
                        {
                            UserId      = passengerId,
                            Type        = NotificationType.TripReminder,
                            Title       = "Rappel : votre trajet dÃ©marre bientÃ´t",
                            Body        = $"Le trajet {departure} â†’ {destination} dÃ©marre Ã  {timeStr}. Rejoignez votre conducteur au point de dÃ©part.",
                            IsImportant = true,
                            DeepLink    = $"/trajet-en-cours/{trip.Id}",
                            RelatedTripId = trip.Id,
                        });
                    }
                    catch { /* non bloquant */ }
                }
            }

            if (trips.Count > 0)
                _logger.LogInformation("TripReminder: rappels envoyÃ©s pour {Count} trajets", trips.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TripReminderJob: erreur non critique â€” {Message}", ex.Message);
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
            _logger.LogInformation("GpsCleanup: {Count} positions GPS supprimÃ©es (>30j)", deleted);
    }
}

/// <summary>
/// Genere quotidiennement (23:00 UTC) les instances de trajets recurrents pour J+7.
/// </summary>
public class RecurringTripsGenerationJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RecurringTripsGenerationJob> _logger;
    public RecurringTripsGenerationJob(IServiceScopeFactory scopeFactory, ILogger<RecurringTripsGenerationJob> logger) { _scopeFactory = scopeFactory; _logger = logger; }

    public async Task ExecuteAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var targetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7));
        var weekday = ((int)targetDate.DayOfWeek + 6) % 7 + 1; // 1=lundi..7=dimanche

        var templates = await db.Trips
            .Where(t => t.ParentTripId == null
                && t.TripType == TripType.Recurrent
                && t.Status != TripStatus.Cancelled
                && (t.RecurrenceEndDate == null || t.RecurrenceEndDate >= targetDate)
                && t.RecurrenceDays != null
                && t.RecurrenceDays.Contains(weekday))
            .ToListAsync();

        if (templates.Count == 0) return;

        var createdByDriver = new Dictionary<Guid, int>();
        foreach (var template in templates)
        {
            var exists = await db.Trips.AnyAsync(t =>
                t.ParentTripId == template.Id &&
                t.DepartureDate == targetDate &&
                t.DepartureTime == template.DepartureTime);
            if (exists) continue;

            var instance = new Domain.Entities.Trip
            {
                Id = Guid.NewGuid(),
                DriverId = template.DriverId,
                VehicleId = template.VehicleId,
                DepartureLabel = template.DepartureLabel,
                DepartureAddress = template.DepartureAddress,
                DeparturePoint = template.DeparturePoint,
                ArrivalLabel = template.ArrivalLabel,
                ArrivalAddress = template.ArrivalAddress,
                ArrivalPoint = template.ArrivalPoint,
                Polyline = template.Polyline,
                DepartureDate = targetDate,
                DepartureTime = template.DepartureTime,
                EstimatedArrivalTime = template.EstimatedArrivalTime,
                EstimatedDurationMinutes = template.EstimatedDurationMinutes,
                EstimatedDistanceKm = template.EstimatedDistanceKm,
                MaxPassengers = template.MaxPassengers,
                CurrentPassengers = 0,
                PricePerPassenger = template.PricePerPassenger,
                PassengerPrice = template.PassengerPrice,
                PaymentMethod = template.PaymentMethod,
                Status = TripStatus.Published,
                TripType = TripType.Unique,
                ParentTripId = template.Id,
                BaggageAllowed = template.BaggageAllowed,
                PetsAllowed = template.PetsAllowed,
                SmokingAllowed = template.SmokingAllowed,
                MusicAllowed = template.MusicAllowed,
                ConversationLevel = template.ConversationLevel,
                DriverNote = template.DriverNote,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await db.Trips.AddAsync(instance);
            createdByDriver[template.DriverId] = createdByDriver.TryGetValue(template.DriverId, out var c) ? c + 1 : 1;
        }

        if (createdByDriver.Count == 0) return;
        await db.SaveChangesAsync();

        foreach (var kvp in createdByDriver)
        {
            try
            {
                await notifications.CreateAsync(new CreateNotificationDto
                {
                    UserId = kvp.Key,
                    Type = NotificationType.System,
                    Title = "Trajets recurrents generes",
                    Body = $"{kvp.Value} trajet(s) recurrent(s) ont ete generes pour le {targetDate:yyyy-MM-dd}.",
                    IsImportant = false,
                    DeepLink = "/driver/trips?filter=upcoming"
                });
            }
            catch { }
        }

        _logger.LogInformation("RecurringTripsGeneration: {Count} instances creees", createdByDriver.Values.Sum());
    }
}

