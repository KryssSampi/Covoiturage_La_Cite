using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminStatsController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminStatsController(AdminService svc) => _svc = svc;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats() => Ok(await _svc.GetStatsAsync());
}
