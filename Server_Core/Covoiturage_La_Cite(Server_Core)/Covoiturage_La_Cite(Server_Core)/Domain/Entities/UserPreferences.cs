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

    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public string Language { get; set; } = "fr";

    // Navigation
    public User User { get; set; } = null!;
}
