using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;

/// <summary>
/// Message de chat instantané entre deux utilisateurs dans le contexte d'un trajet.
/// Stocké dans MongoDB : pas de JOINs nécessaires, append-only, payload flexible.
/// </summary>
public class ChatMessage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    /// <summary>Identifiant du trajet lié à la conversation.</summary>
    public Guid TripId { get; set; }

    /// <summary>Identifiant de l'expéditeur.</summary>
    public Guid SenderId { get; set; }

    /// <summary>Identifiant du destinataire.</summary>
    public Guid RecipientId { get; set; }

    /// <summary>Contenu textuel du message.</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Type : text | system | image</summary>
    public string Type { get; set; } = "text";

    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>true si le message a été supprimé (soft-delete).</summary>
    public bool IsDeleted { get; set; }
}
