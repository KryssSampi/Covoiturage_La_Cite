// ============================================================
// COVOITURAGE LA CITÉ — Feature: Profile
// Stubs de services pour la feature Profile
// À remplacer par les implémentations REST
// ============================================================

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Services;

public class ProfileServiceStub : IProfileService
{
    public Task<MeDto> GetMeAsync(CancellationToken ct = default)
        => Task.FromResult(new MeDto(
            "me-001", "me@lacitec.on.ca", "Sophie", "Pelletier",
            "613-555-0101", null, "Passionnée de covoiturage et de durabilité.",
            null, "etudiant", "passenger",
            new List<string> { "FR", "EN" }));

    public Task<UserPublicDto> GetPublicProfileAsync(string userId, CancellationToken ct = default)
        => Task.FromResult(new UserPublicDto(
            userId, "Ahmed", "Ibrahim", null, null,
            "Conducteur expérimenté, ponctuel et agréable.", true, true,
            "etudiant", "driver", 850,
            new List<string> { "FR", "EN" },
            DateTime.Now.AddYears(-2).ToString("O"),
            23, false, false, false,
            new DriverProfileDto("approuve", 4.8, 134, 612, null, "Honda", "Civic", 2018, "Bleu"),
            new List<ReviewDto>
            {
                new("r1", "Marie L.", "u2", null, 5.0, "Conducteur exceptionnel, très ponctuel!", DateTime.Now.AddDays(-5).ToString("O")),
                new("r2", "Pierre D.", "u3", null, 4.5, "Super trajet, conversation agréable.", DateTime.Now.AddDays(-12).ToString("O"))
            },
            new List<PublicTripDto>
            {
                new("t1", "Campus La Cité", "Orléans", DateTime.Now.AddDays(1).ToString("yyyy-MM-dd"), "08:00", 2, 8.0),
                new("t2", "Orléans", "Campus La Cité", DateTime.Now.AddDays(2).ToString("yyyy-MM-dd"), "17:30", 3, 7.0)
            },
            new List<UsualTripDto>
            {
                new("Campus La Cité", "Gatineau"),
                new("Gatineau", "Campus La Cité")
            },
            new List<BadgeDto>
            {
                new("b1", "Conducteur Expert", "Expert Driver", "🚗", "#E8F0FE", "#1A56CC"),
                new("b2", "Ponctuel", "Punctual", "⏰", "#E1F5EE", "#0F6E56"),
                new("b3", "Éco-responsable", "Eco Friendly", "🌿", "#EAF3DE", "#3B6D11")
            }));

    public Task UpdateMeAsync(UpdateMeRequest request, CancellationToken ct = default)
        => Task.CompletedTask;

    public Task<PreferencesDto> GetPreferencesAsync(CancellationToken ct = default)
        => Task.FromResult(new PreferencesDto(
            true, false, false, "moderate",
            true, true, false,
            true, true, false,
            false, true, false,
            true, true, true, true,
            2000, 2000, 30, null,
            false, 0, 3.0, 0, false));

    public Task UpdatePreferencesAsync(UpdatePreferencesRequest request, CancellationToken ct = default)
        => Task.CompletedTask;

    public Task ToggleLikeAsync(string targetUserId, bool liked, CancellationToken ct = default)
        => Task.CompletedTask;

    public Task SubscribeToUsualTripAsync(string driverId, string departure, string arrival, CancellationToken ct = default)
        => Task.CompletedTask;

    public Task LogoutAsync(CancellationToken ct = default)
        => Task.CompletedTask;
}

public class VehicleServiceStub : IVehicleService
{
    public Task<IEnumerable<VehicleDto>> GetMyVehiclesAsync(CancellationToken ct = default)
        => Task.FromResult<IEnumerable<VehicleDto>>(new List<VehicleDto>
        {
            new("v1", "Honda", "Civic", 2018, "Bleu", "ABC-1234", 4, null, true, true, false)
        });

    public Task<VehicleDto> UpdateVehicleAsync(UpdateVehicleRequest request, CancellationToken ct = default)
        => Task.FromResult(new VehicleDto(request.Id, request.Make, request.Model, request.Year, request.Color, request.LicensePlate, request.MaxSeats, null, request.IsActive, true, false));

    public Task<VehicleDto> CreateVehicleAsync(UpdateVehicleRequest request, CancellationToken ct = default)
        => Task.FromResult(new VehicleDto(Guid.NewGuid().ToString(), request.Make, request.Model, request.Year, request.Color, request.LicensePlate, request.MaxSeats, null, false, false, false));

    public List<string> GetAllMakes()
        => new() { "Honda", "Toyota", "Ford", "Chevrolet", "Hyundai", "Kia", "Mazda", "Nissan", "Volkswagen", "Jeep", "Dodge", "Ram", "GMC", "Subaru", "Mitsubishi" };

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
}

public class DocumentServiceStub : IDocumentService
{
    public Task UploadDocumentAsync(string vehicleId, string docType, string fileUrl, string? expiryDate = null, CancellationToken ct = default)
        => Task.CompletedTask;
}

public class FavoritesServiceStub : IFavoritesService
{
    public Task AddUserFavoriteAsync(string userId, CancellationToken ct = default) => Task.CompletedTask;
    public Task RemoveUserFavoriteAsync(string userId, CancellationToken ct = default) => Task.CompletedTask;
}
