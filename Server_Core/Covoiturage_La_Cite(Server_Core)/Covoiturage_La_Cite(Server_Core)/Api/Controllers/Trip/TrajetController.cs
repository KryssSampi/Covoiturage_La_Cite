using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Trip;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Trip;

[ApiController]
[Route("api/trips")]
[Authorize]
public class TrajetController : ControllerBase
{
    private readonly ITrajetService _trajetService;

    public TrajetController(ITrajetService trajetService)
    {
        _trajetService = trajetService;
    }

    /// <summary>GET /api/trips/search — Recherche géospatiale + filtres + pagination</summary>
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] TrajetSearchDto criteria, CancellationToken ct)
    {
        var result = await _trajetService.SearchAsync(criteria, ct);
        return Ok(ApiResponse<PaginatedResult<TrajetResponseDto>>.Ok(result));
    }

    /// <summary>GET /api/trips/{id} — Détail trajet complet</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var trip = await _trajetService.GetByIdAsync(id, ct);
        if (trip == null) return NotFound(ApiResponse.Fail("Trajet introuvable"));
        return Ok(ApiResponse<TrajetResponseDto>.Ok(trip));
    }

    /// <summary>POST /api/trips — Créer trajet (calcul OSRM auto)</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTrajetDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var trip = await _trajetService.CreateAsync(userId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = trip.Id }, ApiResponse<TrajetResponseDto>.Ok(trip));
    }

    /// <summary>PUT /api/trips/{id} — Modifier trajet</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTrajetDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var trip = await _trajetService.UpdateAsync(id, userId, dto, ct);
        return Ok(ApiResponse<TrajetResponseDto>.Ok(trip, "Trajet mis à jour"));
    }

    /// <summary>PATCH /api/trips/{id}/publish — Publier brouillon</summary>
    [HttpPatch("{id:guid}/publish")]
    public async Task<IActionResult> Publish(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var trip = await _trajetService.PublishAsync(id, userId, ct);
        return Ok(ApiResponse<TrajetResponseDto>.Ok(trip, "Trajet publié"));
    }

    /// <summary>PATCH /api/trips/{id}/start — Démarrer trajet (active GPS)</summary>
    [HttpPatch("{id:guid}/start")]
    public async Task<IActionResult> Start(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var trip = await _trajetService.StartAsync(id, userId, ct);
        return Ok(ApiResponse<TrajetResponseDto>.Ok(trip, "Trajet démarré"));
    }

    /// <summary>PATCH /api/trips/{id}/complete — Terminer trajet (capture paiement)</summary>
    [HttpPatch("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var trip = await _trajetService.CompleteAsync(id, userId, ct);
        return Ok(ApiResponse<TrajetResponseDto>.Ok(trip, "Trajet terminé"));
    }

    /// <summary>POST /api/trips/{id}/cancel — Annuler avec raison</summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelTripRequest request, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _trajetService.CancelAsync(id, userId, request.Reason, ct);
        return Ok(ApiResponse.Ok("Trajet annulé"));
    }

    /// <summary>GET /api/trips/mine/driver — Mes trajets conducteur</summary>
    [HttpGet("mine/driver")]
    public async Task<IActionResult> GetMyDriverTrips(
        [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var result = await _trajetService.GetDriverTripsAsync(userId, status, page, pageSize, ct);
        return Ok(ApiResponse<PaginatedResult<TrajetResponseDto>>.Ok(result));
    }

    /// <summary>GET /api/trips/{id}/passengers — Passagers confirmés</summary>
    [HttpGet("{id:guid}/passengers")]
    public async Task<IActionResult> GetPassengers(Guid id, CancellationToken ct)
    {
        var passengers = await _trajetService.GetTripPassengersAsync(id, ct);
        return Ok(ApiResponse<IEnumerable<TrajetPassengerDto>>.Ok(passengers));
    }

    /// <summary>GET /api/trips/{id}/live — Données temps réel</summary>
    [HttpGet("{id:guid}/live")]
    public async Task<IActionResult> GetLive(Guid id, CancellationToken ct)
    {
        var data = await _trajetService.GetTripEnCoursAsync(id, ct);
        if (data == null) return NotFound(ApiResponse.Fail("Aucun trajet en cours"));
        return Ok(ApiResponse<TrajetEnCoursDto>.Ok(data));
    }

    /// <summary>POST /api/trips/{id}/save-draft — Sauvegarder brouillon</summary>
    [HttpPost("{id:guid}/save-draft")]
    public async Task<IActionResult> SaveDraft([FromBody] CreateTrajetDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var trip = await _trajetService.SaveDraftAsync(userId, dto, ct);
        return Ok(ApiResponse<TrajetResponseDto>.Ok(trip, "Brouillon sauvegardé"));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
