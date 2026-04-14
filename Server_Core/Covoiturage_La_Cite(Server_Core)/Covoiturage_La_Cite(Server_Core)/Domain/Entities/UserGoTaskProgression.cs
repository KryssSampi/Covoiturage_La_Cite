namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

/// <summary>
/// Progression d'un utilisateur sur une GoTask spécifique.
/// Une ligne par (utilisateur, tâche) — crée quand la tâche est complétée.
/// </summary>
public class UserGoTaskProgression
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid GoTaskId { get; set; }
    public bool IsDone { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }

    public User User { get; set; } = null!;
    public GoTask GoTask { get; set; } = null!;
}
