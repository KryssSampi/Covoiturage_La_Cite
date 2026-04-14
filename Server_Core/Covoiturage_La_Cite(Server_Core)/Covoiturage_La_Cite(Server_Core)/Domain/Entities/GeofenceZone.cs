using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class GeofenceZone
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string ZoneType { get; set; } = null!;       // meeting_point | parking | entrance | drop_off
    public Point CenterPoint { get; set; } = null!;
    public Polygon? Polygon { get; set; }
    public decimal RadiusMeters { get; set; }
    public string? Instructions { get; set; }
    public string? PhotoUrl { get; set; }
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;
}
