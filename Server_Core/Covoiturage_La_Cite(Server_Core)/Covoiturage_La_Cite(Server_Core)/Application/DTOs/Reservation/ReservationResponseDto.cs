using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Reservation;

/// <summary>
/// DTO reponse pour une reservation.
/// </summary>
public record ReservationResponseDto
{
    public Guid Id { get; init; }
    public Guid TripId { get; init; }
    public Guid PassengerId { get; init; }
    public Guid DriverId { get; init; }

    public string Status { get; init; } = string.Empty;
    public DateTimeOffset? ExpiresAt { get; init; }
    public DateTimeOffset? ConfirmedAt { get; init; }
    public DateTimeOffset? CancelledAt { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }

    public decimal PricePerSeat { get; init; }
    public decimal TotalAmount { get; init; }
    public string PaymentStatus { get; init; } = string.Empty;

    public string? PassengerMessage { get; init; }
    public string? RefusalReason { get; init; }
    public string? CancellationReason { get; init; }

    public bool? BoardingConfirmedByDriver { get; init; }
    public bool? BoardingConfirmedByPassenger { get; init; }
    public bool? PassengerActuallyBoarded { get; init; }

    public int CompatibilityScore { get; init; }
    public DateTimeOffset RequestedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}

/// <summary>
/// DTO pour decisions (refus / annulation).
/// </summary>
public record ReservationDecisionRequest
{
    public string? Reason { get; init; }
}
