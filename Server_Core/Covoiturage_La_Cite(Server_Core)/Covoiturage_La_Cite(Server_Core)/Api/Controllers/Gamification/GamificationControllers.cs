using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Gamification;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Gamification;

[ApiController]
[Route("api/badges")]
[Authorize]
public class BadgeController : ControllerBase
{
    private readonly IGamificationService _service;
    public BadgeController(IGamificationService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<BadgeResponseDto>>.Ok(await _service.GetAllBadgesAsync(ct)));

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<UserBadgeResponseDto>>.Ok(await _service.GetMyBadgesAsync(GetUid(), ct)));

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}

[ApiController]
[Route("api/challenges")]
[Authorize]
public class ChallengeController : ControllerBase
{
    private readonly IGamificationService _service;
    public ChallengeController(IGamificationService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetActive(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<EcoChallengeResponseDto>>.Ok(await _service.GetActiveChallengesAsync(ct)));

    [HttpPost("{challengeId:guid}/join")]
    public async Task<IActionResult> Join(Guid challengeId, CancellationToken ct)
    {
        var result = await _service.JoinChallengeAsync(GetUid(), challengeId, ct);
        return CreatedAtAction(null, ApiResponse<ChallengeParticipationResponseDto>.Ok(result));
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<ChallengeParticipationResponseDto>>.Ok(await _service.GetMyChallengesAsync(GetUid(), ct)));

    [HttpGet("{challengeId:guid}/leaderboard")]
    public async Task<IActionResult> Leaderboard(Guid challengeId, [FromQuery] int top = 10, CancellationToken ct = default)
        => Ok(ApiResponse<IEnumerable<ChallengeParticipationResponseDto>>.Ok(await _service.GetLeaderboardAsync(challengeId, top, ct)));

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
