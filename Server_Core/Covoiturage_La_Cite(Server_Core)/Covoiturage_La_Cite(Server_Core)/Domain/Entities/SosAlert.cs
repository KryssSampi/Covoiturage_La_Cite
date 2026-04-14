using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class SosAlert
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TripId { get; set; }
    public string EmergencyType { get; set; } = string.Empty;
    public Point TriggerLocation { get; set; } = null!;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? AdminContactedAt { get; set; }
    public bool EmergencyContactsNotified { get; set; }
    public string? GpsSnapshotJson { get; set; }
    public DateTimeOffset TriggeredAt { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }

    public User User { get; set; } = null!;
    public Trip Trip { get; set; } = null!;
}
