using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;

/// <summary>
/// Historique d'activité d'un utilisateur (connexions, déconnexions).
/// Time-series avec schéma flexible → MongoDB.
/// </summary>
public class UserActivity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public Guid UserId { get; set; }

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTimeOffset LastSeenAt { get; set; } = DateTimeOffset.UtcNow;

    public bool IsCurrentlyConnectedOnWeb { get; set; }
    public bool IsCurrentlyConnectedOnMobile { get; set; }

    public List<ConnectionRecord> ConnectionHistory { get; set; } = [];
}

public class ConnectionRecord
{
    /// <summary>web | mobile</summary>
    public string Type { get; set; } = "web";

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTimeOffset ConnectedAt { get; set; }

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTimeOffset? DisconnectedAt { get; set; }

    public string? UserAgent { get; set; }
    public string? Role { get; set; }
    public string? IpAddress { get; set; }
}
