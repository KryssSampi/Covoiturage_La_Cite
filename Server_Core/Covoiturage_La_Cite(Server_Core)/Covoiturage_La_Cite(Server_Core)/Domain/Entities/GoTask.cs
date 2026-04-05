namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

/// <summary>
/// GoTask — défi / mission de la plateforme.
/// Chaque tâche est commune à tous les utilisateurs ; la progression est par utilisateur.
/// </summary>
public class GoTask
{
    public Guid Id { get; set; }

    /// <summary>Clé métier stable utilisée par les triggers (ex: "GT-001").</summary>
    public string TaskKey { get; set; } = string.Empty;

    public string TitleFr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string DescriptionFr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;

    /// <summary>mixte | driverOnly | passengerOnly</summary>
    public string Category { get; set; } = "mixte";

    /// <summary>Lien vers la fonctionnalité liée (deeplink).</summary>
    public string? Link { get; set; }

    /// <summary>GoPoints attribués à la complétion.</summary>
    public int Points { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<UserGoTaskProgression> Progressions { get; set; } = new List<UserGoTaskProgression>();
}
