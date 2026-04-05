namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Chat;

// ── Réponse ───────────────────────────────────────────────────────────────────

public record ChatMessageResponseDto
{
    public string Id { get; init; } = string.Empty;
    public Guid TripId { get; init; }
    public Guid SenderId { get; init; }
    public Guid RecipientId { get; init; }
    public string Content { get; init; } = string.Empty;
    public string Type { get; init; } = "text";
    public bool IsRead { get; init; }
    public DateTimeOffset? ReadAt { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

// ── Entrée ────────────────────────────────────────────────────────────────────

public record SendMessageDto
{
    /// <summary>ID du trajet — la conversation est toujours contextualisée par un trajet.</summary>
    public Guid TripId { get; init; }

    /// <summary>Destinataire du message.</summary>
    public Guid RecipientId { get; init; }

    public string Content { get; init; } = string.Empty;

    /// <summary>text | image (défaut: text)</summary>
    public string Type { get; init; } = "text";
}

// ── Conversation ──────────────────────────────────────────────────────────────

/// <summary>
/// Vue condensée d'une conversation — dernier message + infos de l'interlocuteur.
/// Utilisée pour la liste des conversations.
/// </summary>
public record ConversationSummaryDto
{
    public Guid TripId { get; init; }
    public string TripLabel { get; init; } = string.Empty;
    public Guid OtherUserId { get; init; }
    public string OtherUserName { get; init; } = string.Empty;
    public string? OtherUserAvatar { get; init; }
    public string LastMessageContent { get; init; } = string.Empty;
    public DateTimeOffset LastMessageAt { get; init; }
    public int UnreadCount { get; init; }
}
