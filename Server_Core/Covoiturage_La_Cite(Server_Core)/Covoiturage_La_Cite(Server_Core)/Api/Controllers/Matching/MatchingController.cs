using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Matching;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Matching;

[ApiController]
[Route("api/matching")]
[Authorize]
public class MatchingController : ControllerBase
{
    private readonly IMatchingService _service;
    public MatchingController(IMatchingService service) => _service = service;

    /// <summary>
    /// Recherche de trajets compatibles avec scoring v4.
    /// </summary>
    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] MatchingSearchDto dto, CancellationToken ct)
        => Ok(ApiResponse<MatchingResultDto>.Ok(await _service.SearchTripsAsync(GetUid(), dto, ct)));

    /// <summary>
    /// Score de compatibilité pour un trajet spécifique.
    /// </summary>
    [HttpGet("score/{tripId:guid}")]
    public async Task<IActionResult> GetScore(Guid tripId, CancellationToken ct)
    {
        var score = await _service.ComputeScoreAsync(GetUid(), tripId, ct);
        return score == null ? NotFound() : Ok(ApiResponse<MatchingScoreDto>.Ok(score));
    }

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
