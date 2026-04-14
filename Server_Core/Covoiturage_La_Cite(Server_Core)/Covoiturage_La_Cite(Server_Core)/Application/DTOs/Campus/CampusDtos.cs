namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Campus;

// ── GeofenceZone DTOs ────────────────────────────────────────────────────────

public class GeofenceZoneResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ZoneType { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal RadiusMeters { get; set; }
    public string? Instructions { get; set; }
    public string? PhotoUrl { get; set; }
    public int Capacity { get; set; }
    public bool IsActive { get; set; }
}

public class CreateGeofenceZoneDto
{
    public string Name { get; set; } = string.Empty;
    public string ZoneType { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal RadiusMeters { get; set; }
    public string? Instructions { get; set; }
    public string? PhotoUrl { get; set; }
    public int Capacity { get; set; }
}

public class UpdateGeofenceZoneDto
{
    public string? Name { get; set; }
    public string? ZoneType { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public decimal? RadiusMeters { get; set; }
    public string? Instructions { get; set; }
    public string? PhotoUrl { get; set; }
    public int? Capacity { get; set; }
}

// ── Waypoint DTOs ────────────────────────────────────────────────────────────

public class WaypointResponseDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public int OrderIndex { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class CreateWaypointDto
{
    public int OrderIndex { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class ReorderWaypointDto
{
    public Guid WaypointId { get; set; }
    public int NewOrder { get; set; }
}
