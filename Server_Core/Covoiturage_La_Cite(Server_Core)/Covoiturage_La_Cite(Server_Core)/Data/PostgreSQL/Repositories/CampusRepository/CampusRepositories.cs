using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.CampusRepository;

// ── GeofenceZoneRepository ───────────────────────────────────────────────────

public class GeofenceZoneRepository : IGeofenceZoneRepository
{
    private readonly AppDbContext _db;
    public GeofenceZoneRepository(AppDbContext db) => _db = db;

    public async Task<GeofenceZone?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.GeofenceZones.FirstOrDefaultAsync(z => z.Id == id, ct);
    public async Task<IEnumerable<GeofenceZone>> GetAllAsync(CancellationToken ct = default)
        => await _db.GeofenceZones.ToListAsync(ct);
    public async Task AddAsync(GeofenceZone entity, CancellationToken ct = default)
    { await _db.GeofenceZones.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(GeofenceZone entity, CancellationToken ct = default)
    { _db.GeofenceZones.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var z = await GetByIdAsync(id, ct); if (z != null) { _db.GeofenceZones.Remove(z); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.GeofenceZones.AnyAsync(z => z.Id == id, ct);

    public async Task<IEnumerable<GeofenceZone>> GetActiveAsync(CancellationToken ct = default)
        => await _db.GeofenceZones.Where(z => z.IsActive).ToListAsync(ct);
    public async Task<IEnumerable<GeofenceZone>> GetByTypeAsync(string zoneType, CancellationToken ct = default)
        => await _db.GeofenceZones.Where(z => z.ZoneType == zoneType && z.IsActive).ToListAsync(ct);
    public async Task<GeofenceZone?> GetByNameAsync(string name, CancellationToken ct = default)
        => await _db.GeofenceZones.FirstOrDefaultAsync(z => z.Name == name, ct);
    public async Task<IEnumerable<GeofenceZone>> GetNearbyAsync(double latitude, double longitude, double radiusMeters, CancellationToken ct = default)
    {
        var point = new Point(longitude, latitude) { SRID = 4326 };
        return await _db.GeofenceZones
            .Where(z => z.IsActive && z.CenterPoint.Distance(point) <= radiusMeters)
            .OrderBy(z => z.CenterPoint.Distance(point))
            .ToListAsync(ct);
    }
}

// ── WaypointTripRepository ───────────────────────────────────────────────────

public class WaypointTripRepository : IWaypointTripRepository
{
    private readonly AppDbContext _db;
    public WaypointTripRepository(AppDbContext db) => _db = db;

    public async Task<WaypointTrip?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.WaypointTrips.FirstOrDefaultAsync(w => w.Id == id, ct);
    public async Task<IEnumerable<WaypointTrip>> GetAllAsync(CancellationToken ct = default)
        => await _db.WaypointTrips.ToListAsync(ct);
    public async Task AddAsync(WaypointTrip entity, CancellationToken ct = default)
    { await _db.WaypointTrips.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(WaypointTrip entity, CancellationToken ct = default)
    { _db.WaypointTrips.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var w = await GetByIdAsync(id, ct); if (w != null) { _db.WaypointTrips.Remove(w); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.WaypointTrips.AnyAsync(w => w.Id == id, ct);

    public async Task<IEnumerable<WaypointTrip>> GetByTripIdAsync(Guid tripId, CancellationToken ct = default)
        => await _db.WaypointTrips.Where(w => w.TripId == tripId).OrderBy(w => w.OrderIndex).ToListAsync(ct);

    public async Task ReorderAsync(Guid tripId, IEnumerable<(Guid waypointId, int newOrder)> order, CancellationToken ct = default)
    {
        var waypoints = await _db.WaypointTrips.Where(w => w.TripId == tripId).ToListAsync(ct);
        var orderDict = order.ToDictionary(o => o.waypointId, o => o.newOrder);
        foreach (var wp in waypoints)
        {
            if (orderDict.TryGetValue(wp.Id, out var newOrder))
                wp.OrderIndex = newOrder;
        }
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteByTripIdAsync(Guid tripId, CancellationToken ct = default)
    {
        await _db.WaypointTrips.Where(w => w.TripId == tripId).ExecuteDeleteAsync(ct);
    }
}
