using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Gps;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Gps;

[ApiController]
[Route("api/gps")]
[Authorize]
public class GpsController : ControllerBase
{
    private readonly IGpsTrackingService _service;
    public GpsController(IGpsTrackingService service) => _service = service;

    [HttpPost("position")]
    public async Task<IActionResult> RecordPosition([FromBody] RecordPositionDto dto, CancellationToken ct)
    {
        var result = await _service.RecordPositionAsync(GetUid(), dto, ct);
        return CreatedAtAction(null, ApiResponse<GpsPositionResponseDto>.Ok(result));
    }

    [HttpPost("positions/batch")]
    public async Task<IActionResult> RecordBatch([FromBody] IEnumerable<RecordPositionDto> batch, CancellationToken ct)
    {
        await _service.RecordBatchAsync(GetUid(), batch, ct);
        return Ok(ApiResponse<string>.Ok("Batch enregistré"));
    }

    [HttpGet("trips/{tripId:guid}/latest/{userId:guid}")]
    public async Task<IActionResult> GetLatest(Guid tripId, Guid userId, CancellationToken ct)
    {
        var result = await _service.GetLatestPositionAsync(tripId, userId, ct);
        return result == null ? NotFound() : Ok(ApiResponse<GpsPositionResponseDto>.Ok(result));
    }

    [HttpGet("trips/{tripId:guid}/trace")]
    public async Task<IActionResult> GetTrace(Guid tripId, [FromQuery] DateTimeOffset? since, CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<GpsPositionResponseDto>>.Ok(await _service.GetTripTraceAsync(tripId, since, ct)));

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}

[ApiController]
[Route("api/sos")]
[Authorize]
public class SosAlertController : ControllerBase
{
    private readonly IGpsTrackingService _service;
    public SosAlertController(IGpsTrackingService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> TriggerSos([FromBody] TriggerSosDto dto, CancellationToken ct)
    {
        var result = await _service.TriggerSosAsync(GetUid(), dto, ct);
        return CreatedAtAction(null, ApiResponse<SosAlertResponseDto>.Ok(result));
    }

    [HttpPatch("{alertId:guid}/resolve")]
    public async Task<IActionResult> Resolve(Guid alertId, CancellationToken ct)
        => Ok(ApiResponse<SosAlertResponseDto>.Ok(await _service.ResolveSosAsync(alertId, ct)));

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<SosAlertResponseDto>>.Ok(await _service.GetMySosAlertsAsync(GetUid(), ct)));

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<SosAlertResponseDto>>.Ok(await _service.GetPendingSosAlertsAsync(ct)));

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
