using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Gamification;

[ApiController]
[Route("api/gotasks")]
[Authorize]
public class GoTaskController : ControllerBase
{
    private readonly IGoTaskService _service;

    public GoTaskController(IGoTaskService service) => _service = service;

    /// <summary>GET /api/gotasks — toutes les GoTasks avec progression de l'utilisateur courant.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var tasks = await _service.GetAllWithProgressionAsync(userId, ct);
        return Ok(ApiResponse<object>.Ok(tasks));
    }

    /// <summary>GET /api/gotasks/goboard — GoBoard complet de l'utilisateur courant.</summary>
    [HttpGet("goboard")]
    public async Task<IActionResult> GetGoBoard(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var board = await _service.GetGoBoardAsync(userId, ct);
        return Ok(ApiResponse<object>.Ok(board));
    }

    /// <summary>POST /api/gotasks/{key}/complete — déclenche la complétion d'une GoTask.</summary>
    [HttpPost("{key}/complete")]
    public async Task<IActionResult> Complete(string key, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var completed = await _service.TryCompleteAsync(userId, key, ct);
        return Ok(ApiResponse<object>.Ok(new { completed, taskKey = key }));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
