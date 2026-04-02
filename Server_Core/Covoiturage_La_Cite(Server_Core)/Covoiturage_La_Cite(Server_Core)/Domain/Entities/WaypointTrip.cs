using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class WaypointTrip
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public int OrderIndex { get; set; }
    public string Label { get; set; } = null!;
    public string Address { get; set; } = null!;
    public Point Location { get; set; } = null!;

    // Navigation
    public Trip Trip { get; set; } = null!;
}
