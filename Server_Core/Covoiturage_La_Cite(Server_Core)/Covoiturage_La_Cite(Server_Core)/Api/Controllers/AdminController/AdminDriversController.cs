using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/drivers")]
[Authorize(Roles = "Admin")]
public class AdminDriversController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminDriversController(AdminService svc) => _svc = svc;

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending() => Ok(await _svc.GetPendingDriversAsync());

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        try { await _svc.ApproveDriverAsync(id); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromQuery] string reason = "")
    {
        try { await _svc.RejectDriverAsync(id, reason); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }
}
