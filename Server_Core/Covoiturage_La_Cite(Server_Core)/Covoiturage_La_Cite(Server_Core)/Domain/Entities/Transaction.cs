using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid ReservationId { get; set; }
    public Guid PassengerId { get; set; }
    public Guid DriverId { get; set; }
    public decimal Amount { get; set; }                 // montant total passager
    public decimal DriverShare { get; set; }            // 85%
    public decimal PlatformShare { get; set; }          // 15%
    public decimal PlatformFee { get; set; }            // frais plateforme
    public decimal PenaltyDeducted { get; set; }        // pénalités déduites
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public string? ExternalReference { get; set; }      // référence Interac / simulation
    public DateTimeOffset? PreAuthorizedAt { get; set; }
    public DateTimeOffset? CapturedAt { get; set; }
    public DateTimeOffset? RefundedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation
    public Reservation Reservation { get; set; } = null!;
    public User Passenger { get; set; } = null!;
    public User Driver { get; set; } = null!;
}
