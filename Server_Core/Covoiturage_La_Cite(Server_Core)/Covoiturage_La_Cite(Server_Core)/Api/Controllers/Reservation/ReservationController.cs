using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Reservation;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Reservation;

[ApiController]
[Route("api/reservations")]
[Authorize]
public class ReservationController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    /// <summary>POST /api/reservations — Créer demande réservation</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _reservationService.CreateAsync(userId, dto, ct);
        return Ok(ApiResponse<ReservationResponseDto>.Ok(result, "Réservation créée"));
    }

    /// <summary>GET /api/reservations/{id} — Détail réservation</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var reservation = await _reservationService.GetByIdAsync(id, ct);
        if (reservation == null) return NotFound(ApiResponse.Fail("Réservation introuvable"));
        return Ok(ApiResponse<ReservationResponseDto>.Ok(reservation));
    }

    /// <summary>GET /api/reservations/mine — Mes réservations (role passager/conducteur)</summary>
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine([FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        role ??= User.FindFirst(ClaimTypes.Role)?.Value;
        var result = await _reservationService.GetMineAsync(userId, role, page, pageSize, ct);
        return Ok(ApiResponse<PaginatedResult<ReservationResponseDto>>.Ok(result));
    }

    /// <summary>GET /api/reservations — Alias compatibilité (même que /mine)</summary>
    [HttpGet]
    public async Task<IActionResult> GetMineAlias([FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => await GetMine(role, page, pageSize, ct);

    /// <summary>GET /api/reservations/active — Demandes actives passager</summary>
    [HttpGet("active")]
    public async Task<IActionResult> GetActive(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _reservationService.GetActiveByPassengerAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<ReservationResponseDto>>.Ok(result));
    }

    /// <summary>POST /api/reservations/{id}/accept — Acceptation conducteur</summary>
    [HttpPost("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _reservationService.AcceptAsync(id, userId, ct);
        return Ok(ApiResponse<ReservationResponseDto>.Ok(result, "Réservation acceptée"));
    }

    /// <summary>POST /api/reservations/{id}/refuse — Refus conducteur</summary>
    [HttpPost("{id:guid}/refuse")]
    public async Task<IActionResult> Refuse(Guid id, [FromBody] ReservationDecisionRequest request, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _reservationService.RefuseAsync(id, userId, request.Reason, ct);
        return Ok(ApiResponse<ReservationResponseDto>.Ok(result, "Réservation refusée"));
    }

    /// <summary>POST /api/reservations/{id}/cancel — Annulation</summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] ReservationDecisionRequest request, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _reservationService.CancelAsync(id, userId, request.Reason, ct);
        return Ok(ApiResponse<ReservationResponseDto>.Ok(result, "Réservation annulée"));
    }

    /// <summary>PATCH /api/reservations/{id}/boarding/driver — Embarquement conducteur</summary>
    [HttpPatch("{id:guid}/boarding/driver")]
    public async Task<IActionResult> BoardingDriver(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _reservationService.ConfirmBoardingDriverAsync(id, userId, ct);
        return Ok(ApiResponse<ReservationResponseDto>.Ok(result));
    }

    /// <summary>PATCH /api/reservations/{id}/boarding/passenger — Embarquement passager</summary>
    [HttpPatch("{id:guid}/boarding/passenger")]
    public async Task<IActionResult> BoardingPassenger(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _reservationService.ConfirmBoardingPassengerAsync(id, userId, ct);
        return Ok(ApiResponse<ReservationResponseDto>.Ok(result));
    }

    /// <summary>POST /api/reservations/cancel-all — Annulation groupée</summary>
    [HttpPost("cancel-all")]
    public async Task<IActionResult> CancelAll(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _reservationService.CancelAllPendingAsync(userId, ct);
        return Ok(ApiResponse.Ok("Réservations annulées"));
    }

    // -- Compatibilité routes web existantes ---------------------------------

    /// <summary>GET /api/driver/reservation-requests — Demandes conducteur (en attente)</summary>
    [HttpGet("/api/driver/reservation-requests")]
    public async Task<IActionResult> GetDriverRequests(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _reservationService.GetDriverRequestsAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<ReservationEnrichedDto>>.Ok(result));
    }

    /// <summary>GET /api/passenger/reservations-enriched — Réservations enrichies passager</summary>
    [HttpGet("/api/passenger/reservations-enriched")]
    public async Task<IActionResult> GetPassengerEnriched([FromQuery] Guid? passengerId, CancellationToken ct)
    {
        var userId = passengerId ?? GetCurrentUserId();
        var result = await _reservationService.GetPassengerEnrichedAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<ReservationEnrichedDto>>.Ok(result));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
