namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class AuditLog
{
    public long Id { get; set; }                        // sequential, append-only
    public Guid? ActorId { get; set; }                  // null = system/job
    public string ActorRole { get; set; } = null!;      // user | admin | system | job
    public string Action { get; set; } = null!;         // ex: "user.suspend", "trip.cancel"
    public string EntityType { get; set; } = null!;
    public Guid? EntityId { get; set; }
    public string? PreviousValueJson { get; set; }
    public string? NewValueJson { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset CreatedAt { get; set; }       // rétention 7 ans PIPEDA
}
