using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;

/// <summary>
/// Astuce/conseil de covoiturage affiché sur le dashboard.
/// Contenu éditorial sans FK relationnelles → MongoDB.
/// </summary>
public class Astuce
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string ExternalId { get; set; } = string.Empty; // ex: "TIP-001"
    public string? ImageUrl { get; set; }
    public string TitleFr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string DescriptionFr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int Order { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
