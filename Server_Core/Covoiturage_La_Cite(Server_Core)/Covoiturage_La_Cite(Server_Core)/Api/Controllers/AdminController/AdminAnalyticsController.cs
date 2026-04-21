using Covoiturage_La_Cite_Server_Core_.Application.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.AdminController;

[ApiController]
[Route("api/admin/analytics")]
[Authorize(Roles = "Admin")]
public class AdminAnalyticsController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminAnalyticsController(AdminService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAnalytics() => Ok(await _svc.GetAnalyticsAsync());

    [HttpGet("user-growth")]
    public async Task<IActionResult> GetUserGrowth() => Ok(await _svc.GetUserGrowthAsync());

    [HttpGet("trip-trend")]
    public async Task<IActionResult> GetTripTrend() => Ok(await _svc.GetTripTrendAsync());

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue() => Ok(await _svc.GetRevenueAnalyticsAsync());
}
