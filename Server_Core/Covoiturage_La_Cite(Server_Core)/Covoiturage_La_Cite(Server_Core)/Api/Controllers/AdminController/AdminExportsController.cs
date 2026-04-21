using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/exports")]
[Authorize(Roles = "Admin")]
public class AdminExportsController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminExportsController(AdminService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetExports() => Ok(await _svc.GetExportsAsync());

    [HttpPost]
    public async Task<IActionResult> CreateExport([FromBody] CreateExportRequest req)
    {
        var email = User.FindFirst("email")?.Value ?? "";
        try
        {
            var result = await _svc.CreateExportAsync(email, req.Type, req.Format);
            return CreatedAtAction(nameof(GetExports), result);
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(new { message = e.Message });
        }
    }
}
