using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.GamificationRepository;


// ── BadgeRepository ──────────────────────────────────────────────────────────

public class BadgeRepository : IBadgeRepository
{
    private readonly AppDbContext _db;
    public BadgeRepository(AppDbContext db) => _db = db;

    public async Task<Badge?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Badges.FirstOrDefaultAsync(b => b.Id == id, ct);
    public async Task<IEnumerable<Badge>> GetAllAsync(CancellationToken ct = default)
        => await _db.Badges.ToListAsync(ct);
    public async Task AddAsync(Badge entity, CancellationToken ct = default)
    { await _db.Badges.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(Badge entity, CancellationToken ct = default)
    { _db.Badges.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var b = await GetByIdAsync(id, ct); if (b != null) { _db.Badges.Remove(b); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Badges.AnyAsync(b => b.Id == id, ct);

    public async Task<IEnumerable<Badge>> GetActiveAsync(CancellationToken ct = default)
        => await _db.Badges.Where(b => b.IsActive).ToListAsync(ct);
    public async Task<Badge?> GetByNameAsync(string name, CancellationToken ct = default)
        => await _db.Badges.FirstOrDefaultAsync(b => b.Name == name, ct);
}

// ── UserBadgeRepository ──────────────────────────────────────────────────────

public class UserBadgeRepository : IUserBadgeRepository
{
    private readonly AppDbContext _db;
    public UserBadgeRepository(AppDbContext db) => _db = db;

    public async Task<UserBadge?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.UserBadges.Include(ub => ub.Badge).FirstOrDefaultAsync(ub => ub.Id == id, ct);
    public async Task<IEnumerable<UserBadge>> GetAllAsync(CancellationToken ct = default)
        => await _db.UserBadges.Include(ub => ub.Badge).ToListAsync(ct);
    public async Task AddAsync(UserBadge entity, CancellationToken ct = default)
    { await _db.UserBadges.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(UserBadge entity, CancellationToken ct = default)
    { _db.UserBadges.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var ub = await GetByIdAsync(id, ct); if (ub != null) { _db.UserBadges.Remove(ub); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.UserBadges.AnyAsync(ub => ub.Id == id, ct);

    public async Task<IEnumerable<UserBadge>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _db.UserBadges.Include(ub => ub.Badge).Where(ub => ub.UserId == userId).OrderByDescending(ub => ub.AwardedAt).ToListAsync(ct);
    public async Task<bool> UserHasBadgeAsync(Guid userId, Guid badgeId, CancellationToken ct = default)
        => await _db.UserBadges.AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId, ct);
}

// ── EcoChallengeRepository ───────────────────────────────────────────────────

public class EcoChallengeRepository : IEcoChallengeRepository
{
    private readonly AppDbContext _db;
    public EcoChallengeRepository(AppDbContext db) => _db = db;

    public async Task<EcoChallenge?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.EcoChallenges.Include(c => c.Participations).FirstOrDefaultAsync(c => c.Id == id, ct);
    public async Task<IEnumerable<EcoChallenge>> GetAllAsync(CancellationToken ct = default)
        => await _db.EcoChallenges.ToListAsync(ct);
    public async Task AddAsync(EcoChallenge entity, CancellationToken ct = default)
    { await _db.EcoChallenges.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(EcoChallenge entity, CancellationToken ct = default)
    { _db.EcoChallenges.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var c = await GetByIdAsync(id, ct); if (c != null) { _db.EcoChallenges.Remove(c); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.EcoChallenges.AnyAsync(c => c.Id == id, ct);

    public async Task<IEnumerable<EcoChallenge>> GetActiveAsync(CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        return await _db.EcoChallenges.Where(c => c.ActiveFrom <= now && c.ActiveUntil >= now).ToListAsync(ct);
    }
    public async Task<IEnumerable<EcoChallenge>> GetByRoleAsync(string targetRole, CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        return await _db.EcoChallenges.Where(c => (c.TargetRole == "all" || c.TargetRole == targetRole) && c.ActiveFrom <= now && c.ActiveUntil >= now).ToListAsync(ct);
    }
}

// ── ChallengeParticipationRepository ─────────────────────────────────────────

public class ChallengeParticipationRepository : IChallengeParticipationRepository
{
    private readonly AppDbContext _db;
    public ChallengeParticipationRepository(AppDbContext db) => _db = db;

    public async Task<ChallengeParticipation?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.ChallengeParticipations.Include(cp => cp.EcoChallenge).FirstOrDefaultAsync(cp => cp.Id == id, ct);
    public async Task<IEnumerable<ChallengeParticipation>> GetAllAsync(CancellationToken ct = default)
        => await _db.ChallengeParticipations.ToListAsync(ct);
    public async Task AddAsync(ChallengeParticipation entity, CancellationToken ct = default)
    { await _db.ChallengeParticipations.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(ChallengeParticipation entity, CancellationToken ct = default)
    { _db.ChallengeParticipations.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var cp = await GetByIdAsync(id, ct); if (cp != null) { _db.ChallengeParticipations.Remove(cp); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.ChallengeParticipations.AnyAsync(cp => cp.Id == id, ct);

    public async Task<IEnumerable<ChallengeParticipation>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _db.ChallengeParticipations.Include(cp => cp.EcoChallenge).Where(cp => cp.UserId == userId).OrderByDescending(cp => cp.JoinedAt).ToListAsync(ct);
    public async Task<ChallengeParticipation?> GetByUserAndChallengeAsync(Guid userId, Guid challengeId, CancellationToken ct = default)
        => await _db.ChallengeParticipations.Include(cp => cp.EcoChallenge).FirstOrDefaultAsync(cp => cp.UserId == userId && cp.EcoChallengeId == challengeId, ct);
    public async Task<IEnumerable<ChallengeParticipation>> GetLeaderboardAsync(Guid challengeId, int top = 10, CancellationToken ct = default)
        => await _db.ChallengeParticipations.Include(cp => cp.User).Where(cp => cp.EcoChallengeId == challengeId).OrderByDescending(cp => cp.CurrentValue).Take(top).ToListAsync(ct);
}

// ── GoTaskRepository ──────────────────────────────────────────────────────────

public class GoTaskRepository : IGoTaskRepository
{
    private readonly AppDbContext _db;
    public GoTaskRepository(AppDbContext db) => _db = db;

    public async Task<GoTask?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.GoTasks.Include(t => t.Progressions).FirstOrDefaultAsync(t => t.Id == id, ct);
    public async Task<IEnumerable<GoTask>> GetAllAsync(CancellationToken ct = default)
        => await _db.GoTasks.Include(t => t.Progressions).ToListAsync(ct);
    public async Task AddAsync(GoTask entity, CancellationToken ct = default)
    { await _db.GoTasks.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(GoTask entity, CancellationToken ct = default)
    { _db.GoTasks.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var t = await GetByIdAsync(id, ct); if (t != null) { _db.GoTasks.Remove(t); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.GoTasks.AnyAsync(t => t.Id == id, ct);

    public async Task<IEnumerable<GoTask>> GetAllActiveAsync(CancellationToken ct = default)
        => await _db.GoTasks.Where(t => t.IsActive).ToListAsync(ct);

    public async Task<GoTask?> GetByKeyAsync(string taskKey, CancellationToken ct = default)
        => await _db.GoTasks.Include(t => t.Progressions).FirstOrDefaultAsync(t => t.TaskKey == taskKey, ct);

    public async Task<IEnumerable<GoTask>> GetWithUserProgressionAsync(Guid userId, CancellationToken ct = default)
        => await _db.GoTasks
            .Where(t => t.IsActive)
            .Include(t => t.Progressions.Where(p => p.UserId == userId))
            .ToListAsync(ct);
}

// ── UserGoTaskProgressionRepository ──────────────────────────────────────────

public class UserGoTaskProgressionRepository : IUserGoTaskProgressionRepository
{
    private readonly AppDbContext _db;
    public UserGoTaskProgressionRepository(AppDbContext db) => _db = db;

    public async Task<UserGoTaskProgression?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.UserGoTaskProgressions.FirstOrDefaultAsync(p => p.Id == id, ct);
    public async Task<IEnumerable<UserGoTaskProgression>> GetAllAsync(CancellationToken ct = default)
        => await _db.UserGoTaskProgressions.ToListAsync(ct);
    public async Task AddAsync(UserGoTaskProgression entity, CancellationToken ct = default)
    { await _db.UserGoTaskProgressions.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(UserGoTaskProgression entity, CancellationToken ct = default)
    { _db.UserGoTaskProgressions.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var p = await GetByIdAsync(id, ct); if (p != null) { _db.UserGoTaskProgressions.Remove(p); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.UserGoTaskProgressions.AnyAsync(p => p.Id == id, ct);

    public async Task<UserGoTaskProgression?> GetByUserAndTaskAsync(Guid userId, Guid goTaskId, CancellationToken ct = default)
        => await _db.UserGoTaskProgressions.FirstOrDefaultAsync(p => p.UserId == userId && p.GoTaskId == goTaskId, ct);
    public async Task<IEnumerable<UserGoTaskProgression>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _db.UserGoTaskProgressions.Where(p => p.UserId == userId).ToListAsync(ct);
    public async Task<bool> IsCompletedAsync(Guid userId, Guid goTaskId, CancellationToken ct = default)
        => await _db.UserGoTaskProgressions.AnyAsync(p => p.UserId == userId && p.GoTaskId == goTaskId && p.IsDone, ct);
}
