using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Pipeda;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Pipeda;

[ApiController]
[Route("api/pipeda")]
[Authorize]
public class PipedaController : ControllerBase
{
    private readonly IPipedaComplianceService _service;
    public PipedaController(IPipedaComplianceService service) => _service = service;

    // ── Consentements ───────────────────────────────────────────────────────

    /// <summary>GET /api/pipeda/consent — Consulter mes consentements.</summary>
    [HttpGet("consent")]
    public async Task<IActionResult> GetConsent(CancellationToken ct)
        => Ok(ApiResponse<ConsentementDto>.Ok(await _service.GetConsentAsync(GetUid(), ct)));

    /// <summary>PUT /api/pipeda/consent — Mettre à jour mes consentements.</summary>
    [HttpPut("consent")]
    public async Task<IActionResult> UpdateConsent([FromBody] UpdateConsentDto dto, CancellationToken ct)
        => Ok(ApiResponse<ConsentementDto>.Ok(await _service.UpdateConsentAsync(GetUid(), dto, ct)));

    // ── Export de données ───────────────────────────────────────────────────

    /// <summary>POST /api/pipeda/export — Demander un export de mes données.</summary>
    [HttpPost("export")]
    public async Task<IActionResult> RequestExport(CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        return Ok(ApiResponse<DataExportRequestDto>.Ok(await _service.RequestDataExportAsync(GetUid(), ip, ct)));
    }

    /// <summary>GET /api/pipeda/exports — Consulter mes exports.</summary>
    [HttpGet("exports")]
    public async Task<IActionResult> GetMyExports(CancellationToken ct)
        => Ok(ApiResponse<List<DataExportStatusDto>>.Ok(await _service.GetMyExportsAsync(GetUid(), ct)));

    // ── Suppression de compte ───────────────────────────────────────────────

    /// <summary>DELETE /api/pipeda/account — Anonymiser mon compte (PIPEDA).</summary>
    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount([FromBody] AnonymizeAccountDto? dto, CancellationToken ct)
    {
        await _service.AnonymizeAccountAsync(GetUid(), dto?.Reason, ct);
        return NoContent();
    }

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
