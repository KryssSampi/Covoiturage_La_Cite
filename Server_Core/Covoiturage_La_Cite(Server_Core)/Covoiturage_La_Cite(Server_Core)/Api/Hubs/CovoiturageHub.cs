using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Covoiturage_La_Cite_Server_Core_.Api.Hubs;

/// <summary>
/// Hub SignalR principal — 12 événements temps réel.
/// Groupes : trip:{tripId}, user:{userId}, admin
/// </summary>
[Authorize]
public class CovoiturageHub : Hub
{
    private readonly ILogger<CovoiturageHub> _logger;
    public CovoiturageHub(ILogger<CovoiturageHub> logger) => _logger = logger;

    // ── Connexion/Déconnexion ────────────────────────────────────────────────

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
            _logger.LogDebug("SignalR connecté: {UserId} ({ConnectionId})", userId, Context.ConnectionId);
        }

        // Admin auto-join
        if (Context.User?.IsInRole("Admin") == true)
            await Groups.AddToGroupAsync(Context.ConnectionId, "admin");

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user:{userId}");

        _logger.LogDebug("SignalR déconnecté: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    // ── Groupes de trajet ────────────────────────────────────────────────────

    public async Task JoinTrip(string tripId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"trip:{tripId}");
        _logger.LogDebug("{ConnectionId} a rejoint le groupe trip:{TripId}", Context.ConnectionId, tripId);
    }

    public async Task LeaveTrip(string tripId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"trip:{tripId}");
    }
}

/// <summary>
/// Service d'émission d'événements SignalR — injectable dans les services applicatifs.
/// </summary>
public class SignalREventService
{
    private readonly IHubContext<CovoiturageHub> _hub;
    private readonly ILogger<SignalREventService> _logger;

    public SignalREventService(IHubContext<CovoiturageHub> hub, ILogger<SignalREventService> logger)
    {
        _hub = hub;
        _logger = logger;
    }

    // 1. DriverPositionUpdated — GPS → passagers du trajet
    public async Task DriverPositionUpdatedAsync(Guid tripId, object positionData)
        => await _hub.Clients.Group($"trip:{tripId}").SendAsync("DriverPositionUpdated", positionData);

    // 2. ReservationReceived — notification conducteur
    public async Task ReservationReceivedAsync(Guid driverId, object reservationData)
        => await _hub.Clients.Group($"user:{driverId}").SendAsync("ReservationReceived", reservationData);

    // 3. ReservationAccepted — notification passager
    public async Task ReservationAcceptedAsync(Guid passengerId, object reservationData)
        => await _hub.Clients.Group($"user:{passengerId}").SendAsync("ReservationAccepted", reservationData);

    // 4. TripStarted — broadcast aux passagers du trajet
    public async Task TripStartedAsync(Guid tripId, object tripData)
        => await _hub.Clients.Group($"trip:{tripId}").SendAsync("TripStarted", tripData);

    // 5. TripCompleted — broadcast aux passagers du trajet
    public async Task TripCompletedAsync(Guid tripId, object tripData)
        => await _hub.Clients.Group($"trip:{tripId}").SendAsync("TripCompleted", tripData);

    // 6. SosTriggered — alerte critique → admin + passagers
    public async Task SosTriggeredAsync(Guid tripId, object sosData)
    {
        await _hub.Clients.Group($"trip:{tripId}").SendAsync("SosTriggered", sosData);
        await _hub.Clients.Group("admin").SendAsync("SosTriggered", sosData);
        _logger.LogCritical("SOS SignalR broadcast pour trip:{TripId}", tripId);
    }

    // 7. TripPublished — pour matching/alertes
    public async Task TripPublishedAsync(object tripData)
        => await _hub.Clients.All.SendAsync("TripPublished", tripData);

    // 8. SmartSuggestionReady — suggestion IA pour un utilisateur
    public async Task SmartSuggestionReadyAsync(Guid userId, object suggestion)
        => await _hub.Clients.Group($"user:{userId}").SendAsync("SmartSuggestionReady", suggestion);

    // 9. AnomalyDetected — alerte admin
    public async Task AnomalyDetectedAsync(object anomalyData)
        => await _hub.Clients.Group("admin").SendAsync("AnomalyDetected", anomalyData);

    // 10. GeofenceEntered — conducteur entre dans zone campus
    public async Task GeofenceEnteredAsync(Guid tripId, object geofenceData)
        => await _hub.Clients.Group($"trip:{tripId}").SendAsync("GeofenceEntered", geofenceData);

    // 11. PenaltyApplied — notification utilisateur
    public async Task PenaltyAppliedAsync(Guid userId, object penaltyData)
        => await _hub.Clients.Group($"user:{userId}").SendAsync("PenaltyApplied", penaltyData);

    // 12. BadgeEarned — notification utilisateur
    public async Task BadgeEarnedAsync(Guid userId, object badgeData)
        => await _hub.Clients.Group($"user:{userId}").SendAsync("BadgeEarned", badgeData);

    // ── Helper générique ─────────────────────────────────────────────────────

    public async Task SendToUserAsync(Guid userId, string eventName, object data)
        => await _hub.Clients.Group($"user:{userId}").SendAsync(eventName, data);

    public async Task SendToTripAsync(Guid tripId, string eventName, object data)
        => await _hub.Clients.Group($"trip:{tripId}").SendAsync(eventName, data);

    public async Task SendToAdminsAsync(string eventName, object data)
        => await _hub.Clients.Group("admin").SendAsync(eventName, data);
}
