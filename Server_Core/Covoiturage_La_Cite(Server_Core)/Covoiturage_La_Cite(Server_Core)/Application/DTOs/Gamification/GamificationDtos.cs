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
