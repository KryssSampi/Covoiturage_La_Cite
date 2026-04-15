// Features/goboard/DisplayModels/GoboardDisplayModels.cs

namespace Covoiturage_la_cite__App_Mobile_.Features.goboard.DisplayModels
{
    // ─── GoScore Hero ────────────────────────────────────────────────────────────

    public record GoScoreHeroDisplayModel(
        int    Score,
        int    MaxScore,
        double GaugePercent,
        string RankEmoji,
        string RankLabel,
        string LevelLabel
    );

    // ─── Go!Tâche ────────────────────────────────────────────────────────────────

    public enum GoTaskStatus { Done, Todo }

    public record GoTaskDisplayModel(
        string       Id,
        string       Title,
        string       Description,
        int          Points,
        GoTaskStatus Status
    );

    public record GoTaskListDisplayModel(
        IReadOnlyList<GoTaskDisplayModel> Tasks,
        int                               PotentialPoints
    );

    // ─── Classement ──────────────────────────────────────────────────────────────

    public record RankEntryDisplayModel(
        int    Rank,
        string MedalEmoji,
        string Initials,
        string AvatarBgHex,
        string AvatarFgHex,
        string DisplayName,
        int    Score,
        bool   IsMe
    );

    public record LeaderboardDisplayModel(
        IReadOnlyList<RankEntryDisplayModel> Entries,
        int                                  TotalParticipants,
        int                                  HiddenCount
    );

    // ─── Défi écologique ─────────────────────────────────────────────────────────

    public enum EcoChallengeStatus { Completed, InProgress, Locked }

    public record EcoChallengeDisplayModel(
        string             Emoji,
        string             Name,
        string             Description,
        double             ProgressPercent,
        string             TargetLabel,
        EcoChallengeStatus Status,
        string?            UnlockBadgeLabel
    );

    public record EcoChallengesDisplayModel(
        IReadOnlyList<EcoChallengeDisplayModel> Challenges
    );

    // ─── Historique GoScore ───────────────────────────────────────────────────────

    public record ScoreHistoryEntryDisplayModel(
        string Label,
        string DateLabel,
        int    Points
    );

    public record ScoreHistoryDisplayModel(
        IReadOnlyList<ScoreHistoryEntryDisplayModel> Entries,
        int                                          TotalAccumulated,
        int                                          TotalEvents
    );
}
