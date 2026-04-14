using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Interfaces;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IGeofenceZoneRepository : IRepository<GeofenceZone>
{
    Task<IEnumerable<GeofenceZone>> GetActiveAsync(CancellationToken ct = default);
    Task<IEnumerable<GeofenceZone>> GetByTypeAsync(string zoneType, CancellationToken ct = default);
    Task<GeofenceZone?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<IEnumerable<GeofenceZone>> GetNearbyAsync(double latitude, double longitude, double radiusMeters, CancellationToken ct = default);
}

public interface IWaypointTripRepository : IRepository<WaypointTrip>
{
    Task<IEnumerable<WaypointTrip>> GetByTripIdAsync(Guid tripId, CancellationToken ct = default);
    Task ReorderAsync(Guid tripId, IEnumerable<(Guid waypointId, int newOrder)> order, CancellationToken ct = default);
    Task DeleteByTripIdAsync(Guid tripId, CancellationToken ct = default);
}
