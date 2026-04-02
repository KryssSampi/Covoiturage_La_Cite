using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.VehiculeRepository;

public class VehiculeRepository : IVehiculeRepository
{
    private readonly AppDbContext _db;

    public VehiculeRepository(AppDbContext db)
    {
        _db = db;
    }

    // ── IRepository<Vehicle> ─────────────────────────────────────────────────

    public async Task<Vehicle?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<IEnumerable<Vehicle>> GetAllAsync(CancellationToken ct = default)
        => await _db.Vehicles.ToListAsync(ct);

    public async Task AddAsync(Vehicle entity, CancellationToken ct = default)
    {
        await _db.Vehicles.AddAsync(entity, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Vehicle entity, CancellationToken ct = default)
    {
        _db.Vehicles.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var v = await GetByIdAsync(id, ct);
        if (v != null) { _db.Vehicles.Remove(v); await _db.SaveChangesAsync(ct); }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Vehicles.AnyAsync(v => v.Id == id, ct);

    // ── IVehiculeRepository ──────────────────────────────────────────────────

    public async Task<IEnumerable<Vehicle>> GetByDriverProfileIdAsync(Guid driverProfileId, CancellationToken ct = default)
        => await _db.Vehicles
            .Where(v => v.DriverProfileId == driverProfileId && v.IsActive)
            .OrderByDescending(v => v.IsDefault)
            .ThenByDescending(v => v.CreatedAt)
            .ToListAsync(ct);

    public async Task<Vehicle?> GetDefaultVehicleAsync(Guid driverProfileId, CancellationToken ct = default)
        => await _db.Vehicles
            .FirstOrDefaultAsync(v => v.DriverProfileId == driverProfileId && v.IsDefault && v.IsActive, ct);

    public async Task<Vehicle?> GetByLicensePlateAsync(string licensePlate, CancellationToken ct = default)
        => await _db.Vehicles
            .FirstOrDefaultAsync(v => v.LicensePlate == licensePlate, ct);
}
