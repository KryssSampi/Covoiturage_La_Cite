using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Campus;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface ICampusService
{
    // GeofenceZones
    Task<IEnumerable<GeofenceZoneResponseDto>> GetAllZonesAsync(CancellationToken ct = default);
    Task<GeofenceZoneResponseDto?> GetZoneByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<GeofenceZoneResponseDto>> GetZonesByTypeAsync(string zoneType, CancellationToken ct = default);
    Task<IEnumerable<GeofenceZoneResponseDto>> GetNearbyZonesAsync(double lat, double lng, double radiusM, CancellationToken ct = default);
    Task<GeofenceZoneResponseDto> CreateZoneAsync(CreateGeofenceZoneDto dto, CancellationToken ct = default);
    Task<GeofenceZoneResponseDto> UpdateZoneAsync(Guid id, UpdateGeofenceZoneDto dto, CancellationToken ct = default);
    Task DeactivateZoneAsync(Guid id, CancellationToken ct = default);

    // Waypoints
    Task<IEnumerable<WaypointResponseDto>> GetTripWaypointsAsync(Guid tripId, CancellationToken ct = default);
    Task<WaypointResponseDto> AddWaypointAsync(Guid tripId, CreateWaypointDto dto, CancellationToken ct = default);
    Task ReorderWaypointsAsync(Guid tripId, IEnumerable<ReorderWaypointDto> order, CancellationToken ct = default);
    Task DeleteWaypointAsync(Guid waypointId, CancellationToken ct = default);
}
