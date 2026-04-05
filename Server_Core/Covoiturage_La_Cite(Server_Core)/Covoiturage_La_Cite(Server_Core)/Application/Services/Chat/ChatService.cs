using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Chat;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Api.Hubs;
using Covoiturage_La_Cite_Server_Core_.Data.MongoDB;
using Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;
using MongoDB.Driver;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Chat;

public class ChatService : IChatService
{
    private readonly MongoDbContext _mongo;
    private readonly ITrajetRepository _tripRepo;
    private readonly IUserRepository _userRepo;
    private readonly SignalREventService _signalR;
    private readonly ILogger<ChatService> _logger;

    public ChatService(
        MongoDbContext mongo,
        ITrajetRepository tripRepo,
        IUserRepository userRepo,
        SignalREventService signalR,
        ILogger<ChatService> logger)
    {
        _mongo = mongo;
        _tripRepo = tripRepo;
        _userRepo = userRepo;
        _signalR = signalR;
        _logger = logger;
    }

    public async Task<ChatMessageResponseDto> SendAsync(Guid senderId, SendMessageDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            throw new ArgumentException("Le contenu du message ne peut pas être vide");

        // Vérifier que le trajet existe et que les deux utilisateurs y participent
        var trip = await _tripRepo.GetWithDetailsAsync(dto.TripId, ct)
            ?? throw new KeyNotFoundException("Trajet introuvable");

        var isParticipant =
            trip.DriverId == senderId ||
            trip.Reservations.Any(r => r.PassengerId == senderId);

        var isRecipientParticipant =
            trip.DriverId == dto.RecipientId ||
            trip.Reservations.Any(r => r.PassengerId == dto.RecipientId);

        if (!isParticipant || !isRecipientParticipant)
            throw new UnauthorizedAccessException("Seuls les participants du trajet peuvent s'envoyer des messages");

        var message = new ChatMessage
        {
            TripId = dto.TripId,
            SenderId = senderId,
            RecipientId = dto.RecipientId,
            Content = dto.Content.Trim(),
            Type = dto.Type,
            IsRead = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _mongo.ChatMessages.InsertOneAsync(message, cancellationToken: ct);
        _logger.LogInformation("Message envoyé: {MsgId} de {Sender} à {Recipient}", message.Id, senderId, dto.RecipientId);

        var responseDto = MapToResponse(message);

        // Diffusion temps réel via SignalR
        await _signalR.SendToUserAsync(dto.RecipientId, "MessageReceived", responseDto);

        return responseDto;
    }

    public async Task<IEnumerable<ChatMessageResponseDto>> GetConversationAsync(
        Guid userId, Guid tripId, int page, int pageSize, CancellationToken ct = default)
    {
        var filter = Builders<ChatMessage>.Filter.And(
            Builders<ChatMessage>.Filter.Eq(m => m.TripId, tripId),
            Builders<ChatMessage>.Filter.Or(
                Builders<ChatMessage>.Filter.Eq(m => m.SenderId, userId),
                Builders<ChatMessage>.Filter.Eq(m => m.RecipientId, userId)
            ),
            Builders<ChatMessage>.Filter.Eq(m => m.IsDeleted, false)
        );

        var messages = await _mongo.ChatMessages
            .Find(filter)
            .SortByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(ct);

        return messages.Select(MapToResponse).Reverse();
    }

    public async Task<IEnumerable<ConversationSummaryDto>> GetMyConversationsAsync(Guid userId, CancellationToken ct = default)
    {
        // Trouver toutes les conversations de l'utilisateur (messages envoyés ou reçus)
        var filter = Builders<ChatMessage>.Filter.And(
            Builders<ChatMessage>.Filter.Or(
                Builders<ChatMessage>.Filter.Eq(m => m.SenderId, userId),
                Builders<ChatMessage>.Filter.Eq(m => m.RecipientId, userId)
            ),
            Builders<ChatMessage>.Filter.Eq(m => m.IsDeleted, false)
        );

        var allMessages = await _mongo.ChatMessages
            .Find(filter)
            .SortByDescending(m => m.CreatedAt)
            .ToListAsync(ct);

        // Grouper par (tripId, otherUserId)
        var conversations = allMessages
            .GroupBy(m => (
                TripId: m.TripId,
                OtherUserId: m.SenderId == userId ? m.RecipientId : m.SenderId
            ))
            .ToList();

        var summaries = new List<ConversationSummaryDto>();

        foreach (var group in conversations)
        {
            var lastMessage = group.First(); // déjà trié par date desc
            var unreadCount = group.Count(m => m.RecipientId == userId && !m.IsRead);

            var otherUser = await _userRepo.GetWithProfileAsync(group.Key.OtherUserId, ct);
            var trip = await _tripRepo.GetByIdAsync(group.Key.TripId, ct);

            summaries.Add(new ConversationSummaryDto
            {
                TripId = group.Key.TripId,
                TripLabel = trip != null ? $"{trip.DepartureLabel} → {trip.ArrivalLabel}" : "Trajet inconnu",
                OtherUserId = group.Key.OtherUserId,
                OtherUserName = otherUser != null ? $"{otherUser.FirstName} {otherUser.LastName}" : "Utilisateur inconnu",
                OtherUserAvatar = otherUser?.AvatarUrl,
                LastMessageContent = lastMessage.Content,
                LastMessageAt = lastMessage.CreatedAt,
                UnreadCount = unreadCount
            });
        }

        return summaries.OrderByDescending(s => s.LastMessageAt);
    }

    public async Task MarkConversationReadAsync(Guid userId, Guid tripId, CancellationToken ct = default)
    {
        var filter = Builders<ChatMessage>.Filter.And(
            Builders<ChatMessage>.Filter.Eq(m => m.TripId, tripId),
            Builders<ChatMessage>.Filter.Eq(m => m.RecipientId, userId),
            Builders<ChatMessage>.Filter.Eq(m => m.IsRead, false)
        );

        var update = Builders<ChatMessage>.Update
            .Set(m => m.IsRead, true)
            .Set(m => m.ReadAt, DateTimeOffset.UtcNow);

        var result = await _mongo.ChatMessages.UpdateManyAsync(filter, update, cancellationToken: ct);
        _logger.LogInformation("Conversation {TripId} marquée lue pour {UserId} ({Count} msgs)", tripId, userId, result.ModifiedCount);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct = default)
    {
        var filter = Builders<ChatMessage>.Filter.And(
            Builders<ChatMessage>.Filter.Eq(m => m.RecipientId, userId),
            Builders<ChatMessage>.Filter.Eq(m => m.IsRead, false),
            Builders<ChatMessage>.Filter.Eq(m => m.IsDeleted, false)
        );

        return (int)await _mongo.ChatMessages.CountDocumentsAsync(filter, cancellationToken: ct);
    }

    private static ChatMessageResponseDto MapToResponse(ChatMessage m) => new()
    {
        Id = m.Id,
        TripId = m.TripId,
        SenderId = m.SenderId,
        RecipientId = m.RecipientId,
        Content = m.Content,
        Type = m.Type,
        IsRead = m.IsRead,
        ReadAt = m.ReadAt,
        CreatedAt = m.CreatedAt
    };
}
