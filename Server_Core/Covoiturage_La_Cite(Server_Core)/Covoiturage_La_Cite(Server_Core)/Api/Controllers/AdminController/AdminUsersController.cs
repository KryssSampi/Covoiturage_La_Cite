using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminUsersController(AdminService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetUsers() => Ok(await _svc.GetUsersAsync());

    [HttpPut("{id}/suspend")]
    public async Task<IActionResult> SuspendUser(Guid id, [FromBody] SuspendUserRequest req)
    {
        try { await _svc.SuspendUserAsync(id, req.Reason); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    [HttpPut("{id}/reactivate")]
    public async Task<IActionResult> ReactivateUser(Guid id)
    {
        try { await _svc.ReactivateUserAsync(id); return NoContent(); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }
}
