using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;

/// <summary>
/// Log applicatif stocké dans MongoDB.
/// Utilisé par le LoggingService pour les logs d'activité, d'erreurs et d'audit leger.
/// </summary>
public class AppLog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string Level { get; set; } = "Information";     // Information, Warning, Error, Critical
    public string Message { get; set; } = "";
    public string? Exception { get; set; }
    public string? RequestPath { get; set; }
    public string? UserId { get; set; }
    public string? Action { get; set; }                    // ex: "auth.signin", "trip.create"
    public string? IpAddress { get; set; }
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
}
