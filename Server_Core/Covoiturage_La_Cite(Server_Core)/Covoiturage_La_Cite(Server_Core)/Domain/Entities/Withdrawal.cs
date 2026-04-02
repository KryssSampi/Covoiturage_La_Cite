namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Withdrawal
{
    public Guid Id { get; set; }
    public Guid DriverProfileId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";         // Pending, Processing, Completed, Rejected
    public string? ExternalReference { get; set; }           // Référence Interac / virement
    public string? RejectionReason { get; set; }
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }

    public DriverProfile DriverProfile { get; set; } = null!;
}
