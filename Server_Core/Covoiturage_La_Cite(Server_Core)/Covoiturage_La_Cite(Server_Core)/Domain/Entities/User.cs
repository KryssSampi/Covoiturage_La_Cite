using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string MicrosoftSsoId { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public UserRole Role { get; set; }
    public SchoolRole SchoolRole { get; set; } = SchoolRole.Etudiant;
    public UserStatus Status { get; set; }
    public bool IsProfileVerified { get; set; }
    public bool CanBeDriver { get; set; }
    public int GoScore { get; set; }

    // ── Flags d'onboarding ────────────────────────────────────────────────────
    /// <summary>L'utilisateur a accepté la politique d'utilisation lors de l'onboarding.</summary>
    public bool AlreadySignPolitics { get; set; }
    /// <summary>L'utilisateur (conducteur) a soumis tous ses documents de véhicule.</summary>
    public bool AlreadySubmittedAllVehiculeDocument { get; set; }
    /// <summary>L'utilisateur a configuré une photo de profil.</summary>
    public bool AlreadySetAProfilePicture { get; set; }
    /// <summary>L'onboarding complet a été terminé au moins une fois.</summary>
    public bool OnboardingCompleted { get; set; }
    public int ReputationPoints { get; set; }
    public string Language { get; set; } = "fr";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public DateTimeOffset? SuspendedUntil { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }

    public DriverProfile? DriverProfile { get; set; }
    public UserPreferences? Preferences { get; set; }
    public UserStat? Stats { get; set; }
    public ICollection<UserBadge> Badges { get; set; } = new List<UserBadge>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();
    public ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
    public ICollection<Penalty> Penalties { get; set; } = new List<Penalty>();
    public ICollection<Report> ReportsFiled { get; set; } = new List<Report>();
    public ICollection<SosAlert> SosAlerts { get; set; } = new List<SosAlert>();
}
