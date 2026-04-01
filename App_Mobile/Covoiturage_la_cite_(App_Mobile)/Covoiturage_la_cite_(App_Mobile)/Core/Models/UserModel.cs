namespace Covoiturage_la_cite__App_Mobile_.Core.Models
{
    public enum UserRole
    {
        Passenger,
        Driver,
        Admin
    }

    public enum ConversationLevel
    {
        Quiet,
        Moderate,
        Chatty
    }

    public partial  record DriverProfile(
        string ValidationStatus,
        int ReputationPoints,
        double AverageRating,
        int TotalTripsAsDriver,
        double Co2SavedKg,
        double CancellationRate,
        int PunctualityScore,
        int NoShowCount
    );

    public record PassengerProfile(
        double AverageRating,
        int TotalTripsAsPassenger,
        double Co2SavedKg,
        int PunctualityScore,
        int NoShowCount
    );

    public record UserPreferences(
        bool MusicAccepted,
        bool PetsAccepted,
        bool SmokingAccepted,
        ConversationLevel ConversationLevel
    );

    public record GeoPoint(double Lat, double Lng);

    public record UserModel(
        string Id,
        string Email,
        string FirstName,
        string LastName,
        string Initials,
        string? AvatarUrl,
        string? Phone,
        UserRole Role,
        bool CanBeDriver,
        bool ProfileVerified,
        bool IsActive,
        DriverProfile? DriverProfile,
        PassengerProfile PassengerProfile,
        UserPreferences Preferences,
        int GoScore,
        IReadOnlyList<string> BadgeIds,
        string? PreferencesId,
        GeoPoint? CurrentLocation,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}
