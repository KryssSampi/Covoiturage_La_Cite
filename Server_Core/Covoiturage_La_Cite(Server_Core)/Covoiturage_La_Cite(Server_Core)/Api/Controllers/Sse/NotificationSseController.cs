using System.Security.Claims;
using System.Text;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Sse;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Sse;

[ApiController]
[Route("api/sse")]
[Authorize]
public class NotificationSseController : ControllerBase
{
    private readonly SseChannelService _sse;
    private readonly ILogger<NotificationSseController> _logger;

    public NotificationSseController(SseChannelService sse, ILogger<NotificationSseController> logger)
    {
        _sse = sse;
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

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
