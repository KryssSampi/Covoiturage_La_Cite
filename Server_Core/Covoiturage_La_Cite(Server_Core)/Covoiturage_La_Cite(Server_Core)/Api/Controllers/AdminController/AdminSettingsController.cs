using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminSettingsController(AdminService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetSettings() => Ok(await _svc.GetSettingsAsync());

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest req)
        => Ok(await _svc.UpdateSettingsAsync(req));

    [HttpPut("maintenance")]
    public async Task<IActionResult> ToggleMaintenance([FromBody] ToggleMaintenanceRequest req)
    {
        await _svc.ToggleMaintenanceModeAsync(req.Enabled);
        return Ok(new { maintenanceMode = req.Enabled });
    }
}
