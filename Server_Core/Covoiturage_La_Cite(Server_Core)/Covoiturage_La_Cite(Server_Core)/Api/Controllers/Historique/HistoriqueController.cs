using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Trip;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Historique;

/// <summary>
/// Routes historique pour conducteurs et passagers.
/// </summary>
[ApiController]
[Authorize]
public class HistoriqueController : ControllerBase
{
    private readonly ITrajetService _trajetService;

    public HistoriqueController(ITrajetService trajetService)
    {
        _trajetService = trajetService;
    }

    /// <summary>GET /api/driver/historique — Historique trajets conducteur</summary>
    [HttpGet("api/driver/historique")]
    public async Task<IActionResult> GetDriverHistorique(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var result = await _trajetService.GetDriverHistoriqueAsync(userId, page, pageSize, ct);
        return Ok(ApiResponse<PaginatedResult<TrajetResponseDto>>.Ok(result));
    }

    /// <summary>GET /api/passenger/historique — Historique trajets passager</summary>
    [HttpGet("api/passenger/historique")]
    public async Task<IActionResult> GetPassengerHistorique(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var result = await _trajetService.GetPassengerHistoriqueAsync(userId, page, pageSize, ct);
        return Ok(ApiResponse<PaginatedResult<TrajetResponseDto>>.Ok(result));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
