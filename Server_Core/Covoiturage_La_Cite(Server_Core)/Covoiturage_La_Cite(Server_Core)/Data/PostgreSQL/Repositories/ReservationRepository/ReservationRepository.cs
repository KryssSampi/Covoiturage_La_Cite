using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.ReservationRepository;

public class ReservationRepository : IReservationRepository
{
    private readonly AppDbContext _db;

    public ReservationRepository(AppDbContext db)
    {
        _db = db;
    }

    // -- IRepository<Reservation> ---------------------------------------------

    public async Task<Reservation?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Reservations.FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IEnumerable<Reservation>> GetAllAsync(CancellationToken ct = default)
        => await _db.Reservations
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync(ct);

    public async Task AddAsync(Reservation entity, CancellationToken ct = default)
    {
        await _db.Reservations.AddAsync(entity, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Reservation entity, CancellationToken ct = default)
    {
        _db.Reservations.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var reservation = await GetByIdAsync(id, ct);
        if (reservation != null)
        {
            _db.Reservations.Remove(reservation);
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Reservations.AnyAsync(r => r.Id == id, ct);

    // -- IReservationRepository ----------------------------------------------

    public async Task<Reservation?> GetWithDetailsAsync(Guid id, CancellationToken ct = default)
        => await _db.Reservations
            .Include(r => r.Trip)
            .Include(r => r.Passenger).ThenInclude(p => p.Stats)
            .Include(r => r.Driver).ThenInclude(d => d.DriverProfile)
            .FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IEnumerable<Reservation>> GetByPassengerIdAsync(Guid passengerId, CancellationToken ct = default)
        => await _db.Reservations
            .Where(r => r.PassengerId == passengerId)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Reservation>> GetByDriverIdAsync(Guid driverId, CancellationToken ct = default)
        => await _db.Reservations
            .Where(r => r.DriverId == driverId)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Reservation>> GetPendingByDriverIdAsync(Guid driverId, CancellationToken ct = default)
        => await _db.Reservations
            .Include(r => r.Trip)
            .Include(r => r.Passenger).ThenInclude(p => p.Stats)
            .Include(r => r.Driver).ThenInclude(d => d.DriverProfile)
            .Where(r => r.DriverId == driverId && r.Status == ReservationStatus.Pending)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Reservation>> GetActiveByPassengerIdAsync(Guid passengerId, CancellationToken ct = default)
        => await _db.Reservations
            .Where(r => r.PassengerId == passengerId &&
                        (r.Status == ReservationStatus.Pending ||
                         r.Status == ReservationStatus.Confirmed ||
                         r.Status == ReservationStatus.InProgress))
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync(ct);

    public async Task<int> CountActiveByPassengerIdAsync(Guid passengerId, CancellationToken ct = default)
        => await _db.Reservations
            .CountAsync(r => r.PassengerId == passengerId &&
                             (r.Status == ReservationStatus.Pending ||
                              r.Status == ReservationStatus.Confirmed ||
                              r.Status == ReservationStatus.InProgress), ct);

    public async Task<int> CountConfirmedByTripAsync(Guid tripId, CancellationToken ct = default)
        => await _db.Reservations
            .CountAsync(r => r.TripId == tripId &&
                             (r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.InProgress), ct);

    public async Task<IEnumerable<Reservation>> GetPassengerEnrichedAsync(Guid passengerId, CancellationToken ct = default)
        => await _db.Reservations
            .Include(r => r.Trip)
            .Include(r => r.Driver).ThenInclude(d => d.DriverProfile)
            .Include(r => r.Passenger).ThenInclude(p => p.Stats)
            .Where(r => r.PassengerId == passengerId)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Reservation>> GetDriverEnrichedAsync(Guid driverId, CancellationToken ct = default)
        => await _db.Reservations
            .Include(r => r.Trip)
            .Include(r => r.Passenger).ThenInclude(p => p.Stats)
            .Include(r => r.Driver).ThenInclude(d => d.DriverProfile)
            .Where(r => r.DriverId == driverId)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync(ct);
}
