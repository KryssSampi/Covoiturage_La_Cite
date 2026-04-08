using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Covoiturage_La_Cite_Server_Core_.Data.MongoDB.Models;

/// <summary>
/// Section FAQ (Foire Aux Questions) affichée sur le site web.
/// Contenu éditorial bilingue sans FK relationnelles → MongoDB.
/// </summary>
public class FaqItem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    /// <summary>Identifiant unique lisible (ex: "inscription-connexion").</summary>
    public string ExternalId { get; set; } = string.Empty;

    /// <summary>Titre de la section en français (ex: "Inscription & Connexion").</summary>
    public string SujetFr { get; set; } = string.Empty;

    /// <summary>Titre de la section en anglais.</summary>
    public string SujetEn { get; set; } = string.Empty;

    /// <summary>Catégorie de regroupement (ex: "Compte", "Trajets", "Sécurité").</summary>
    public string Categorie { get; set; } = string.Empty;

    /// <summary>Questions/réponses dans cette section.</summary>
    public List<FaqQuestion> Items { get; set; } = new();

    /// <summary>Visible sur le site web.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Ordre d'affichage dans la liste des sections.</summary>
    public int Order { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; set; }
}

/// <summary>
/// Une paire question/réponse dans une section FAQ.
/// </summary>
public class FaqQuestion
{
    public string QuestionFr { get; set; } = string.Empty;
    public string QuestionEn { get; set; } = string.Empty;
    public string ReponseFr { get; set; } = string.Empty;
    public string ReponseEn { get; set; } = string.Empty;

    /// <summary>Ordre d'affichage dans la section.</summary>
    public int Order { get; set; }
}