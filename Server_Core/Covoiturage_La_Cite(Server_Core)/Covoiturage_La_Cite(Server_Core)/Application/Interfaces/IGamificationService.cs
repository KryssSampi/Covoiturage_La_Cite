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

public interface IGoTaskService
{
    /// <summary>Retourne toutes les GoTasks actives avec la progression de l'utilisateur.</summary>
    Task<IEnumerable<GoTaskResponseDto>> GetAllWithProgressionAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Tente de marquer une GoTask comme complétée pour l'utilisateur.
    /// Idempotent — si déjà complétée, retourne false sans erreur.
    /// Attribue les GoPoints et envoie une notification si complétée.
    /// </summary>
    Task<bool> TryCompleteAsync(Guid userId, string taskKey, CancellationToken ct = default);

    /// <summary>
    /// Retourne le GoBoard complet de l'utilisateur :
    /// GoScore, palier, rang, GoTasks avec progression, classement, défis écologiques.
    /// </summary>
    Task<GoBoardResponseDto> GetGoBoardAsync(Guid userId, CancellationToken ct = default);
}
