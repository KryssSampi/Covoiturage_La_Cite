using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.FinanceRepository;

// ── TransactionRepository ────────────────────────────────────────────────────

public class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _db;

    public TransactionRepository(AppDbContext db) => _db = db;

    public async Task<Transaction?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Transactions.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IEnumerable<Transaction>> GetAllAsync(CancellationToken ct = default)
        => await _db.Transactions.OrderByDescending(t => t.CreatedAt).ToListAsync(ct);

    public async Task AddAsync(Transaction entity, CancellationToken ct = default)
    {
        await _db.Transactions.AddAsync(entity, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Transaction entity, CancellationToken ct = default)
    {
        _db.Transactions.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var t = await GetByIdAsync(id, ct);
        if (t != null) { _db.Transactions.Remove(t); await _db.SaveChangesAsync(ct); }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Transactions.AnyAsync(t => t.Id == id, ct);

    public async Task<IEnumerable<Transaction>> GetByReservationIdAsync(Guid reservationId, CancellationToken ct = default)
        => await _db.Transactions
            .Where(t => t.ReservationId == reservationId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Transaction>> GetByDriverIdAsync(Guid driverId, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct = default)
    {
        var q = _db.Transactions.Where(t => t.DriverId == driverId);
        if (from.HasValue) { var f = from.Value.ToUniversalTime(); q = q.Where(t => t.CreatedAt >= f); }
        if (to.HasValue) { var t2 = to.Value.ToUniversalTime(); q = q.Where(t => t.CreatedAt <= t2); }
        return await q.OrderByDescending(t => t.CreatedAt).ToListAsync(ct);
    }

    public async Task<IEnumerable<Transaction>> GetByPassengerIdAsync(Guid passengerId, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct = default)
    {
        var q = _db.Transactions.Where(t => t.PassengerId == passengerId);
        if (from.HasValue) { var f = from.Value.ToUniversalTime(); q = q.Where(t => t.CreatedAt >= f); }
        if (to.HasValue) { var t2 = to.Value.ToUniversalTime(); q = q.Where(t => t.CreatedAt <= t2); }
        return await q.OrderByDescending(t => t.CreatedAt).ToListAsync(ct);
    }

    public async Task<decimal> GetDriverTotalEarningsAsync(Guid driverId, DateTimeOffset? from = null, CancellationToken ct = default)
    {
        var q = _db.Transactions.Where(t => t.DriverId == driverId && t.Status == PaymentStatus.Captured);
        if (from.HasValue) { var f = from.Value.ToUniversalTime(); q = q.Where(t => t.CapturedAt >= f); }
        return await q.SumAsync(t => t.DriverShare, ct);
    }

    public async Task<decimal> GetPassengerTotalSpentAsync(Guid passengerId, DateTimeOffset? from = null, CancellationToken ct = default)
    {
        var q = _db.Transactions.Where(t => t.PassengerId == passengerId && t.Status == PaymentStatus.Captured);
        if (from.HasValue) { var f = from.Value.ToUniversalTime(); q = q.Where(t => t.CapturedAt >= f); }
        return await q.SumAsync(t => t.Amount, ct);
    }
}

// ── PenaltyRepository ────────────────────────────────────────────────────────

public class PenaltyRepository : IPenaltyRepository
{
    private readonly AppDbContext _db;

    public PenaltyRepository(AppDbContext db) => _db = db;

    public async Task<Penalty?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Penalties.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IEnumerable<Penalty>> GetAllAsync(CancellationToken ct = default)
        => await _db.Penalties.OrderByDescending(p => p.CreatedAt).ToListAsync(ct);

    public async Task AddAsync(Penalty entity, CancellationToken ct = default)
    {
        await _db.Penalties.AddAsync(entity, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Penalty entity, CancellationToken ct = default)
    {
        _db.Penalties.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var p = await GetByIdAsync(id, ct);
        if (p != null) { _db.Penalties.Remove(p); await _db.SaveChangesAsync(ct); }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Penalties.AnyAsync(p => p.Id == id, ct);

    public async Task<IEnumerable<Penalty>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _db.Penalties
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Penalty>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _db.Penalties
            .Where(p => p.UserId == userId && p.Status == PenaltyStatus.Active)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public async Task<decimal> GetTotalUndeductedAsync(Guid userId, CancellationToken ct = default)
        => await _db.Penalties
            .Where(p => p.UserId == userId && p.Status == PenaltyStatus.Active && p.DeductedAt == null)
            .SumAsync(p => p.Amount, ct);
}

// ── WithdrawalRepository ─────────────────────────────────────────────────────

public class WithdrawalRepository : IWithdrawalRepository
{
    private readonly AppDbContext _db;

    public WithdrawalRepository(AppDbContext db) => _db = db;

    public async Task<Withdrawal?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Withdrawals.FirstOrDefaultAsync(w => w.Id == id, ct);

    public async Task<IEnumerable<Withdrawal>> GetAllAsync(CancellationToken ct = default)
        => await _db.Withdrawals.OrderByDescending(w => w.RequestedAt).ToListAsync(ct);

    public async Task AddAsync(Withdrawal entity, CancellationToken ct = default)
    {
        await _db.Withdrawals.AddAsync(entity, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Withdrawal entity, CancellationToken ct = default)
    {
        _db.Withdrawals.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var w = await GetByIdAsync(id, ct);
        if (w != null) { _db.Withdrawals.Remove(w); await _db.SaveChangesAsync(ct); }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Withdrawals.AnyAsync(w => w.Id == id, ct);

    public async Task<IEnumerable<Withdrawal>> GetByDriverProfileIdAsync(Guid driverProfileId, CancellationToken ct = default)
        => await _db.Withdrawals
            .Where(w => w.DriverProfileId == driverProfileId)
            .OrderByDescending(w => w.RequestedAt)
            .ToListAsync(ct);

    public async Task<Withdrawal?> GetPendingAsync(Guid driverProfileId, CancellationToken ct = default)
        => await _db.Withdrawals
            .FirstOrDefaultAsync(w => w.DriverProfileId == driverProfileId && w.Status == "Pending", ct);
}
