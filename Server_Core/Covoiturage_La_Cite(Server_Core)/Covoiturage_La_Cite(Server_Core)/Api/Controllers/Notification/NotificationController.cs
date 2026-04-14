using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Notification;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationController(INotificationService service) => _service = service;

    /// <summary>GET /api/notifications?page=1&pageSize=20</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var notifications = await _service.GetMyNotificationsAsync(userId, page, pageSize, ct);
        return Ok(ApiResponse<IEnumerable<NotificationResponseDto>>.Ok(notifications));
    }

    /// <summary>GET /api/notifications/unread</summary>
    [HttpGet("unread")]
    public async Task<IActionResult> GetUnread(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var notifications = await _service.GetUnreadAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<NotificationResponseDto>>.Ok(notifications));
    }

    /// <summary>GET /api/notifications/unread-count</summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var count = await _service.GetUnreadCountAsync(userId, ct);
        return Ok(ApiResponse<int>.Ok(count));
    }

    /// <summary>PATCH /api/notifications/{id}/read</summary>
    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _service.MarkAsReadAsync(id, userId, ct);
        return Ok(ApiResponse.Ok("Notification marquée comme lue"));
    }

    /// <summary>PATCH /api/notifications/read-all</summary>
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _service.MarkAllAsReadAsync(userId, ct);
        return Ok(ApiResponse.Ok("Toutes les notifications marquées comme lues"));
    }

    /// <summary>DELETE /api/notifications/{id}</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _service.DeleteAsync(id, userId, ct);
        return Ok(ApiResponse.Ok("Notification supprimée"));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
