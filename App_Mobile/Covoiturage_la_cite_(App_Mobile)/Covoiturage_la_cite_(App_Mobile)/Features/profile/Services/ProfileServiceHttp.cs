using Covoiturage_la_cite__App_Mobile_.Services.Api;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Services;

public class ProfileServiceHttp : IProfileService, IVehicleService, IDocumentService
{
    private readonly IApiService _api;

    public ProfileServiceHttp(IApiService api)
    {
        _api = api;
    }

    public async Task<MeDto> GetMeAsync(CancellationToken ct = default)
    {
        var envelope = await _api.GetAsync<ApiEnvelope<UserMeApiDto>>("api/users/me", ct);
        var data = envelope?.Data ?? throw new InvalidOperationException("Réponse profil invalide.");

        return new MeDto(
            Id: data.Id?.ToString() ?? string.Empty,
            Email: data.Email ?? string.Empty,
            FirstName: data.FirstName ?? string.Empty,
            LastName: data.LastName ?? string.Empty,
            Phone: data.PhoneNumber,
            AvatarUrl: data.AvatarUrl,
            Bio: data.Bio,
            NotificationEmail: data.NotificationEmail,
            SchoolRole: data.SchoolRole?.ToString() ?? string.Empty,
            Role: data.Role?.ToString() ?? string.Empty,
            LanguagesSpoken: data.LanguagesSpoken?.ToList() ?? new List<string>());
    }

    public async Task<UserPublicDto> GetPublicProfileAsync(string userId, CancellationToken ct = default)
    {
        var endpoint = $"api/users/{Uri.EscapeDataString(userId)}/public";
        var envelope = await _api.GetAsync<ApiEnvelope<UserPublicApiDto>>(endpoint, ct);
        var data = envelope?.Data ?? throw new InvalidOperationException("Réponse profil public invalide.");

        return new UserPublicDto(
            Id: data.Id?.ToString() ?? string.Empty,
            FirstName: data.FirstName ?? string.Empty,
            LastName: data.LastName ?? string.Empty,
            AvatarUrl: data.AvatarUrl,
            BannerUrl: null,
            Bio: data.Bio,
            IsProfileVerified: data.IsProfileVerified,
            CanBeDriver: data.CanBeDriver,
            SchoolRole: data.SchoolRole?.ToString() ?? string.Empty,
            Role: data.Role?.ToString() ?? string.Empty,
            GoScore: data.GoScore,
            LanguagesSpoken: data.LanguagesSpoken?.ToList(),
            CreatedAt: data.CreatedAt?.ToString("O") ?? DateTimeOffset.UtcNow.ToString("O"),
            LikesCount: data.LikesCount,
            IsLikedByMe: data.IsLikedByMe,
            IsFavorite: data.IsFavorite,
            IsSelf: false,
            DriverProfile: data.DriverProfile is null
                ? null
                : new DriverProfileDto(
                    data.DriverProfile.ValidationStatus ?? string.Empty,
                    (double)data.DriverProfile.AverageRating,
                    data.DriverProfile.TotalTripsAsDriver,
                    (double)data.DriverProfile.Co2SavedKg,
                    data.DriverProfile.VehiclePhotoUrl,
                    data.DriverProfile.VehicleMake,
                    data.DriverProfile.VehicleModel,
                    data.DriverProfile.VehicleYear,
                    data.DriverProfile.VehicleColor),
            RecentReviews: data.RecentReviews?.Select(r => new ReviewDto(
                Id: r.Id?.ToString() ?? Guid.NewGuid().ToString(),
                ReviewerName: r.ReviewerName ?? string.Empty,
                ReviewerId: null,
                ReviewerAvatarUrl: r.ReviewerAvatar,
                Rating: r.Rating,
                Comment: r.Comment,
                CreatedAt: r.CreatedAt?.ToString("O") ?? DateTimeOffset.UtcNow.ToString("O"))),
            RecentPublishedTrips: data.RecentPublishedTrips?.Select(t => new PublicTripDto(
                Id: t.Id?.ToString() ?? string.Empty,
                DepartureLabel: t.DepartureLabel ?? string.Empty,
                ArrivalLabel: t.ArrivalLabel ?? string.Empty,
                DepartureDate: t.DepartureDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                DepartureTime: t.DepartureTime?.ToString(@"hh\:mm") ?? string.Empty,
                AvailableSeats: t.AvailableSeats,
                PricePerPassenger: (double)t.PricePerPassenger)),
            UsualTrips: data.UsualTrips?.Select(t => new UsualTripDto(
                t.DepartureLabel ?? string.Empty,
                t.ArrivalLabel ?? string.Empty)),
            Badges: Enumerable.Empty<BadgeDto>());
    }

    public async Task UpdateMeAsync(UpdateMeRequest request, CancellationToken ct = default)
    {
        var body = new
        {
            firstName = request.FirstName,
            lastName = request.LastName,
            phoneNumber = request.Phone,
            bio = request.Bio,
            notificationEmail = request.NotificationEmail,
            languagesSpoken = request.LanguagesSpoken.ToArray()
        };

        _ = await _api.PutAsync<object, ApiEnvelope<UserMeApiDto>>("api/users/me", body, ct);
    }

    public async Task<PreferencesDto> GetPreferencesAsync(CancellationToken ct = default)
    {
        var envelope = await _api.GetAsync<ApiEnvelope<UserMeApiDto>>("api/users/me", ct);
        var prefs = envelope?.Data?.Preferences;

        return new PreferencesDto(
            MusicAccepted: prefs?.MusicAccepted ?? true,
            PetsAccepted: prefs?.PetsAccepted ?? false,
            SmokingAccepted: prefs?.SmokingAccepted ?? false,
            ConversationLevel: prefs?.ConversationLevel ?? "moderate",
            EmailPrimordiales: prefs?.EmailPrimordiales ?? true,
            EmailSecondaires: prefs?.EmailSecondaires ?? true,
            EmailNegligeables: prefs?.EmailNegligeables ?? false,
            PushPrimordiales: prefs?.PushPrimordiales ?? true,
            PushSecondaires: prefs?.PushSecondaires ?? true,
            PushNegligeables: prefs?.PushNegligeables ?? false,
            ShowPhoneNumber: false,
            ShowLastName: true,
            AllowAffinityTracking: false,
            VisibilityGoScore: true,
            VisibilityTripsCount: true,
            VisibilityGlobalRating: true,
            VisibilityCo2Saved: true,
            DefaultDepartureRadiusMeters: 2000,
            DefaultArrivalRadiusMeters: 2000,
            DefaultTimeToleranceMinutes: 30,
            DefaultMaxPrice: null,
            RequireVerifiedDriver: false,
            MinDriverGoScore: 0,
            MinDriverRating: 3.0,
            MinPassengerGoScore: 0,
            RequirePassengerMessage: false);
    }

    public async Task UpdatePreferencesAsync(UpdatePreferencesRequest request, CancellationToken ct = default)
    {
        var body = new
        {
            preferences = new
            {
                musicAccepted = request.MusicAccepted,
                petsAccepted = request.PetsAccepted,
                smokingAccepted = request.SmokingAccepted,
                conversationLevel = request.ConversationLevel,
                emailPrimordiales = request.EmailPrimordiales,
                emailSecondaires = request.EmailSecondaires,
                emailNegligeables = request.EmailNegligeables,
                pushPrimordiales = request.PushPrimordiales,
                pushSecondaires = request.PushSecondaires,
                pushNegligeables = request.PushNegligeables
            }
        };

        _ = await _api.PutAsync<object, ApiEnvelope<UserMeApiDto>>("api/users/me", body, ct);
    }

    public async Task ToggleLikeAsync(string targetUserId, bool liked, CancellationToken ct = default)
    {
        var endpoint = $"api/users/{Uri.EscapeDataString(targetUserId)}/like";
        _ = await _api.PostAsync<object, ApiEnvelope<object>>(endpoint, new { liked }, ct);
    }

    public async Task SubscribeToUsualTripAsync(string driverId, string departure, string arrival, CancellationToken ct = default)
    {
        var endpoint = $"api/users/{Uri.EscapeDataString(driverId)}/survey-alert";
        var body = new
        {
            driverId,
            departureLabel = departure,
            arrivalLabel = arrival
        };

        _ = await _api.PostAsync<object, ApiEnvelope<object>>(endpoint, body, ct);
    }

    public async Task LogoutAsync(CancellationToken ct = default)
    {
        _ = await _api.PostAsync<object, ApiEnvelope<object>>("api/auth/logout", new { }, ct);
        SecureStorage.Remove("jwt");
        _api.ClearAuthToken();
    }

    public async Task<IEnumerable<VehicleDto>> GetMyVehiclesAsync(CancellationToken ct = default)
    {
        var envelope = await _api.GetAsync<ApiEnvelope<IEnumerable<VehicleApiDto>>>("api/vehicles", ct);
        var vehicles = envelope?.Data ?? Enumerable.Empty<VehicleApiDto>();

        return vehicles.Select(v => new VehicleDto(
            Id: v.Id?.ToString() ?? string.Empty,
            Make: v.Make ?? string.Empty,
            Model: v.Model ?? string.Empty,
            Year: v.Year,
            Color: v.Color ?? string.Empty,
            LicensePlate: v.LicensePlate ?? string.Empty,
            MaxSeats: v.Capacity,
            PhotoUrl: v.PhotoUrl,
            IsActive: v.IsActive,
            IsValidated: true,
            AdminRequestDocuments: false));
    }

    public async Task<VehicleDto> UpdateVehicleAsync(UpdateVehicleRequest request, CancellationToken ct = default)
    {
        var endpoint = $"api/vehicles/{Uri.EscapeDataString(request.Id)}";
        var body = new
        {
            make = request.Make,
            model = request.Model,
            year = request.Year,
            color = request.Color,
            licensePlate = request.LicensePlate,
            capacity = request.MaxSeats
        };

        var envelope = await _api.PutAsync<object, ApiEnvelope<VehicleApiDto>>(endpoint, body, ct);
        var data = envelope?.Data ?? throw new InvalidOperationException("Réponse véhicule invalide.");

        return new VehicleDto(
            Id: data.Id?.ToString() ?? request.Id,
            Make: data.Make ?? request.Make,
            Model: data.Model ?? request.Model,
            Year: data.Year == 0 ? request.Year : data.Year,
            Color: data.Color ?? request.Color,
            LicensePlate: data.LicensePlate ?? request.LicensePlate,
            MaxSeats: data.Capacity == 0 ? request.MaxSeats : data.Capacity,
            PhotoUrl: data.PhotoUrl,
            IsActive: data.IsActive,
            IsValidated: true,
            AdminRequestDocuments: false);
    }

    public async Task<VehicleDto> CreateVehicleAsync(UpdateVehicleRequest request, CancellationToken ct = default)
    {
        var body = new
        {
            make = request.Make,
            model = request.Model,
            year = request.Year,
            color = request.Color,
            licensePlate = request.LicensePlate,
            capacity = request.MaxSeats
        };

        var envelope = await _api.PostAsync<object, ApiEnvelope<VehicleApiDto>>("api/vehicles", body, ct);
        var data = envelope?.Data ?? throw new InvalidOperationException("Réponse véhicule invalide.");

        return new VehicleDto(
            Id: data.Id?.ToString() ?? Guid.NewGuid().ToString(),
            Make: data.Make ?? request.Make,
            Model: data.Model ?? request.Model,
            Year: data.Year == 0 ? request.Year : data.Year,
            Color: data.Color ?? request.Color,
            LicensePlate: data.LicensePlate ?? request.LicensePlate,
            MaxSeats: data.Capacity == 0 ? request.MaxSeats : data.Capacity,
            PhotoUrl: data.PhotoUrl,
            IsActive: data.IsActive,
            IsValidated: true,
            AdminRequestDocuments: false);
    }

    public List<string> GetAllMakes()
        => new()
        {
            "Honda", "Toyota", "Ford", "Chevrolet", "Hyundai",
            "Kia", "Mazda", "Nissan", "Volkswagen", "Jeep",
            "Dodge", "Ram", "GMC", "Subaru", "Mitsubishi"
        };

    public List<string> GetModelsByMake(string make)
        => make switch
        {
            "Honda" => new() { "Civic", "Accord", "CR-V", "HR-V", "Pilot", "Passport", "Ridgeline", "Odyssey" },
            "Toyota" => new() { "Corolla", "Camry", "RAV4", "Highlander", "Tacoma", "Tundra", "Sienna", "Prius" },
            "Ford" => new() { "F-150", "F-250", "Explorer", "Escape", "Edge", "Bronco", "Mustang", "Transit" },
            "Chevrolet" => new() { "Silverado", "Equinox", "Traverse", "Blazer", "Trax", "Colorado", "Malibu" },
            "Hyundai" => new() { "Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona", "Ioniq 5" },
            "Kia" => new() { "Sportage", "Sorento", "Telluride", "Forte", "K5", "Soul", "Stinger" },
            "Mazda" => new() { "Mazda3", "Mazda6", "CX-5", "CX-50", "CX-9", "MX-5 Miata" },
            "Nissan" => new() { "Altima", "Sentra", "Rogue", "Murano", "Pathfinder", "Frontier", "Armada" },
            _ => new() { "Modèle 1", "Modèle 2", "Modèle 3" }
        };

    public async Task UploadDocumentAsync(string vehicleId, string docType, string fileUrl, string? expiryDate = null, CancellationToken ct = default)
    {
        var body = new
        {
            vehicleId,
            docType,
            fileUrl,
            expiryDate
        };

        _ = await _api.PostAsync<object, ApiEnvelope<object>>("api/documents/upload", body, ct);
    }

    private sealed record ApiEnvelope<T>(bool Success, T? Data, string? Message, string[]? Errors);

    private sealed record UserMeApiDto(
        Guid? Id,
        string? Email,
        string? FirstName,
        string? LastName,
        string? PhoneNumber,
        string? AvatarUrl,
        string? Bio,
        string? NotificationEmail,
        object? SchoolRole,
        object? Role,
        IEnumerable<string>? LanguagesSpoken,
        PreferencesApiDto? Preferences);

    private sealed record PreferencesApiDto(
        bool? MusicAccepted,
        bool? PetsAccepted,
        bool? SmokingAccepted,
        string? ConversationLevel,
        bool? EmailPrimordiales,
        bool? EmailSecondaires,
        bool? EmailNegligeables,
        bool? PushPrimordiales,
        bool? PushSecondaires,
        bool? PushNegligeables);

    private sealed record UserPublicApiDto(
        Guid? Id,
        string? FirstName,
        string? LastName,
        string? AvatarUrl,
        string? Bio,
        bool IsProfileVerified,
        bool CanBeDriver,
        object? SchoolRole,
        object? Role,
        int GoScore,
        IEnumerable<string>? LanguagesSpoken,
        DateTimeOffset? CreatedAt,
        int LikesCount,
        bool IsLikedByMe,
        bool IsFavorite,
        DriverProfilePublicApiDto? DriverProfile,
        IEnumerable<ReviewPublicApiDto>? RecentReviews,
        IEnumerable<PublicTripApiDto>? RecentPublishedTrips,
        IEnumerable<UsualTripApiDto>? UsualTrips);

    private sealed record DriverProfilePublicApiDto(
        string? ValidationStatus,
        decimal AverageRating,
        int TotalTripsAsDriver,
        decimal Co2SavedKg,
        string? VehiclePhotoUrl,
        string? VehicleMake,
        string? VehicleModel,
        int? VehicleYear,
        string? VehicleColor);

    private sealed record ReviewPublicApiDto(
        Guid? Id,
        string? ReviewerName,
        string? ReviewerAvatar,
        double Rating,
        string? Comment,
        DateTimeOffset? CreatedAt);

    private sealed record PublicTripApiDto(
        Guid? Id,
        string? DepartureLabel,
        string? ArrivalLabel,
        DateOnly? DepartureDate,
        TimeOnly? DepartureTime,
        int AvailableSeats,
        decimal PricePerPassenger);

    private sealed record UsualTripApiDto(string? DepartureLabel, string? ArrivalLabel);

    private sealed record VehicleApiDto(
        Guid? Id,
        string? Make,
        string? Model,
        int Year,
        string? LicensePlate,
        string? Color,
        int Capacity,
        bool IsActive,
        bool IsDefault,
        string? PhotoUrl);
}

public class FavoritesServiceHttp : IFavoritesService
{
    private readonly IApiService _api;

    public FavoritesServiceHttp(IApiService api)
    {
        _api = api;
    }

    public async Task AddUserFavoriteAsync(string userId, CancellationToken ct = default)
    {
        var endpoint = $"api/favorites/{Uri.EscapeDataString(userId)}/toggle";
        _ = await _api.PostAsync<object, object>(endpoint, new { }, ct);
    }

    public async Task RemoveUserFavoriteAsync(string userId, CancellationToken ct = default)
    {
        var endpoint = $"api/favorites/{Uri.EscapeDataString(userId)}/toggle";
        _ = await _api.PostAsync<object, object>(endpoint, new { }, ct);
    }
}
