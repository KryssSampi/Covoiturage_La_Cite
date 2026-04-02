using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.UserRepository;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    // ── IRepository<User> ────────────────────────────────────────────────────

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken ct = default)
        => await _db.Users.OrderByDescending(u => u.CreatedAt).ToListAsync(ct);

    public async Task AddAsync(User entity, CancellationToken ct = default)
    {
        await _db.Users.AddAsync(entity, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(User entity, CancellationToken ct = default)
    {
        _db.Users.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var user = await GetByIdAsync(id, ct);
        if (user != null)
        {
            _db.Users.Remove(user);
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Users.AnyAsync(u => u.Id == id, ct);

    // ── IUserRepository ──────────────────────────────────────────────────────

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<User?> GetByMicrosoftIdAsync(string microsoftSsoId, CancellationToken ct = default)
        => await _db.Users.FirstOrDefaultAsync(u => u.MicrosoftSsoId == microsoftSsoId, ct);

    public async Task<User?> GetWithProfileAsync(Guid id, CancellationToken ct = default)
        => await _db.Users
            .Include(u => u.DriverProfile)
            .Include(u => u.Preferences)
            .Include(u => u.Stats)
            .FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<User?> GetPublicProfileAsync(Guid id, CancellationToken ct = default)
        => await _db.Users
            .Include(u => u.DriverProfile)
            .FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<IEnumerable<User>> GetAllPaginatedAsync(int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(s) ||
                u.FirstName.ToLower().Contains(s) ||
                u.LastName.ToLower().Contains(s));
        }

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(string? search = null, CancellationToken ct = default)
    {
        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(s) ||
                u.FirstName.ToLower().Contains(s) ||
                u.LastName.ToLower().Contains(s));
        }

        return await query.CountAsync(ct);
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken ct = default)
    {
        var user = await GetByIdAsync(id, ct);
        if (user != null)
        {
            user.DeletedAt = DateTimeOffset.UtcNow;
            user.Status = Domain.Enums.UserStatus.Deleted;
            await _db.SaveChangesAsync(ct);
        }
    }
}
