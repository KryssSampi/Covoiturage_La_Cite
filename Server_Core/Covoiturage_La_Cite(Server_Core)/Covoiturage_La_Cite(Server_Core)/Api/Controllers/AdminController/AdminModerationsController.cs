using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/moderations")]
[Authorize(Roles = "Admin")]
public class AdminModerationsController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminModerationsController(AdminService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetQueue() => Ok(await _svc.GetModerationQueueAsync());

    [HttpGet("messages")]
    public async Task<IActionResult> GetMessages() => Ok(await _svc.GetReportedMessagesAsync());

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ModerationActionRequest req)
    {
        try { await _svc.ApproveModerationItemAsync(id, req.Notes); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    [HttpPut("{id}/remove")]
    public async Task<IActionResult> Remove(Guid id, [FromBody] RemoveModerationRequest req)
    {
        try { await _svc.RemoveModerationContentAsync(id, req.Reason); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }
}
