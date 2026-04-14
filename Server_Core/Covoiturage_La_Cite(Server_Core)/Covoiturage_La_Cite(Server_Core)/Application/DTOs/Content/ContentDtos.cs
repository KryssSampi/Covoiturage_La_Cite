namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Content;

// ── Astuces ───────────────────────────────────────────────────────────────────

public record AstuceResponseDto
{
    public string Id { get; init; } = string.Empty;
    public string ExternalId { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public string TitleFr { get; init; } = string.Empty;
    public string TitleEn { get; init; } = string.Empty;
    public string DescriptionFr { get; init; } = string.Empty;
    public string DescriptionEn { get; init; } = string.Empty;
    public int Order { get; init; }
}

public record CreateAstuceDto
{
    public string ExternalId { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public string TitleFr { get; init; } = string.Empty;
    public string TitleEn { get; init; } = string.Empty;
    public string DescriptionFr { get; init; } = string.Empty;
    public string DescriptionEn { get; init; } = string.Empty;
    public int Order { get; init; }
}

// ── Nouveautés ────────────────────────────────────────────────────────────────

public record NouveauteResponseDto
{
    public string Id { get; init; } = string.Empty;
    public string ExternalId { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string VideoUrl { get; init; } = string.Empty;
    public string? ThumbnailUrl { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record CreateNouveauteDto
{
    public string Title { get; init; } = string.Empty;
    public string VideoUrl { get; init; } = string.Empty;
    public string? ThumbnailUrl { get; init; }
}
