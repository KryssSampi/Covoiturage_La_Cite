using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/finance")]
[Authorize(Roles = "Admin")]
public class AdminFinanceController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminFinanceController(AdminService svc) => _svc = svc;

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics() => Ok(await _svc.GetFinanceAnalyticsAsync());

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions() => Ok(await _svc.GetTransactionsAsync());

    [HttpGet("penalties")]
    public async Task<IActionResult> GetPenalties() => Ok(await _svc.GetPenaltiesAsync());

    [HttpPut("penalties/{id}/wave")]
    public async Task<IActionResult> WavePenalty(Guid id, [FromBody] WavePenaltyRequest req)
    {
        try { await _svc.WavePenaltyAsync(id, req.Reason); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    [HttpPost("report")]
    public IActionResult GenerateReport([FromBody] FinanceReportRequest req)
        => Ok(new { message = "Rapport généré.", startDate = req.StartDate, endDate = req.EndDate });
}
