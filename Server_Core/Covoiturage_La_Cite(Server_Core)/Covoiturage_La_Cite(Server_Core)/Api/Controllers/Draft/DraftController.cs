using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Trip;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Draft;

[ApiController]
[Route("api/drafts")]
[Authorize]
public class DraftController : ControllerBase
{
    private readonly ITrajetService _trajetService;

    public DraftController(ITrajetService trajetService)
    {
        _trajetService = trajetService;
    }

    /// <summary>GET /api/drafts — Tous mes brouillons</summary>
    [HttpGet]
    public async Task<IActionResult> GetDrafts(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var drafts = await _trajetService.GetDraftsAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<TrajetResponseDto>>.Ok(drafts));
    }

    /// <summary>GET /api/drafts/{id} — Un brouillon spécifique</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDraftById(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var draft = await _trajetService.GetDraftByIdAsync(id, userId, ct);
        if (draft == null) return NotFound(ApiResponse.Fail("Brouillon introuvable"));
        return Ok(ApiResponse<TrajetResponseDto>.Ok(draft));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
