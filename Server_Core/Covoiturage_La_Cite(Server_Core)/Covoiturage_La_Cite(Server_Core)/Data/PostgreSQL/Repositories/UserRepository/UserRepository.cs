using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Text.RegularExpressions;

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
        // Ensure MicrosoftSsoId is generated from email and SchoolRole and is unique.
        if (string.IsNullOrWhiteSpace(entity.Email))
            throw new ArgumentException("User email must be provided to generate MicrosoftSsoId.", nameof(entity));

        var baseId = BuildBaseMicrosoftSsoId(entity.Email, entity.SchoolRole);
        var candidate = baseId;
        var suffix = 0;

        // Try to find a candidate that's not taken (simple pre-check).
        while (await _db.Users.AnyAsync(u => u.MicrosoftSsoId == candidate, ct))
        {
            suffix++;
            candidate = suffix == 0 ? baseId : $"{baseId}-{suffix}";
            if (suffix > 1000)
                throw new InvalidOperationException("Unable to generate unique MicrosoftSsoId after many attempts.");
        }

        entity.MicrosoftSsoId = candidate;

        // Add and save. If a race condition causes a duplicate key at SaveChanges, retry a few times with a new suffix.
        const int maxSaveAttempts = 5;
        for (int attempt = 0; attempt < maxSaveAttempts; attempt++)
        {
            try
            {
                await _db.Users.AddAsync(entity, ct);
                await _db.SaveChangesAsync(ct);
                return;
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pex && pex.SqlState == "23505" && pex.ConstraintName == "IX_Users_MicrosoftSsoId")
            {
                // Detach the tracked entity to prepare for next attempt with new id
                var entry = _db.Entry(entity);
                if (entry != null)
                    entry.State = EntityState.Detached;

                // generate a new candidate by incrementing suffix
                suffix++;
                candidate = $"{baseId}-{suffix}";
                entity.MicrosoftSsoId = candidate;

                if (attempt == maxSaveAttempts - 1)
                    throw; // rethrow after final attempt

                // small delay could help in high-concurrency scenarios
                await Task.Delay(50 * (attempt + 1), ct);
            }
        }
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

    public async Task<IEnumerable<User>> GetTopByGoScoreAsync(int top, CancellationToken ct = default)
    {
        return await _db.Users
            .Where(u => u.DeletedAt == null)
            .OrderByDescending(u => u.GoScore)
            .Take(top)
            .ToListAsync(ct);
    }

    // Helpers
    private static string BuildBaseMicrosoftSsoId(string email, SchoolRole schoolRole)
    {
        var localPart = ExtractLocalPart(email);
        var rolePrefix = GetSchoolRolePrefix(schoolRole);
        return $"la-cite-{rolePrefix}-{localPart}".ToLowerInvariant();
    }

    private static string ExtractLocalPart(string email)
    {
        var at = email.IndexOf('@');
        var local = at > 0 ? email[..at] : email;
        // Normalize: lowercase, keep alphanumerics and replace others with '-'
        local = local.ToLowerInvariant();
        local = Regex.Replace(local, "[^a-z0-9]+", "-");
        local = local.Trim('-');
        return string.IsNullOrEmpty(local) ? "user" : local;
    }

    private static string GetSchoolRolePrefix(SchoolRole role)
    {
        // Map enum values to required prefixes. Add more cases if your enum has more values.
        return role switch
        {
            SchoolRole.Etudiant => "stu",
            // Both staff-like roles map to 'pers' per project convention (professors and staff)
            SchoolRole.MembreDuPersonnel => "pers",
            SchoolRole.Professeur => "pers",
            SchoolRole.Administrateur => "admin",
            _ => "user",
        };
    }
}
