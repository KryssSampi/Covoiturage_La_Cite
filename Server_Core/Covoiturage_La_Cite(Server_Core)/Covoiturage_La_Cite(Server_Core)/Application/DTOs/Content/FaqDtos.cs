namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Content;

// ── FAQ ────────────────────────────────────────────────────────────────────────

/// <summary>
/// Réponse d'une section FAQ envoyée au client web.
/// </summary>
public record FaqSectionResponseDto
{
    public string Id { get; init; } = string.Empty;
    public string ExternalId { get; init; } = string.Empty;
    public string SujetFr { get; init; } = string.Empty;
    public string SujetEn { get; init; } = string.Empty;
    public string Categorie { get; init; } = string.Empty;
    public int Order { get; init; }
    public IEnumerable<FaqQuestionResponseDto> Items { get; init; } = Enumerable.Empty<FaqQuestionResponseDto>();
}

/// <summary>
/// Une question/réponse dans la réponse FAQ.
/// </summary>
public record FaqQuestionResponseDto
{
    public string QuestionFr { get; init; } = string.Empty;
    public string QuestionEn { get; init; } = string.Empty;
    public string ReponseFr { get; init; } = string.Empty;
    public string ReponseEn { get; init; } = string.Empty;
    public int Order { get; init; }
}

/// <summary>
/// DTO pour créer une section FAQ (admin).
/// </summary>
public record CreateFaqSectionDto
{
    public string ExternalId { get; init; } = string.Empty;
    public string SujetFr { get; init; } = string.Empty;
    public string SujetEn { get; init; } = string.Empty;
    public string Categorie { get; init; } = string.Empty;
    public int Order { get; init; }
    public List<CreateFaqQuestionDto> Items { get; init; } = new();
}

/// <summary>
/// DTO pour créer une question FAQ.
/// </summary>
public record CreateFaqQuestionDto
{
    public string QuestionFr { get; init; } = string.Empty;
    public string QuestionEn { get; init; } = string.Empty;
    public string ReponseFr { get; init; } = string.Empty;
    public string ReponseEn { get; init; } = string.Empty;
    public int Order { get; init; }
}

/// <summary>
/// DTO pour mettre à jour une section FAQ (admin).
/// </summary>
public record UpdateFaqSectionDto
{
    public string? SujetFr { get; init; }
    public string? SujetEn { get; init; }
    public string? Categorie { get; init; }
    public int? Order { get; init; }
    public bool? IsActive { get; init; }
    public List<CreateFaqQuestionDto>? Items { get; init; }
}