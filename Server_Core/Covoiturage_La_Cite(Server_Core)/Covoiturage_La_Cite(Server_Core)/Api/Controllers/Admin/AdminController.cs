using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _service;
    public AdminController(IAdminService service) => _service = service;

    // ── Dashboard ────────────────────────────────────────────────────────────

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
        => Ok(ApiResponse<PlatformStatsDto>.Ok(await _service.GetDashboardStatsAsync(ct)));

    // ── User Management ──────────────────────────────────────────────────────

    [HttpPost("users/{userId:guid}/suspend")]
    public async Task<IActionResult> SuspendUser(Guid userId, [FromBody] ReasonDto dto, CancellationToken ct)
    { await _service.SuspendUserAsync(GetUid(), userId, dto.Reason, ct); return Ok(ApiResponse<string>.Ok("Utilisateur suspendu")); }

    [HttpPost("users/{userId:guid}/unsuspend")]
    public async Task<IActionResult> UnsuspendUser(Guid userId, CancellationToken ct)
    { await _service.UnsuspendUserAsync(GetUid(), userId, ct); return Ok(ApiResponse<string>.Ok("Suspension levée")); }

    [HttpPost("users/{userId:guid}/ban")]
    public async Task<IActionResult> BanUser(Guid userId, [FromBody] ReasonDto dto, CancellationToken ct)
    { await _service.BanUserAsync(GetUid(), userId, dto.Reason, ct); return Ok(ApiResponse<string>.Ok("Utilisateur banni")); }

    // ── Reports ──────────────────────────────────────────────────────────────

    [HttpPost("reports/{reportId:guid}/assign")]
    public async Task<IActionResult> AssignReport(Guid reportId, CancellationToken ct)
        => Ok(ApiResponse<ReportAdminDto>.Ok(await _service.AssignReportAsync(GetUid(), reportId, ct)));

    [HttpPost("reports/{reportId:guid}/resolve")]
    public async Task<IActionResult> ResolveReport(Guid reportId, [FromBody] ResolveReportDto dto, CancellationToken ct)
        => Ok(ApiResponse<ReportAdminDto>.Ok(await _service.ResolveReportAsync(GetUid(), reportId, dto.Note, dto.Resolution, ct)));

    // ── Config ───────────────────────────────────────────────────────────────

    [HttpGet("config")]
    public async Task<IActionResult> GetAllConfig(CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<PlatformConfigDto>>.Ok(await _service.GetAllConfigAsync(ct)));

    [HttpPut("config")]
    public async Task<IActionResult> SetConfig([FromBody] SetConfigDto dto, CancellationToken ct)
        => Ok(ApiResponse<PlatformConfigDto>.Ok(await _service.SetConfigAsync(GetUid(), dto, ct)));

    // ── Audit Logs ───────────────────────────────────────────────────────────

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int count = 50, CancellationToken ct = default)
        => Ok(ApiResponse<IEnumerable<AuditLogDto>>.Ok(await _service.GetRecentAuditLogsAsync(count, ct)));

    [HttpGet("audit-logs/{entityType}/{entityId:guid}")]
    public async Task<IActionResult> GetAuditLogsByEntity(string entityType, Guid entityId, CancellationToken ct)
        => Ok(ApiResponse<IEnumerable<AuditLogDto>>.Ok(await _service.GetAuditLogsByEntityAsync(entityType, entityId, ct)));

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}

// ── Body DTOs locaux ─────────────────────────────────────────────────────────

public class ReasonDto
{
    public string Reason { get; set; } = string.Empty;
}

public class ResolveReportDto
{
    public string Note { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
}
