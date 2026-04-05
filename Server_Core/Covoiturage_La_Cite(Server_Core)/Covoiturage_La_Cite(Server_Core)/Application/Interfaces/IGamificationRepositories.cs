using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Interfaces;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IGoTaskRepository : IRepository<GoTask>
{
    Task<IEnumerable<GoTask>> GetAllActiveAsync(CancellationToken ct = default);
    Task<GoTask?> GetByKeyAsync(string taskKey, CancellationToken ct = default);
    Task<IEnumerable<GoTask>> GetWithUserProgressionAsync(Guid userId, CancellationToken ct = default);
}

public interface IUserGoTaskProgressionRepository : IRepository<UserGoTaskProgression>
{
    Task<UserGoTaskProgression?> GetByUserAndTaskAsync(Guid userId, Guid goTaskId, CancellationToken ct = default);
    Task<IEnumerable<UserGoTaskProgression>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<bool> IsCompletedAsync(Guid userId, Guid goTaskId, CancellationToken ct = default);
}

public interface IBadgeRepository : IRepository<Badge>
{
    Task<IEnumerable<Badge>> GetActiveAsync(CancellationToken ct = default);
    Task<Badge?> GetByNameAsync(string name, CancellationToken ct = default);
}

public interface IUserBadgeRepository : IRepository<UserBadge>
{
    Task<IEnumerable<UserBadge>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<bool> UserHasBadgeAsync(Guid userId, Guid badgeId, CancellationToken ct = default);
}

public interface IEcoChallengeRepository : IRepository<EcoChallenge>
{
    Task<IEnumerable<EcoChallenge>> GetActiveAsync(CancellationToken ct = default);
    Task<IEnumerable<EcoChallenge>> GetByRoleAsync(string targetRole, CancellationToken ct = default);
}

public interface IChallengeParticipationRepository : IRepository<ChallengeParticipation>
{
    Task<IEnumerable<ChallengeParticipation>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<ChallengeParticipation?> GetByUserAndChallengeAsync(Guid userId, Guid challengeId, CancellationToken ct = default);
    Task<IEnumerable<ChallengeParticipation>> GetLeaderboardAsync(Guid challengeId, int top = 10, CancellationToken ct = default);
}
