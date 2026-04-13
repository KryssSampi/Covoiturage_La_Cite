using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.TrajetRepository;

public class TrajetRepository : ITrajetRepository
{
    private readonly AppDbContext _db;
    private static readonly GeometryFactory _gf = new(new PrecisionModel(), 4326);

    public TrajetRepository(AppDbContext db)
    {
        _db = db;
    }

    // ── IRepository<Trip> ────────────────────────────────────────────────────

    public async Task<Trip?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Trips.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IEnumerable<Trip>> GetAllAsync(CancellationToken ct = default)
        => await _db.Trips.OrderByDescending(t => t.CreatedAt).ToListAsync(ct);

    public async Task AddAsync(Trip entity, CancellationToken ct = default)
    {
        await _db.Trips.AddAsync(entity, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Trip entity, CancellationToken ct = default)
    {
        _db.Trips.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var trip = await GetByIdAsync(id, ct);
        if (trip != null)
        {
            _db.Trips.Remove(trip);
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Trips.AnyAsync(t => t.Id == id, ct);

    // ── ITrajetRepository ────────────────────────────────────────────────────

    public async Task<Trip?> GetWithDetailsAsync(Guid id, CancellationToken ct = default)
        => await _db.Trips
            .Include(t => t.Driver)
            .Include(t => t.Vehicle)
            .Include(t => t.Reservations).ThenInclude(r => r.Passenger)
            .Include(t => t.Waypoints)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IEnumerable<Trip>> GetByDriverIdAsync(Guid driverId, TripStatus? status = null, CancellationToken ct = default)
    {
        var query = _db.Trips
            .Where(t => t.DriverId == driverId);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        return await query
            .OrderByDescending(t => t.DepartureDate)
            .ThenByDescending(t => t.DepartureTime)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Trip>> GetDraftsByDriverIdAsync(Guid driverId, CancellationToken ct = default)
        => await _db.Trips
            .Include(t => t.Vehicle)
            .Where(t => t.DriverId == driverId && t.Status == TripStatus.Draft)
            .OrderByDescending(t => t.UpdatedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Trip>> SearchAsync(TripSearchCriteria criteria, CancellationToken ct = default)
    {
        var query = _db.Trips
            .Include(t => t.Driver)
            .Include(t => t.Vehicle)
            .Where(t => t.Status == TripStatus.Published
                     || (t.Status == TripStatus.InProgress && t.ActualStartedAt == null));

        // Filtre par date
        if (criteria.Date.HasValue)
            query = query.Where(t => t.DepartureDate == criteria.Date.Value);

        // Filtre par horaire
        if (criteria.TimeMin.HasValue)
            query = query.Where(t => t.DepartureTime >= criteria.TimeMin.Value);
        if (criteria.TimeMax.HasValue)
            query = query.Where(t => t.DepartureTime <= criteria.TimeMax.Value);

        // Filtre par places disponibles
        query = query.Where(t => t.CurrentPassengers < t.MaxPassengers);

        // Filtre par mode de paiement
        if (criteria.PaymentMethod.HasValue)
            query = query.Where(t => t.PaymentMethod == criteria.PaymentMethod.Value);

        // Filtre géospatial — proximité départ
        if (criteria.DepartureLat.HasValue && criteria.DepartureLng.HasValue)
        {
            var departPoint = _gf.CreatePoint(new Coordinate(criteria.DepartureLng.Value, criteria.DepartureLat.Value));
            var radiusMeters = criteria.RadiusKm * 1000;
            query = query.Where(t => t.DeparturePoint.Distance(departPoint) <= radiusMeters);
        }

        // Filtre géospatial — proximité arrivée
        if (criteria.ArrivalLat.HasValue && criteria.ArrivalLng.HasValue)
        {
            var arrivalPoint = _gf.CreatePoint(new Coordinate(criteria.ArrivalLng.Value, criteria.ArrivalLat.Value));
            var radiusMeters = criteria.RadiusKm * 1000;
            query = query.Where(t => t.ArrivalPoint.Distance(arrivalPoint) <= radiusMeters);
        }

        return await query
            .OrderBy(t => t.DepartureDate)
            .ThenBy(t => t.DepartureTime)
            .Skip((criteria.Page - 1) * criteria.PageSize)
            .Take(criteria.PageSize)
            .ToListAsync(ct);
    }

    public async Task<int> SearchCountAsync(TripSearchCriteria criteria, CancellationToken ct = default)
    {
        var query = _db.Trips
            .Where(t => t.Status == TripStatus.Published
                     || (t.Status == TripStatus.InProgress && t.ActualStartedAt == null));

        if (criteria.Date.HasValue)
            query = query.Where(t => t.DepartureDate == criteria.Date.Value);
        if (criteria.TimeMin.HasValue)
            query = query.Where(t => t.DepartureTime >= criteria.TimeMin.Value);
        if (criteria.TimeMax.HasValue)
            query = query.Where(t => t.DepartureTime <= criteria.TimeMax.Value);

        query = query.Where(t => t.CurrentPassengers < t.MaxPassengers);

        if (criteria.PaymentMethod.HasValue)
            query = query.Where(t => t.PaymentMethod == criteria.PaymentMethod.Value);

        if (criteria.DepartureLat.HasValue && criteria.DepartureLng.HasValue)
        {
            var departPoint = _gf.CreatePoint(new Coordinate(criteria.DepartureLng.Value, criteria.DepartureLat.Value));
            var radiusMeters = criteria.RadiusKm * 1000;
            query = query.Where(t => t.DeparturePoint.Distance(departPoint) <= radiusMeters);
        }

        if (criteria.ArrivalLat.HasValue && criteria.ArrivalLng.HasValue)
        {
            var arrivalPoint = _gf.CreatePoint(new Coordinate(criteria.ArrivalLng.Value, criteria.ArrivalLat.Value));
            var radiusMeters = criteria.RadiusKm * 1000;
            query = query.Where(t => t.ArrivalPoint.Distance(arrivalPoint) <= radiusMeters);
        }

        return await query.CountAsync(ct);
    }

    public async Task<IEnumerable<Trip>> GetDriverHistoriqueAsync(Guid driverId, int page, int pageSize, CancellationToken ct = default)
        => await _db.Trips
            .Include(t => t.Vehicle)
            .Where(t => t.DriverId == driverId && (t.Status == TripStatus.Completed || t.Status == TripStatus.Cancelled))
            .OrderByDescending(t => t.DepartureDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

    public async Task<IEnumerable<Trip>> GetPassengerHistoriqueAsync(Guid passengerId, int page, int pageSize, CancellationToken ct = default)
        => await _db.Trips
            .Include(t => t.Driver)
            .Include(t => t.Vehicle)
            .Where(t => t.Reservations.Any(r =>
                r.PassengerId == passengerId &&
                (r.Status == ReservationStatus.Completed || r.Status == ReservationStatus.Cancelled)))
            .OrderByDescending(t => t.DepartureDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

    public async Task<Trip?> GetTripEnCoursAsync(Guid tripId, CancellationToken ct = default)
        => await _db.Trips
            .Include(t => t.Driver)
            .Include(t => t.Vehicle)
            .Include(t => t.Reservations).ThenInclude(r => r.Passenger)
            .Include(t => t.GpsPositions.OrderByDescending(g => g.CapturedAt).Take(1))
            .FirstOrDefaultAsync(t => t.Id == tripId && t.Status == TripStatus.InProgress, ct);

    public async Task<IEnumerable<Trip>> GetPublishedByArrivalLabelAsync(string arrivalLabel, int count, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _db.Trips
            .Include(t => t.Driver)
            .Where(t => t.Status == TripStatus.Published
                && t.DepartureDate >= today
                && EF.Functions.ILike(t.ArrivalLabel, $"%{arrivalLabel}%"))
            .OrderBy(t => t.DepartureDate).ThenBy(t => t.DepartureTime)
            .Take(count)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Trip>> GetRandomPublishedAsync(int count, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _db.Trips
            .Include(t => t.Driver)
            .Where(t => t.Status == TripStatus.Published && t.DepartureDate >= today)
            .OrderBy(_ => EF.Functions.Random())
            .Take(count)
            .ToListAsync(ct);
    }
}
