namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Gamification;

// ── Badge ────────────────────────────────────────────────────────────────────

public record BadgeResponseDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string NameEn { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string DescriptionEn { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string IconUrl { get; init; } = string.Empty;
    public int RewardPoints { get; init; }
    public bool IsActive { get; init; }
}

public record UserBadgeResponseDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public Guid BadgeId { get; init; }
    public string BadgeName { get; init; } = string.Empty;
    public string BadgeIcon { get; init; } = string.Empty;
    public string BadgeCategory { get; init; } = string.Empty;
    public int RewardPoints { get; init; }
    public DateTimeOffset AwardedAt { get; init; }
}

// ── EcoChallenge ─────────────────────────────────────────────────────────────

public record EcoChallengeResponseDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string TitleEn { get; init; } = string.Empty;
    public string MetricType { get; init; } = string.Empty;
    public decimal TargetValue { get; init; }
    public int RewardPoints { get; init; }
    public Guid? RewardBadgeId { get; init; }
    public string Period { get; init; } = string.Empty;
    public DateTimeOffset ActiveFrom { get; init; }
    public DateTimeOffset ActiveUntil { get; init; }
    public string TargetRole { get; init; } = "all";
    public int TotalParticipants { get; init; }
}

public record ChallengeParticipationResponseDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public Guid EcoChallengeId { get; init; }
    public string ChallengeTitle { get; init; } = string.Empty;
    public decimal CurrentValue { get; init; }
    public decimal TargetValue { get; init; }
    public decimal ProgressPercent { get; init; }
    public bool IsCompleted { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
    public bool RewardClaimed { get; init; }
    public DateTimeOffset JoinedAt { get; init; }
}

// ── GoBoard ───────────────────────────────────────────────────────────────────

public record GoBoardResponseDto
{
    public int GoScore { get; init; }
    public string Tier { get; init; } = string.Empty;
    public int Rang { get; init; }
    public int PointsGagnes { get; init; }
    public IEnumerable<GoTaskResponseDto> GoTasks { get; init; } = [];
    public IEnumerable<ClassementEntryDto> Classement { get; init; } = [];
    public IEnumerable<EcoChallengeAvecProgressionDto> DefisEco { get; init; } = [];
}

public record ClassementEntryDto
{
    public int Rang { get; init; }
    public Guid UtilisateurId { get; init; }
    public string Nom { get; init; } = string.Empty;
    public int Score { get; init; }
    public bool EstMoi { get; init; }
}

public record EcoChallengeAvecProgressionDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string TitleEn { get; init; } = string.Empty;
    public string MetricType { get; init; } = string.Empty;
    public decimal TargetValue { get; init; }
    public int RewardPoints { get; init; }
    public int Progres { get; init; }
    public string Statut { get; init; } = "verrouille"; // actif | verrouille | complete
}

// ── GoTask ────────────────────────────────────────────────────────────────────

public record GoTaskResponseDto
{
    public Guid Id { get; init; }
    public string TaskKey { get; init; } = string.Empty;
    public string TitleFr { get; init; } = string.Empty;
    public string TitleEn { get; init; } = string.Empty;
    public string DescriptionFr { get; init; } = string.Empty;
    public string DescriptionEn { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string? Link { get; init; }
    public int Points { get; init; }
    /// <summary>Progression de l'utilisateur courant sur cette tâche.</summary>
    public bool IsCompleted { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
}
