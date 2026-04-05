using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;

/// <summary>
/// Nouveauté / vidéo d'annonce publiée par l'administration.
/// Documents simples sans relations → MongoDB.
/// </summary>
public class Nouveaute
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string ExternalId { get; set; } = string.Empty; // ex: "NVT-2026-00001"
    public string Title { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public bool IsPublished { get; set; } = true;

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
