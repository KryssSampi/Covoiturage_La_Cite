using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.UserController;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>GET /api/users/me — Profil complet de l'utilisateur connecté</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var user = await _userService.GetCurrentUserAsync(userId, ct);
        if (user == null) return NotFound(ApiResponse.Fail("Utilisateur introuvable"));
        return Ok(ApiResponse<UserResponseDto>.Ok(user));
    }

    /// <summary>PATCH /api/users/me — Mise à jour du profil</summary>
    [HttpPatch("me")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var updated = await _userService.UpdateProfileAsync(userId, dto, ct);
        return Ok(ApiResponse<UserResponseDto>.Ok(updated, "Profil mis à jour"));
    }

    /// <summary>DELETE /api/users/me — Suppression de compte (soft delete PIPEDA)</summary>
    [HttpDelete("me")]
    [Authorize]
    public async Task<IActionResult> DeleteAccount(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _userService.SoftDeleteAsync(userId, ct);
        return Ok(ApiResponse.Ok("Compte supprimé"));
    }

    /// <summary>GET /api/users/{id}/public — Profil public étendu</summary>
    [HttpGet("{id:guid}/public")]
    [Authorize]
    public async Task<IActionResult> GetPublicProfile(Guid id, CancellationToken ct)
    {
        var requesterId = GetCurrentUserId();
        var profile = await _userService.GetPublicProfileAsync(id, requesterId, ct);
        if (profile == null) return NotFound(ApiResponse.Fail("Utilisateur introuvable"));
        return Ok(ApiResponse<UserPublicDto>.Ok(profile));
    }

    /// <summary>POST /api/users/{id}/like — Toggle like (idempotent)</summary>
    [HttpPost("{id:guid}/like")]
    [Authorize]
    public async Task<IActionResult> ToggleLike(Guid id, CancellationToken ct)
    {
        var likerId = GetCurrentUserId();
        if (likerId == id) return BadRequest(ApiResponse.Fail("Impossible de se liker soi-même"));
        var (isLiked, count) = await _userService.ToggleLikeAsync(likerId, id, ct);
        return Ok(ApiResponse<object>.Ok(new { isLiked, count }));
    }

    /// <summary>POST /api/users/{id}/survey-alert — Créer une alerte de suivi de trajet conducteur</summary>
    [HttpPost("{id:guid}/survey-alert")]
    [Authorize]
    public async Task<IActionResult> CreateSurveyAlert(Guid id, [FromBody] CreateSurveyAlertDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        // id dans l'URL = driverId, on force la cohérence
        var correctedDto = dto with { DriverId = id };
        var alert = await _userService.CreateSurveyAlertAsync(userId, correctedDto, ct);
        return Ok(ApiResponse<SurveyTripAlertDto>.Ok(alert));
    }

    /// <summary>GET /api/users — Liste admin paginée</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _userService.GetAllPaginatedAsync(page, pageSize, search, ct);
        return Ok(ApiResponse<PaginatedResult<UserResponseDto>>.Ok(result));
    }

    /// <summary>GET /api/users/{id} — Détail utilisateur (admin)</summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUserById(Guid id, CancellationToken ct)
    {
        var user = await _userService.GetByIdAsync(id, ct);
        if (user == null) return NotFound(ApiResponse.Fail("Utilisateur introuvable"));
        return Ok(ApiResponse<UserResponseDto>.Ok(user));
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}