using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Chat;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Chat;

[ApiController]
[Route("api/messages")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chat;

    public ChatController(IChatService chat) => _chat = chat;

    /// <summary>POST /api/messages — Envoie un message dans une conversation de trajet.</summary>
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendMessageDto dto, CancellationToken ct)
    {
        var senderId = GetCurrentUserId();
        var response = await _chat.SendAsync(senderId, dto, ct);
        return Ok(ApiResponse<ChatMessageResponseDto>.Ok(response));
    }

    /// <summary>GET /api/messages/conversations — Liste les conversations actives de l'utilisateur.</summary>
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var conversations = await _chat.GetMyConversationsAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<ConversationSummaryDto>>.Ok(conversations));
    }

    /// <summary>GET /api/messages/unread-count — Nombre total de messages non lus.</summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var count = await _chat.GetUnreadCountAsync(userId, ct);
        return Ok(ApiResponse<int>.Ok(count));
    }

    /// <summary>GET /api/messages/{tripId}?page=1&pageSize=50 — Historique paginé d'une conversation.</summary>
    [HttpGet("{tripId:guid}")]
    public async Task<IActionResult> GetConversation(
        Guid tripId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var messages = await _chat.GetConversationAsync(userId, tripId, page, pageSize, ct);
        return Ok(ApiResponse<IEnumerable<ChatMessageResponseDto>>.Ok(messages));
    }

    /// <summary>PATCH /api/messages/{tripId}/read — Marque tous les messages d'une conversation comme lus.</summary>
    [HttpPatch("{tripId:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid tripId, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _chat.MarkConversationReadAsync(userId, tripId, ct);
        return Ok(ApiResponse.Ok("Conversation marquée comme lue"));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
