namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

/// <summary>
/// Lieu favori enregistré par un utilisateur (domicile, travail, campus, etc.).
/// </summary>
public class PlaceFavori
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    /// <summary>Nom affiché (ex: "Domicile", "Travail").</summary>
    public string Pseudonyme { get; set; } = string.Empty;

    /// <summary>Adresse complète pour l'autocomplétion.</summary>
    public string Adresse { get; set; } = string.Empty;

    public decimal Lat { get; set; }
    public decimal Lng { get; set; }

    /// <summary>Tag d'icône : campus | domicile | travail | ecole | ville | autre.</summary>
    public string IconTag { get; set; } = "autre";

    /// <summary>Lieu ancré = non-supprimable par l'utilisateur (ex: Campus La Cité).</summary>
    public bool IsAnchored { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
}
