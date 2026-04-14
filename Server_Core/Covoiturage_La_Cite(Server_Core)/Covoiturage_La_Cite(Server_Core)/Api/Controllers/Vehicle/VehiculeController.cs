using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Vehicle;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Vehicle;

[ApiController]
[Route("api/vehicles")]
[Authorize]
public class VehiculeController : ControllerBase
{
    private readonly IVehiculeService _service;

    public VehiculeController(IVehiculeService service)
    {
        _service = service;
    }

    /// <summary>GET /api/vehicles — Mes véhicules</summary>
    [HttpGet]
    public async Task<IActionResult> GetMyVehicles(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var vehicles = await _service.GetMyVehiclesAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<VehiculeResponseDto>>.Ok(vehicles));
    }

    /// <summary>POST /api/vehicles — Ajouter un véhicule</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVehiculeDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var vehicle = await _service.CreateAsync(userId, dto, ct);
        return CreatedAtAction(null, new { id = vehicle.Id }, ApiResponse<VehiculeResponseDto>.Ok(vehicle));
    }

    /// <summary>PUT /api/vehicles/{id} — Modifier un véhicule</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVehiculeDto dto, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var vehicle = await _service.UpdateAsync(id, userId, dto, ct);
        return Ok(ApiResponse<VehiculeResponseDto>.Ok(vehicle, "Véhicule mis à jour"));
    }

    /// <summary>PATCH /api/vehicles/{id}/set-default — Définir comme véhicule par défaut</summary>
    [HttpPatch("{id:guid}/set-default")]
    public async Task<IActionResult> SetDefault(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _service.SetDefaultAsync(id, userId, ct);
        return Ok(ApiResponse.Ok("Véhicule défini par défaut"));
    }

    /// <summary>DELETE /api/vehicles/{id} — Désactiver un véhicule</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _service.DeactivateAsync(id, userId, ct);
        return Ok(ApiResponse.Ok("Véhicule désactivé"));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
