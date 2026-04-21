using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/reports")]
[Authorize(Roles = "Admin")]
public class AdminReportsController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminReportsController(AdminService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetReports() => Ok(await _svc.GetReportsAsync());

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReportStatusRequest req)
    {
        try { await _svc.UpdateReportStatusAsync(id, req.Status, req.Notes); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    [HttpPut("{id}/dismiss")]
    public async Task<IActionResult> Dismiss(Guid id, [FromBody] DismissReportRequest req)
    {
        try { await _svc.DismissReportAsync(id, req.Reason); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }
}
