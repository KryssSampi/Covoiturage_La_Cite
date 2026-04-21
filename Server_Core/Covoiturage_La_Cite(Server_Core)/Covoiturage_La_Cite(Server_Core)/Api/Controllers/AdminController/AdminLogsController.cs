using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/logs")]
[Authorize(Roles = "Admin")]
public class AdminLogsController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminLogsController(AdminService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetLogs() => Ok(await _svc.GetAuditLogsAsync());
}
