using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Stats;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Stats;

[ApiController]
[Route("api/user-stats")]
[Authorize]
public class UserStatsController : ControllerBase
{
    private readonly IUserStatsService _service;

    public UserStatsController(IUserStatsService service)
    {
        _service = service;
    }

    /// <summary>GET /api/user-stats/{userId}?periode=mois — Données brutes pour les statistiques</summary>
    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetStats(Guid userId, [FromQuery] string periode = "mois", CancellationToken ct = default)
    {
        // Vérifier que l'utilisateur ne demande que ses propres stats (sauf Admin)
        var requesterId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && requesterId != userId)
            return Forbid();

        var raw = await _service.GetRawStatsAsync(userId, periode, ct);
        if (raw == null)
            return NotFound(ApiResponse.Fail("Statistiques introuvables pour cet utilisateur"));

        return Ok(ApiResponse<UserStatsRawDto>.Ok(raw));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
