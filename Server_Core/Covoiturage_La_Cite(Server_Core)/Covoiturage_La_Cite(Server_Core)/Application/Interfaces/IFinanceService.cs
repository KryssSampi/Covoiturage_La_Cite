using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Finance;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IFinanceService
{
    // ── Résumés ──────────────────────────────────────────────────────────────
    Task<DriverFinanceSummaryDto> GetDriverSummaryAsync(Guid userId, CancellationToken ct = default);
    Task<PassengerFinanceSummaryDto> GetPassengerSummaryAsync(Guid userId, CancellationToken ct = default);

    // ── Transactions ─────────────────────────────────────────────────────────
    Task<IEnumerable<TransactionResponseDto>> GetTransactionsAsync(Guid userId, string role, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct = default);
    Task<TransactionResponseDto?> GetTransactionByIdAsync(Guid transactionId, CancellationToken ct = default);

    // ── Opérations de paiement ───────────────────────────────────────────────
    Task<TransactionResponseDto> PreAuthorizeAsync(Guid reservationId, CancellationToken ct = default);
    Task<TransactionResponseDto> CaptureAsync(Guid transactionId, CancellationToken ct = default);
    Task<TransactionResponseDto> RefundAsync(Guid transactionId, string reason, CancellationToken ct = default);

    // ── Pénalités ────────────────────────────────────────────────────────────
    Task<IEnumerable<PenaltyResponseDto>> GetPenaltiesAsync(Guid userId, CancellationToken ct = default);
    Task<PenaltyResponseDto> ContestPenaltyAsync(Guid penaltyId, Guid userId, string reason, CancellationToken ct = default);

    // ── Retraits ─────────────────────────────────────────────────────────────
    Task<WithdrawalResponseDto> RequestWithdrawalAsync(Guid userId, decimal amount, CancellationToken ct = default);
    Task<IEnumerable<WithdrawalResponseDto>> GetWithdrawalsAsync(Guid userId, CancellationToken ct = default);
}
