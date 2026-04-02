using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Campus;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Campus;

[ApiController]
[Route("api/campus/zones")]
[Authorize]
public class CampusZoneController : ControllerBase
{
    private readonly ICampusService _service;
    public CampusZoneController(ICampusService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<GeofenceZoneResponseDto>>.Ok(await _service.GetAllZonesAsync(ct)));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var zone = await _service.GetZoneByIdAsync(id, ct);
        return zone == null ? NotFound() : Ok(ApiResponse<GeofenceZoneResponseDto>.Ok(zone));
    }

    [HttpGet("type/{zoneType}")]
    public async Task<IActionResult> GetByType(string zoneType, CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<GeofenceZoneResponseDto>>.Ok(await _service.GetZonesByTypeAsync(zoneType, ct)));

    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearby([FromQuery] double lat, [FromQuery] double lng, [FromQuery] double radius = 500, CancellationToken ct = default)
        => Ok(ApiResponse<IEnumerable<GeofenceZoneResponseDto>>.Ok(await _service.GetNearbyZonesAsync(lat, lng, radius, ct)));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGeofenceZoneDto dto, CancellationToken ct)
    {
        var result = await _service.CreateZoneAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<GeofenceZoneResponseDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGeofenceZoneDto dto, CancellationToken ct)
        => Ok(ApiResponse<GeofenceZoneResponseDto>.Ok(await _service.UpdateZoneAsync(id, dto, ct)));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    { await _service.DeactivateZoneAsync(id, ct); return NoContent(); }
}

[ApiController]
[Route("api/trips/{tripId:guid}/waypoints")]
[Authorize]
public class WaypointController : ControllerBase
{
    private readonly ICampusService _service;
    public WaypointController(ICampusService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid tripId, CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<WaypointResponseDto>>.Ok(await _service.GetTripWaypointsAsync(tripId, ct)));

    [HttpPost]
    public async Task<IActionResult> Add(Guid tripId, [FromBody] CreateWaypointDto dto, CancellationToken ct)
    {
        var result = await _service.AddWaypointAsync(tripId, dto, ct);
        return CreatedAtAction(null, ApiResponse<WaypointResponseDto>.Ok(result));
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> Reorder(Guid tripId, [FromBody] IEnumerable<ReorderWaypointDto> order, CancellationToken ct)
    { await _service.ReorderWaypointsAsync(tripId, order, ct); return Ok(ApiResponse<string>.Ok("Réordonné")); }

    [HttpDelete("{waypointId:guid}")]
    public async Task<IActionResult> Delete(Guid waypointId, CancellationToken ct)
    { await _service.DeleteWaypointAsync(waypointId, ct); return NoContent(); }
}
