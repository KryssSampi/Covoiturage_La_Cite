using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Gamification;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IGamificationService
{
    // Badges
    Task<IEnumerable<BadgeResponseDto>> GetAllBadgesAsync(CancellationToken ct = default);
    Task<IEnumerable<UserBadgeResponseDto>> GetMyBadgesAsync(Guid userId, CancellationToken ct = default);
    Task<UserBadgeResponseDto> AwardBadgeAsync(Guid userId, Guid badgeId, CancellationToken ct = default);

    // Défis écologiques
    Task<IEnumerable<EcoChallengeResponseDto>> GetActiveChallengesAsync(CancellationToken ct = default);
    Task<ChallengeParticipationResponseDto> JoinChallengeAsync(Guid userId, Guid challengeId, CancellationToken ct = default);
    Task<ChallengeParticipationResponseDto> UpdateProgressAsync(Guid userId, Guid challengeId, decimal progressDelta, CancellationToken ct = default);
    Task<IEnumerable<ChallengeParticipationResponseDto>> GetMyChallengesAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<ChallengeParticipationResponseDto>> GetLeaderboardAsync(Guid challengeId, int top = 10, CancellationToken ct = default);
}
