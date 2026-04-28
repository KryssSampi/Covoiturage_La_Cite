using System.Security.Claims;
using System.Text;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Sse;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Sse;

[ApiController]
[Route("api/sse")]
[Authorize]
public class NotificationSseController : ControllerBase
{
    private readonly SseChannelService _sse;
    private readonly AppDbContext _db;
    private readonly ILogger<NotificationSseController> _logger;

    public NotificationSseController(SseChannelService sse, AppDbContext db, ILogger<NotificationSseController> logger)
    {
        _sse = sse;
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/sse/health
    /// Health-check du service SSE — ne nécessite pas d'authentification.
    /// Retourne OK si le service SSE est opérationnel.
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult Health()
    {
        return Ok(new { status = "ok", service = "sse", timestamp = DateTimeOffset.UtcNow });
    }

    /// <summary>
    /// GET /api/sse/notifications
    /// Ouvre un flux SSE (text/event-stream) pour les notifications temps réel.
    /// Le client doit envoyer le JWT dans le header Authorization (Bearer).
    /// Événements émis :
    ///   - "notification" : NotificationResponseDto JSON
    ///   - "ping"         : heartbeat toutes les 25 secondes (keep-alive)
    /// </summary>
    [HttpGet("notifications")]
    public async Task GetNotifications(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        _logger.LogDebug("SSE connexion ouverte: {UserId}", userId);

        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("X-Accel-Buffering", "no"); // nginx: désactive le buffering
        Response.StatusCode = 200;
        await Response.Body.FlushAsync(ct);

        var reader = _sse.Subscribe(userId);

        try
        {
            using var pingTimer = new PeriodicTimer(TimeSpan.FromSeconds(25));
            var pingTask = Task.Run(async () =>
            {
                while (await pingTimer.WaitForNextTickAsync(ct))
                {
                    _sse.Publish(userId, "ping", new { ts = DateTimeOffset.UtcNow });
                }
            }, ct);

            await foreach (var message in reader.ReadAllAsync(ct))
            {
                var bytes = Encoding.UTF8.GetBytes(message);
                await Response.Body.WriteAsync(bytes, ct);
                await Response.Body.FlushAsync(ct);
            }
        }
        catch (OperationCanceledException)
        {
            // Client déconnecté — normal
        }
        finally
        {
            _sse.Unsubscribe(userId);
            _logger.LogDebug("SSE connexion fermée: {UserId}", userId);
        }
    }

    /// <summary>
    /// GET /api/sse/feed
    /// Flux SSE unifie pour App Flutter + Site Web:
    /// - event "bootstrap": snapshot initial pour alimenter les ecrans GET
    /// - event "resource-updated": invalidation fine de ressources
    /// - event "notification": notification applicative
    /// - event "ping": keepalive
    /// </summary>
    [HttpGet("feed")]
    public async Task GetFeed([FromQuery] bool includeBootstrap = true, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();

        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("X-Accel-Buffering", "no");
        Response.StatusCode = 200;
        await Response.Body.FlushAsync(ct);

        if (includeBootstrap)
        {
            var now = DateTimeOffset.UtcNow;
            var today = DateOnly.FromDateTime(now.UtcDateTime);

            var unreadCount = await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, ct);
            var myNotifications = await _db.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .Select(n => new { n.Id, n.Type, n.Title, n.Body, n.IsRead, n.IsImportant, n.DeepLink, n.CreatedAt, n.RelatedTripId, n.RelatedReservationId })
                .ToListAsync(ct);
            var myUpcomingTrips = await _db.Trips
                .Where(t => t.DriverId == userId && t.DepartureDate >= today &&
                            (t.Status == TripStatus.Published || t.Status == TripStatus.Full || t.Status == TripStatus.InProgress))
                .OrderBy(t => t.DepartureDate).ThenBy(t => t.DepartureTime)
                .Take(20)
                .Select(t => new { t.Id, t.Status, t.DepartureLabel, t.ArrivalLabel, t.DepartureDate, t.DepartureTime, t.CurrentPassengers, t.MaxPassengers })
                .ToListAsync(ct);
            var myReservations = await _db.Reservations
                .Where(r => r.PassengerId == userId &&
                            (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.InProgress))
                .OrderByDescending(r => r.UpdatedAt)
                .Take(20)
                .Select(r => new { r.Id, r.TripId, r.Status, r.ExpiresAt, r.UpdatedAt, r.TotalAmount })
                .ToListAsync(ct);

            var bootstrap = new
            {
                now,
                unreadCount,
                notifications = myNotifications,
                upcomingTrips = myUpcomingTrips,
                activeReservations = myReservations
            };
            var bootstrapJson = System.Text.Json.JsonSerializer.Serialize(bootstrap);
            var bootstrapMessage = $"event: bootstrap\ndata: {bootstrapJson}\n\n";
            await Response.Body.WriteAsync(Encoding.UTF8.GetBytes(bootstrapMessage), ct);
            await Response.Body.FlushAsync(ct);
        }

        var reader = _sse.Subscribe(userId);
        try
        {
            using var pingTimer = new PeriodicTimer(TimeSpan.FromSeconds(25));
            _ = Task.Run(async () =>
            {
                while (await pingTimer.WaitForNextTickAsync(ct))
                    _sse.Publish(userId, "ping", new { ts = DateTimeOffset.UtcNow });
            }, ct);

            await foreach (var message in reader.ReadAllAsync(ct))
            {
                var bytes = Encoding.UTF8.GetBytes(message);
                await Response.Body.WriteAsync(bytes, ct);
                await Response.Body.FlushAsync(ct);
            }
        }
        catch (OperationCanceledException) { }
        finally
        {
            _sse.Unsubscribe(userId);
        }
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
