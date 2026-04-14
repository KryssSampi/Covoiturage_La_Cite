using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Security;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Security;

[ApiController]
[Route("api/security")]
[Authorize]
public class SecurityController : ControllerBase
{
    private readonly ISecurityService _service;
    public SecurityController(ISecurityService service) => _service = service;

    /// <summary>POST /api/security/enroll — Enrôlement d'un nouvel appareil.</summary>
    [HttpPost("enroll")]
    public async Task<IActionResult> Enroll([FromBody] EnrollDeviceDto dto, CancellationToken ct)
        => Ok(ApiResponse<EnrollResultDto>.Ok(await _service.EnrollDeviceAsync(GetUid(), dto, ct)));

    /// <summary>POST /api/security/validate — Validation d'une signature ECC (Thread B).</summary>
    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ValidateSignatureDto dto, CancellationToken ct)
        => Ok(ApiResponse<SignatureValidationResultDto>.Ok(await _service.ValidateSignatureAsync(GetUid(), dto, ct)));

    /// <summary>POST /api/security/heartbeat — Heartbeat mobile.</summary>
    [HttpPost("heartbeat")]
    public async Task<IActionResult> Heartbeat([FromBody] HeartbeatDto dto, CancellationToken ct)
        => Ok(ApiResponse<HeartbeatResponseDto>.Ok(await _service.ProcessHeartbeatAsync(GetUid(), dto, ct)));

    /// <summary>POST /api/security/rotate — Rotation de la clé client (ACK).</summary>
    [HttpPost("rotate")]
    public async Task<IActionResult> RotateKey([FromBody] RotateClientKeyDto dto, CancellationToken ct)
        => Ok(ApiResponse<RotationAckDto>.Ok(await _service.RotateClientKeyAsync(GetUid(), dto, ct)));

    /// <summary>POST /api/security/rotation/global — Rotation globale (admin seulement).</summary>
    [HttpPost("rotation/global")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GlobalRotation([FromBody] GlobalRotationRequestDto dto, CancellationToken ct)
        => Ok(ApiResponse<GlobalRotationResultDto>.Ok(await _service.TriggerGlobalRotationAsync(dto.TriggeredBy, dto.Note, ct)));

    /// <summary>GET /api/security/log — Journal d'activité sécuritaire de l'utilisateur.</summary>
    [HttpGet("log")]
    public async Task<IActionResult> GetLog([FromQuery] int count = 50, CancellationToken ct = default)
        => Ok(ApiResponse<List<SecurityActivityDto>>.Ok(await _service.GetSecurityLogAsync(GetUid(), count, ct)));

    /// <summary>POST /api/security/web-session — Émet une clé de session web.</summary>
    [HttpPost("web-session")]
    public async Task<IActionResult> IssueWebSession([FromBody] IssueWebSessionDto dto, CancellationToken ct)
        => Ok(ApiResponse<WebSessionKeyDto>.Ok(await _service.IssueWebSessionKeyAsync(GetUid(), dto.ServerSignature, ct)));

    /// <summary>POST /api/security/web-session/validate — Valide une clé de session web.</summary>
    [HttpPost("web-session/validate")]
    public async Task<IActionResult> ValidateWebSession([FromBody] ValidateWebSessionDto dto, CancellationToken ct)
    {
        var valid = await _service.ValidateWebSessionKeyAsync(dto.KeyHash, ct);
        return Ok(ApiResponse<bool>.Ok(valid));
    }

    /// <summary>DELETE /api/security/web-session — Révoque la session web.</summary>
    [HttpDelete("web-session")]
    public async Task<IActionResult> RevokeWebSession(CancellationToken ct)
    {
        await _service.RevokeWebSessionAsync(GetUid(), ct);
        return NoContent();
    }

    private Guid GetUid() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}

// DTOs locaux au controller
public class GlobalRotationRequestDto
{
    public string TriggeredBy { get; set; } = "admin_forced";
    public string? Note { get; set; }
}

public class IssueWebSessionDto
{
    public string ServerSignature { get; set; } = null!;
}

public class ValidateWebSessionDto
{
    public string KeyHash { get; set; } = null!;
}
