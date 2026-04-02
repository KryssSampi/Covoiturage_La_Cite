using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Reservation
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid PassengerId { get; set; }
    public Guid DriverId { get; set; }
    public ReservationStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public decimal PricePerSeat { get; set; }
    public decimal TotalAmount { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? PassengerMessage { get; set; }
    public string? RefusalReason { get; set; }
    public string? CancellationReason { get; set; }
    public bool? BoardingConfirmedByDriver { get; set; }
    public bool? BoardingConfirmedByPassenger { get; set; }
    public bool? PassengerActuallyBoarded { get; set; }
    public int CompatibilityScore { get; set; }
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Trip Trip { get; set; } = null!;
    public User Passenger { get; set; } = null!;
    public User Driver { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public Review? Review { get; set; }
}
