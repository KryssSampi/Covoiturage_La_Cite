using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Chat;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IChatService
{
    /// <summary>
    /// Envoie un message et le diffuse en temps réel via SignalR.
    /// Valide que sender et recipient sont bien liés par une réservation sur le trajet.
    /// </summary>
    Task<ChatMessageResponseDto> SendAsync(Guid senderId, SendMessageDto dto, CancellationToken ct = default);

    /// <summary>Historique des messages d'une conversation (tripId + les 2 participants).</summary>
    Task<IEnumerable<ChatMessageResponseDto>> GetConversationAsync(Guid userId, Guid tripId, int page, int pageSize, CancellationToken ct = default);

    /// <summary>Liste des conversations actives de l'utilisateur (derniers messages).</summary>
    Task<IEnumerable<ConversationSummaryDto>> GetMyConversationsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Marque tous les messages d'une conversation comme lus.</summary>
    Task MarkConversationReadAsync(Guid userId, Guid tripId, CancellationToken ct = default);

    /// <summary>Nombre total de messages non lus toutes conversations.</summary>
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct = default);
}
