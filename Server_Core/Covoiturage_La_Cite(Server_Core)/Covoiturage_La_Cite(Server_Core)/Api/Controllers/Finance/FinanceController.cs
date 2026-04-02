using System.Security.Claims;
using Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Finance;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.Finance;

[ApiController]
[Route("api/finances")]
[Authorize]
public class FinanceController : ControllerBase
{
    private readonly IFinanceService _service;

    public FinanceController(IFinanceService service) => _service = service;

    // ── Résumés ──────────────────────────────────────────────────────────────

    /// <summary>GET /api/finances/driver/summary</summary>
    [HttpGet("driver/summary")]
    public async Task<IActionResult> GetDriverSummary(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var summary = await _service.GetDriverSummaryAsync(userId, ct);
        return Ok(ApiResponse<DriverFinanceSummaryDto>.Ok(summary));
    }

    /// <summary>GET /api/finances/passenger/summary</summary>
    [HttpGet("passenger/summary")]
    public async Task<IActionResult> GetPassengerSummary(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var summary = await _service.GetPassengerSummaryAsync(userId, ct);
        return Ok(ApiResponse<PassengerFinanceSummaryDto>.Ok(summary));
    }

    // ── Transactions ─────────────────────────────────────────────────────────

    /// <summary>GET /api/finances/transactions?role=driver&from=...&to=...</summary>
    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] string role = "driver",
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null,
        CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var transactions = await _service.GetTransactionsAsync(userId, role, from, to, ct);
        return Ok(ApiResponse<IEnumerable<TransactionResponseDto>>.Ok(transactions));
    }

    /// <summary>GET /api/finances/transactions/{id}</summary>
    [HttpGet("transactions/{id:guid}")]
    public async Task<IActionResult> GetTransaction(Guid id, CancellationToken ct)
    {
        var tx = await _service.GetTransactionByIdAsync(id, ct);
        if (tx == null) return NotFound(ApiResponse.Fail("Transaction introuvable"));
        return Ok(ApiResponse<TransactionResponseDto>.Ok(tx));
    }

    // ── Opérations de paiement ───────────────────────────────────────────────

    /// <summary>POST /api/finances/pre-authorize</summary>
    [HttpPost("pre-authorize")]
    public async Task<IActionResult> PreAuthorize([FromBody] PreAuthorizeRequest req, CancellationToken ct)
    {
        var tx = await _service.PreAuthorizeAsync(req.ReservationId, ct);
        return CreatedAtAction(null, new { id = tx.Id }, ApiResponse<TransactionResponseDto>.Ok(tx));
    }

    /// <summary>POST /api/finances/capture</summary>
    [HttpPost("capture")]
    public async Task<IActionResult> Capture([FromBody] CaptureRequest req, CancellationToken ct)
    {
        var tx = await _service.CaptureAsync(req.TransactionId, ct);
        return Ok(ApiResponse<TransactionResponseDto>.Ok(tx, "Paiement capturé"));
    }

    /// <summary>POST /api/finances/refund</summary>
    [HttpPost("refund")]
    public async Task<IActionResult> Refund([FromBody] RefundRequest req, CancellationToken ct)
    {
        var tx = await _service.RefundAsync(req.TransactionId, req.Reason, ct);
        return Ok(ApiResponse<TransactionResponseDto>.Ok(tx, "Remboursement effectué"));
    }

    // ── Pénalités ────────────────────────────────────────────────────────────

    /// <summary>GET /api/finances/penalties</summary>
    [HttpGet("penalties")]
    public async Task<IActionResult> GetPenalties(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var penalties = await _service.GetPenaltiesAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<PenaltyResponseDto>>.Ok(penalties));
    }

    /// <summary>POST /api/finances/penalties/{id}/contest</summary>
    [HttpPost("penalties/{id:guid}/contest")]
    public async Task<IActionResult> ContestPenalty(Guid id, [FromBody] ContestPenaltyRequest req, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var penalty = await _service.ContestPenaltyAsync(id, userId, req.Reason, ct);
        return Ok(ApiResponse<PenaltyResponseDto>.Ok(penalty, "Contestation enregistrée"));
    }

    // ── Retraits ─────────────────────────────────────────────────────────────

    /// <summary>POST /api/finances/withdraw</summary>
    [HttpPost("withdraw")]
    public async Task<IActionResult> RequestWithdrawal([FromBody] WithdrawalRequest req, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var withdrawal = await _service.RequestWithdrawalAsync(userId, req.Amount, ct);
        return CreatedAtAction(null, new { id = withdrawal.Id }, ApiResponse<WithdrawalResponseDto>.Ok(withdrawal));
    }

    /// <summary>GET /api/finances/withdrawals</summary>
    [HttpGet("withdrawals")]
    public async Task<IActionResult> GetWithdrawals(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var withdrawals = await _service.GetWithdrawalsAsync(userId, ct);
        return Ok(ApiResponse<IEnumerable<WithdrawalResponseDto>>.Ok(withdrawals));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Token invalide");
        return Guid.Parse(sub);
    }
}
