using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class DriverProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DriverValidationStatus ValidationStatus { get; set; }
    public DateTimeOffset? ValidatedAt { get; set; }
    public Guid? ValidatedByAdminId { get; set; }
    public string? RejectionReason { get; set; }
    public decimal AverageRating { get; set; }
    public int TotalTripsAsDriver { get; set; }
    public decimal CancellationRate { get; set; }
    public int PunctualityScore { get; set; }
    public int NoShowCount { get; set; }
    public decimal Co2SavedKg { get; set; }
    public decimal BalanceAvailable { get; set; }
    public decimal BalancePending { get; set; }
    public decimal BalancePenalties { get; set; }
    public decimal WithholdingRate { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<DriverDocument> Documents { get; set; } = new List<DriverDocument>();
    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
}
