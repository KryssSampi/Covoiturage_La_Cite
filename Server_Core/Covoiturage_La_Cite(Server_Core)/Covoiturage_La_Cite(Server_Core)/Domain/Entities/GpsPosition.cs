using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class GpsPosition
{
    public long Id { get; set; }
    public Guid TripId { get; set; }
    public Guid UserId { get; set; }
    public Point Location { get; set; } = null!;
    public decimal SpeedKmh { get; set; }
    public decimal HeadingDegrees { get; set; }
    public decimal AccuracyMeters { get; set; }
    public DateTimeOffset CapturedAt { get; set; }

    public Trip Trip { get; set; } = null!;
    public User User { get; set; } = null!;
}
