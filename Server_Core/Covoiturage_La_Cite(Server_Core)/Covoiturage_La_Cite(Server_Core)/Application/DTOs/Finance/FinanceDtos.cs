using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Finance;

// ── Transaction ──────────────────────────────────────────────────────────────

public record TransactionResponseDto
{
    public Guid Id { get; init; }
    public Guid ReservationId { get; init; }
    public Guid PassengerId { get; init; }
    public Guid DriverId { get; init; }
    public decimal Amount { get; init; }
    public decimal DriverShare { get; init; }
    public decimal PlatformShare { get; init; }
    public decimal PenaltyDeducted { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? ExternalReference { get; init; }
    public DateTimeOffset? PreAuthorizedAt { get; init; }
    public DateTimeOffset? CapturedAt { get; init; }
    public DateTimeOffset? RefundedAt { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

// ── Résumé conducteur ────────────────────────────────────────────────────────

public record DriverFinanceSummaryDto
{
    public decimal SoldeDisponible { get; init; }
    public decimal SoldeEnTransit { get; init; }
    public decimal SoldePenalites { get; init; }
    public decimal TauxPrelevement { get; init; }
    public decimal GainSemaine { get; init; }
    public decimal GainMois { get; init; }
    public decimal CommissionTotale { get; init; }
    public int NbTrajetsPayants { get; init; }
    public int NbPenalitesActives { get; init; }
    public string Currency { get; init; } = "CAD";
}

// ── Résumé passager ──────────────────────────────────────────────────────────

public record PassengerFinanceSummaryDto
{
    public decimal EconomiesEstimees { get; init; }
    public decimal FondsEnTransit { get; init; }
    public decimal TotalDepense { get; init; }
    public int NbTrajetsCompletes { get; init; }
    public string Currency { get; init; } = "CAD";
}

// ── Pénalité ─────────────────────────────────────────────────────────────────

public record PenaltyResponseDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public Guid? TripId { get; init; }
    public Guid? ReservationId { get; init; }
    public string Type { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset ContestDeadline { get; init; }
    public string? ContestReason { get; init; }
    public string? AdminDecision { get; init; }
    public int GoScoreImpact { get; init; }
    public string TriggerReason { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
}

// ── Retrait ──────────────────────────────────────────────────────────────────

public record WithdrawalResponseDto
{
    public Guid Id { get; init; }
    public Guid DriverProfileId { get; init; }
    public decimal Amount { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? ExternalReference { get; init; }
    public string? RejectionReason { get; init; }
    public DateTimeOffset RequestedAt { get; init; }
    public DateTimeOffset? ProcessedAt { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
}

// ── Requêtes ─────────────────────────────────────────────────────────────────

public record PreAuthorizeRequest
{
    public Guid ReservationId { get; init; }
}

public record CaptureRequest
{
    public Guid TransactionId { get; init; }
}

public record RefundRequest
{
    public Guid TransactionId { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record ContestPenaltyRequest
{
    public string Reason { get; init; } = string.Empty;
}

public record WithdrawalRequest
{
    public decimal Amount { get; init; }
}
