using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/compliance")]
[Authorize(Roles = "Admin")]
public class AdminComplianceController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminComplianceController(AdminService svc) => _svc = svc;

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus() => Ok(await _svc.GetComplianceStatusAsync());

    [HttpGet("exports")]
    public async Task<IActionResult> GetExports() => Ok(await _svc.GetExportRequestsAsync());

    [HttpPost("exports/{id}/process")]
    public async Task<IActionResult> ProcessExport(Guid id)
    {
        try { await _svc.ProcessExportAsync(id); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    [HttpPost("users/{id}/anonymize")]
    public async Task<IActionResult> Anonymize(Guid id, [FromBody] AnonymizeUserRequest req)
    {
        try { await _svc.AnonymizeUserAsync(id, req.Reason); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int days = 30)
        => Ok(await _svc.GetAuditLogsAsync());

    [HttpPost("report")]
    public IActionResult GenerateReport()
        => Ok(new { message = "Rapport de conformité PIPEDA généré.", generatedAt = DateTime.UtcNow });
}
