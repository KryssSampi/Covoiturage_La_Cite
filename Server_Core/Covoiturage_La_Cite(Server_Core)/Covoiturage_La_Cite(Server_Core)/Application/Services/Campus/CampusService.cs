using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Campus;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Campus;

public class CampusService : ICampusService
{
    private readonly IGeofenceZoneRepository _zoneRepo;
    private readonly IWaypointTripRepository _waypointRepo;
    private readonly ILogger<CampusService> _logger;

    public CampusService(
        IGeofenceZoneRepository zoneRepo,
        IWaypointTripRepository waypointRepo,
        ILogger<CampusService> logger)
    {
        _zoneRepo = zoneRepo;
        _waypointRepo = waypointRepo;
        _logger = logger;
    }

    // ── Zones ────────────────────────────────────────────────────────────────

    public async Task<IEnumerable<GeofenceZoneResponseDto>> GetAllZonesAsync(CancellationToken ct = default)
    {
        var zones = await _zoneRepo.GetActiveAsync(ct);
        return zones.Select(MapZone);
    }

    public async Task<GeofenceZoneResponseDto?> GetZoneByIdAsync(Guid id, CancellationToken ct = default)
    {
        var zone = await _zoneRepo.GetByIdAsync(id, ct);
        return zone == null ? null : MapZone(zone);
    }

    public async Task<IEnumerable<GeofenceZoneResponseDto>> GetZonesByTypeAsync(string zoneType, CancellationToken ct = default)
    {
        var zones = await _zoneRepo.GetByTypeAsync(zoneType, ct);
        return zones.Select(MapZone);
    }

    public async Task<IEnumerable<GeofenceZoneResponseDto>> GetNearbyZonesAsync(double lat, double lng, double radiusM, CancellationToken ct = default)
    {
        var zones = await _zoneRepo.GetNearbyAsync(lat, lng, radiusM, ct);
        return zones.Select(MapZone);
    }

    public async Task<GeofenceZoneResponseDto> CreateZoneAsync(CreateGeofenceZoneDto dto, CancellationToken ct = default)
    {
        var zone = new GeofenceZone
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            ZoneType = dto.ZoneType,
            CenterPoint = new Point(dto.Longitude, dto.Latitude) { SRID = 4326 },
            RadiusMeters = dto.RadiusMeters,
            Instructions = dto.Instructions,
            PhotoUrl = dto.PhotoUrl,
            Capacity = dto.Capacity,
            IsActive = true
        };

        await _zoneRepo.AddAsync(zone, ct);
        _logger.LogInformation("Zone campus créée: {Name} ({Type})", dto.Name, dto.ZoneType);
        return MapZone(zone);
    }

    public async Task<GeofenceZoneResponseDto> UpdateZoneAsync(Guid id, UpdateGeofenceZoneDto dto, CancellationToken ct = default)
    {
        var zone = await _zoneRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Zone introuvable");

        if (dto.Name != null) zone.Name = dto.Name;
        if (dto.ZoneType != null) zone.ZoneType = dto.ZoneType;
        if (dto.Latitude.HasValue && dto.Longitude.HasValue)
            zone.CenterPoint = new Point(dto.Longitude.Value, dto.Latitude.Value) { SRID = 4326 };
        if (dto.RadiusMeters.HasValue) zone.RadiusMeters = dto.RadiusMeters.Value;
        if (dto.Instructions != null) zone.Instructions = dto.Instructions;
        if (dto.PhotoUrl != null) zone.PhotoUrl = dto.PhotoUrl;
        if (dto.Capacity.HasValue) zone.Capacity = dto.Capacity.Value;

        await _zoneRepo.UpdateAsync(zone, ct);
        return MapZone(zone);
    }

    public async Task DeactivateZoneAsync(Guid id, CancellationToken ct = default)
    {
        var zone = await _zoneRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Zone introuvable");
        zone.IsActive = false;
        await _zoneRepo.UpdateAsync(zone, ct);
    }

    // ── Waypoints ────────────────────────────────────────────────────────────

    public async Task<IEnumerable<WaypointResponseDto>> GetTripWaypointsAsync(Guid tripId, CancellationToken ct = default)
    {
        var waypoints = await _waypointRepo.GetByTripIdAsync(tripId, ct);
        return waypoints.Select(MapWaypoint);
    }

    public async Task<WaypointResponseDto> AddWaypointAsync(Guid tripId, CreateWaypointDto dto, CancellationToken ct = default)
    {
        var waypoint = new WaypointTrip
        {
            Id = Guid.NewGuid(),
            TripId = tripId,
            OrderIndex = dto.OrderIndex,
            Label = dto.Label,
            Address = dto.Address,
            Location = new Point(dto.Longitude, dto.Latitude) { SRID = 4326 }
        };

        await _waypointRepo.AddAsync(waypoint, ct);
        return MapWaypoint(waypoint);
    }

    public async Task ReorderWaypointsAsync(Guid tripId, IEnumerable<ReorderWaypointDto> order, CancellationToken ct = default)
    {
        await _waypointRepo.ReorderAsync(tripId, order.Select(o => (o.WaypointId, o.NewOrder)), ct);
    }

    public async Task DeleteWaypointAsync(Guid waypointId, CancellationToken ct = default)
    {
        await _waypointRepo.DeleteAsync(waypointId, ct);
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private static GeofenceZoneResponseDto MapZone(GeofenceZone z) => new()
    {
        Id = z.Id, Name = z.Name, ZoneType = z.ZoneType,
        Latitude = z.CenterPoint.Y, Longitude = z.CenterPoint.X,
        RadiusMeters = z.RadiusMeters, Instructions = z.Instructions,
        PhotoUrl = z.PhotoUrl, Capacity = z.Capacity, IsActive = z.IsActive
    };

    private static WaypointResponseDto MapWaypoint(WaypointTrip w) => new()
    {
        Id = w.Id, TripId = w.TripId, OrderIndex = w.OrderIndex,
        Label = w.Label, Address = w.Address,
        Latitude = w.Location.Y, Longitude = w.Location.X
    };
}
