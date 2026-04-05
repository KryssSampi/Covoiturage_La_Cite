using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class UserPreferences
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public bool MusicAccepted { get; set; }
    public bool HasPets { get; set; }
    public bool SmokesRegularly { get; set; }
    public bool TypicalBaggage { get; set; }
    public ConversationLevel ConversationLevel { get; set; }

    // ── Préférences globales (legacy — conservé pour compatibilité) ───────────
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;

    // ── Email par catégorie ───────────────────────────────────────────────────
    /// <summary>Envoyer un email pour les notifications primordiales (défaut: true).</summary>
    public bool EmailPrimordiales { get; set; } = true;
    /// <summary>Envoyer un email pour les notifications secondaires (défaut: true).</summary>
    public bool EmailSecondaires { get; set; } = true;
    /// <summary>Envoyer un email pour les notifications négligeables (défaut: false).</summary>
    public bool EmailNegligeables { get; set; } = false;

    // ── Push mobile par catégorie ─────────────────────────────────────────────
    /// <summary>Envoyer un push pour les notifications primordiales (défaut: true).</summary>
    public bool PushPrimordiales { get; set; } = true;
    /// <summary>Envoyer un push pour les notifications secondaires (défaut: true).</summary>
    public bool PushSecondaires { get; set; } = true;
    /// <summary>Envoyer un push pour les notifications négligeables (défaut: false).</summary>
    public bool PushNegligeables { get; set; } = false;

    public string Language { get; set; } = "fr";

    // Navigation
    public User User { get; set; } = null!;
}
