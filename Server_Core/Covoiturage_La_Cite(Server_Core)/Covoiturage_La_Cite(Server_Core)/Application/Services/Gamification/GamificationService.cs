using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Gamification;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Gamification;

public class GamificationService : IGamificationService
{
    private readonly IBadgeRepository _badgeRepo;
    private readonly IUserBadgeRepository _userBadgeRepo;
    private readonly IEcoChallengeRepository _challengeRepo;
    private readonly IChallengeParticipationRepository _participationRepo;
    private readonly ILogger<GamificationService> _logger;

    public GamificationService(
        IBadgeRepository badgeRepo,
        IUserBadgeRepository userBadgeRepo,
        IEcoChallengeRepository challengeRepo,
        IChallengeParticipationRepository participationRepo,
        ILogger<GamificationService> logger)
    {
        _badgeRepo = badgeRepo;
        _userBadgeRepo = userBadgeRepo;
        _challengeRepo = challengeRepo;
        _participationRepo = participationRepo;
        _logger = logger;
    }

    // ── Badges ───────────────────────────────────────────────────────────────

    public async Task<IEnumerable<BadgeResponseDto>> GetAllBadgesAsync(CancellationToken ct = default)
    {
        var badges = await _badgeRepo.GetActiveAsync(ct);
        return badges.Select(MapBadge);
    }

    public async Task<IEnumerable<UserBadgeResponseDto>> GetMyBadgesAsync(Guid userId, CancellationToken ct = default)
    {
        var userBadges = await _userBadgeRepo.GetByUserIdAsync(userId, ct);
        return userBadges.Select(MapUserBadge);
    }

    public async Task<UserBadgeResponseDto> AwardBadgeAsync(Guid userId, Guid badgeId, CancellationToken ct = default)
    {
        if (await _userBadgeRepo.UserHasBadgeAsync(userId, badgeId, ct))
            throw new InvalidOperationException("L'utilisateur possède déjà ce badge");

        var badge = await _badgeRepo.GetByIdAsync(badgeId, ct)
            ?? throw new KeyNotFoundException("Badge introuvable");

        var userBadge = new UserBadge
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BadgeId = badgeId,
            AwardedAt = DateTimeOffset.UtcNow
        };

        await _userBadgeRepo.AddAsync(userBadge, ct);
        _logger.LogInformation("Badge {BadgeName} décerné à {UserId}", badge.Name, userId);

        // Assigner le badge objet pour le mapping
        userBadge.Badge = badge;
        return MapUserBadge(userBadge);
    }

    // ── Défis écologiques ────────────────────────────────────────────────────

    public async Task<IEnumerable<EcoChallengeResponseDto>> GetActiveChallengesAsync(CancellationToken ct = default)
    {
        var challenges = await _challengeRepo.GetActiveAsync(ct);
        return challenges.Select(MapChallenge);
    }

    public async Task<ChallengeParticipationResponseDto> JoinChallengeAsync(Guid userId, Guid challengeId, CancellationToken ct = default)
    {
        var existing = await _participationRepo.GetByUserAndChallengeAsync(userId, challengeId, ct);
        if (existing != null)
            throw new InvalidOperationException("Vous participez déjà à ce défi");

        var challenge = await _challengeRepo.GetByIdAsync(challengeId, ct)
            ?? throw new KeyNotFoundException("Défi introuvable");

        if (DateTimeOffset.UtcNow > challenge.ActiveUntil)
            throw new InvalidOperationException("Ce défi est terminé");

        var participation = new ChallengeParticipation
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EcoChallengeId = challengeId,
            CurrentValue = 0,
            IsCompleted = false,
            RewardClaimed = false,
            JoinedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _participationRepo.AddAsync(participation, ct);
        participation.EcoChallenge = challenge;
        return MapParticipation(participation);
    }

    public async Task<ChallengeParticipationResponseDto> UpdateProgressAsync(Guid userId, Guid challengeId, decimal progressDelta, CancellationToken ct = default)
    {
        var participation = await _participationRepo.GetByUserAndChallengeAsync(userId, challengeId, ct)
            ?? throw new KeyNotFoundException("Participation introuvable");

        if (participation.IsCompleted)
            throw new InvalidOperationException("Ce défi est déjà complété");

        participation.CurrentValue += progressDelta;
        participation.UpdatedAt = DateTimeOffset.UtcNow;

        // Vérifier si le défi est complété
        if (participation.CurrentValue >= participation.EcoChallenge.TargetValue)
        {
            participation.IsCompleted = true;
            participation.CompletedAt = DateTimeOffset.UtcNow;
            _logger.LogInformation("Défi {ChallengeId} complété par {UserId}", challengeId, userId);
        }

        await _participationRepo.UpdateAsync(participation, ct);
        return MapParticipation(participation);
    }

    public async Task<IEnumerable<ChallengeParticipationResponseDto>> GetMyChallengesAsync(Guid userId, CancellationToken ct = default)
    {
        var participations = await _participationRepo.GetByUserIdAsync(userId, ct);
        return participations.Select(MapParticipation);
    }

    public async Task<IEnumerable<ChallengeParticipationResponseDto>> GetLeaderboardAsync(Guid challengeId, int top = 10, CancellationToken ct = default)
    {
        var participations = await _participationRepo.GetLeaderboardAsync(challengeId, top, ct);
        return participations.Select(MapParticipation);
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private static BadgeResponseDto MapBadge(Badge b) => new()
    {
        Id = b.Id, Name = b.Name, NameEn = b.NameEn,
        Description = b.Description, DescriptionEn = b.DescriptionEn,
        Category = b.Category, IconUrl = b.IconUrl,
        RewardPoints = b.RewardPoints, IsActive = b.IsActive
    };

    private static UserBadgeResponseDto MapUserBadge(UserBadge ub) => new()
    {
        Id = ub.Id, UserId = ub.UserId, BadgeId = ub.BadgeId,
        BadgeName = ub.Badge?.Name ?? "", BadgeIcon = ub.Badge?.IconUrl ?? "",
        BadgeCategory = ub.Badge?.Category ?? "",
        RewardPoints = ub.Badge?.RewardPoints ?? 0,
        AwardedAt = ub.AwardedAt
    };

    private static EcoChallengeResponseDto MapChallenge(EcoChallenge c) => new()
    {
        Id = c.Id, Title = c.Title, TitleEn = c.TitleEn,
        MetricType = c.MetricType, TargetValue = c.TargetValue,
        RewardPoints = c.RewardPoints, RewardBadgeId = c.RewardBadgeId,
        Period = c.Period, ActiveFrom = c.ActiveFrom, ActiveUntil = c.ActiveUntil,
        TargetRole = c.TargetRole,
        TotalParticipants = c.Participations?.Count ?? 0
    };

    private static ChallengeParticipationResponseDto MapParticipation(ChallengeParticipation cp) => new()
    {
        Id = cp.Id, UserId = cp.UserId, EcoChallengeId = cp.EcoChallengeId,
        ChallengeTitle = cp.EcoChallenge?.Title ?? "",
        CurrentValue = cp.CurrentValue,
        TargetValue = cp.EcoChallenge?.TargetValue ?? 0,
        ProgressPercent = cp.EcoChallenge?.TargetValue > 0
            ? Math.Min(100, Math.Round(cp.CurrentValue / cp.EcoChallenge.TargetValue * 100, 1))
            : 0,
        IsCompleted = cp.IsCompleted, CompletedAt = cp.CompletedAt,
        RewardClaimed = cp.RewardClaimed, JoinedAt = cp.JoinedAt
    };
}
