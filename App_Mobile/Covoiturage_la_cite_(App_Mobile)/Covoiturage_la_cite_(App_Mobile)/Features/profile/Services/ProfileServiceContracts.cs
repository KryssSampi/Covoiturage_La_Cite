// ============================================================
// COVOITURAGE LA CITÉ — Feature: Profile
// IProfileService.cs + IVehicleService.cs + IFavoritesService.cs
// Contrats de service utilisés par les DisplayControler
// Implémentations à connecter à l'API REST
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Services;

// DTOs — Objets de transfert (entrée/sortie API)
public record MeDto(
    string Id, string Email, string FirstName, string LastName,
    string? Phone, string? AvatarUrl, string? Bio, string? NotificationEmail,
    string SchoolRole, string Role, List<string>? LanguagesSpoken);

public record VehicleDto(
    string Id, string Make, string Model, int Year, string Color,
    string LicensePlate, int MaxSeats, string? PhotoUrl,
    bool IsActive, bool IsValidated, bool? AdminRequestDocuments);

public record BadgeDto(string Id, string NameFr, string NameEn, string IconKey, string ColorHex, string TextColorHex);
public record ReviewDto(string Id, string ReviewerName, string? ReviewerId, string? ReviewerAvatarUrl, double Rating, string? Comment, string CreatedAt);
public record PublicTripDto(string Id, string DepartureLabel, string ArrivalLabel, string DepartureDate, string DepartureTime, int AvailableSeats, double PricePerPassenger);
public record UsualTripDto(string DepartureLabel, string ArrivalLabel);

public record DriverProfileDto(
    string ValidationStatus, double AverageRating, int TotalTripsAsDriver,
    double Co2SavedKg, string? VehiclePhotoUrl, string? VehicleMake,
    string? VehicleModel, int? VehicleYear, string? VehicleColor);

public record UserPublicDto(
    string Id, string FirstName, string LastName, string? AvatarUrl, string? BannerUrl,
    string? Bio, bool IsProfileVerified, bool CanBeDriver, string SchoolRole, string Role,
    int GoScore, List<string>? LanguagesSpoken, string CreatedAt,
    int LikesCount, bool IsLikedByMe, bool IsFavorite, bool IsSelf,
    DriverProfileDto? DriverProfile,
    IEnumerable<ReviewDto>? RecentReviews,
    IEnumerable<PublicTripDto>? RecentPublishedTrips,
    IEnumerable<UsualTripDto>? UsualTrips,
    IEnumerable<BadgeDto>? Badges);

public record PreferencesDto(
    bool MusicAccepted, bool PetsAccepted, bool SmokingAccepted, string ConversationLevel,
    bool EmailPrimordiales, bool EmailSecondaires, bool EmailNegligeables,
    bool PushPrimordiales, bool PushSecondaires, bool PushNegligeables,
    bool ShowPhoneNumber, bool ShowLastName, bool AllowAffinityTracking,
    bool VisibilityGoScore, bool VisibilityTripsCount, bool VisibilityGlobalRating, bool VisibilityCo2Saved,
    int DefaultDepartureRadiusMeters, int DefaultArrivalRadiusMeters, int DefaultTimeToleranceMinutes,
    double? DefaultMaxPrice, bool RequireVerifiedDriver, int MinDriverGoScore,
    double MinDriverRating, int MinPassengerGoScore, bool RequirePassengerMessage);

// Requests
public record UpdateMeRequest(
    string FirstName, string LastName, string? Phone, string? Bio,
    string? NotificationEmail, string SchoolRole, List<string> LanguagesSpoken);

public record UpdatePreferencesRequest(
    bool MusicAccepted, bool PetsAccepted, bool SmokingAccepted, string ConversationLevel,
    bool EmailPrimordiales, bool EmailSecondaires, bool EmailNegligeables,
    bool PushPrimordiales, bool PushSecondaires, bool PushNegligeables,
    bool ShowPhoneNumber, bool ShowLastName, bool AllowAffinityTracking,
    bool VisibilityGoScore, bool VisibilityTripsCount, bool VisibilityGlobalRating, bool VisibilityCo2Saved,
    int DefaultDepartureRadiusMeters, int DefaultArrivalRadiusMeters, int DefaultTimeToleranceMinutes,
    double? DefaultMaxPrice, bool RequireVerifiedDriver, int MinDriverGoScore,
    double MinDriverRating, int MinPassengerGoScore, bool RequirePassengerMessage);

public record UpdateVehicleRequest(
    string Id, string Make, string Model, int Year, string Color,
    string LicensePlate, int MaxSeats, bool IsActive);

// SERVICE INTERFACES
/// <summary>Contrat de service profil — brancher sur IHttpClientFactory REST</summary>
public interface IProfileService
{
    Task<MeDto> GetMeAsync(CancellationToken ct = default);
    Task<UserPublicDto> GetPublicProfileAsync(string userId, CancellationToken ct = default);
    Task UpdateMeAsync(UpdateMeRequest request, CancellationToken ct = default);
    Task<PreferencesDto> GetPreferencesAsync(CancellationToken ct = default);
    Task UpdatePreferencesAsync(UpdatePreferencesRequest request, CancellationToken ct = default);
    Task ToggleLikeAsync(string targetUserId, bool liked, CancellationToken ct = default);
    Task SubscribeToUsualTripAsync(string driverId, string departure, string arrival, CancellationToken ct = default);
    Task LogoutAsync(CancellationToken ct = default);
}

/// <summary>Contrat de service véhicule</summary>
public interface IVehicleService
{
    Task<IEnumerable<VehicleDto>> GetMyVehiclesAsync(CancellationToken ct = default);
    Task<VehicleDto> UpdateVehicleAsync(UpdateVehicleRequest request, CancellationToken ct = default);
    Task<VehicleDto> CreateVehicleAsync(UpdateVehicleRequest request, CancellationToken ct = default);
    List<string> GetAllMakes();
    List<string> GetModelsByMake(string make);
}

/// <summary>Contrat de service documents</summary>
public interface IDocumentService
{
    Task UploadDocumentAsync(string vehicleId, string docType, string fileUrl, string? expiryDate = null, CancellationToken ct = default);
}

/// <summary>Contrat de service favoris</summary>
public interface IFavoritesService
{
    Task AddUserFavoriteAsync(string userId, CancellationToken ct = default);
    Task RemoveUserFavoriteAsync(string userId, CancellationToken ct = default);
}

