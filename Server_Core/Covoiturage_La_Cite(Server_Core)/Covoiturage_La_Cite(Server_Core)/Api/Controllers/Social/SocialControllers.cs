using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Social;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Social;

// ── Reviews ──────────────────────────────────────────────────────────────────

[ApiController]
[Route("api/reviews")]
[Authorize]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _service;
    public ReviewController(IReviewService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto, CancellationToken ct)
    {
        var review = await _service.CreateAsync(GetUid(), dto, ct);
        return CreatedAtAction(null, new { id = review.Id }, ApiResponse<ReviewResponseDto>.Ok(review));
    }

    [HttpGet("received")]
    public async Task<IActionResult> GetReceived(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<ReviewResponseDto>>.Ok(await _service.GetReceivedReviewsAsync(GetUid(), ct)));

    [HttpGet("given")]
    public async Task<IActionResult> GetGiven(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<ReviewResponseDto>>.Ok(await _service.GetGivenReviewsAsync(GetUid(), ct)));

    [HttpGet("{userId:guid}/average")]
    public async Task<IActionResult> GetAverage(Guid userId, CancellationToken ct)
        => Ok(ApiResponse<double>.Ok(await _service.GetAverageRatingAsync(userId, ct)));

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}

// ── Favoris / Affinités ──────────────────────────────────────────────────────

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly IAffinityService _service;
    public FavoriteController(IAffinityService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetFavorites(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<AffinityResponseDto>>.Ok(await _service.GetFavoritesAsync(GetUid(), ct)));

    [HttpPost("{targetUserId:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid targetUserId, CancellationToken ct)
        => Ok(ApiResponse<AffinityResponseDto>.Ok(await _service.ToggleFavoriteAsync(GetUid(), targetUserId, ct)));

    [HttpPost("{targetUserId:guid}/block")]
    public async Task<IActionResult> Block(Guid targetUserId, CancellationToken ct)
        => Ok(ApiResponse<AffinityResponseDto>.Ok(await _service.BlockUserAsync(GetUid(), targetUserId, ct)));

    [HttpPost("{targetUserId:guid}/unblock")]
    public async Task<IActionResult> Unblock(Guid targetUserId, CancellationToken ct)
        => Ok(ApiResponse<AffinityResponseDto>.Ok(await _service.UnblockUserAsync(GetUid(), targetUserId, ct)));

    [HttpGet("top-affinities")]
    public async Task<IActionResult> GetTopAffinities([FromQuery] int top = 10, CancellationToken ct = default)
        => Ok(ApiResponse<IEnumerable<AffinityResponseDto>>.Ok(await _service.GetTopAffinitiesAsync(GetUid(), top, ct)));

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}

// ── Signalements ─────────────────────────────────────────────────────────────

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly IReportService _service;
    public ReportController(IReportService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReportDto dto, CancellationToken ct)
    {
        var report = await _service.CreateAsync(GetUid(), dto, ct);
        return CreatedAtAction(null, new { id = report.Id }, ApiResponse<ReportResponseDto>.Ok(report));
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<ReportResponseDto>>.Ok(await _service.GetMyReportsAsync(GetUid(), ct)));

    [HttpGet("ref/{publicReference}")]
    public async Task<IActionResult> GetByReference(string publicReference, CancellationToken ct)
    {
        var report = await _service.GetByReferenceAsync(publicReference, ct);
        if (report == null) return NotFound(ApiResponse.Fail("Signalement introuvable"));
        return Ok(ApiResponse<ReportResponseDto>.Ok(report));
    }

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
