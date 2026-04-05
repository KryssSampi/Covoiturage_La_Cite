using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Vehicle;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Vehicle;

public class VehiculeService : IVehiculeService
{
    private readonly IVehiculeRepository _repo;
    private readonly IUserRepository _userRepo;
    private readonly IGoTaskService _goTasks;
    private readonly ILogger<VehiculeService> _logger;

    public VehiculeService(IVehiculeRepository repo, IUserRepository userRepo, IGoTaskService goTasks, ILogger<VehiculeService> logger)
    {
        _repo = repo;
        _userRepo = userRepo;
        _goTasks = goTasks;
        _logger = logger;
    }

    public async Task<IEnumerable<VehiculeResponseDto>> GetMyVehiclesAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepo.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        if (user.DriverProfile == null)
            return Enumerable.Empty<VehiculeResponseDto>();

        var vehicles = await _repo.GetByDriverProfileIdAsync(user.DriverProfile.Id, ct);
        return vehicles.Select(MapToResponse);
    }

    public async Task<VehiculeResponseDto?> GetByIdAsync(Guid vehicleId, CancellationToken ct = default)
    {
        var v = await _repo.GetByIdAsync(vehicleId, ct);
        return v == null ? null : MapToResponse(v);
    }

    public async Task<VehiculeResponseDto> CreateAsync(Guid userId, CreateVehiculeDto dto, CancellationToken ct = default)
    {
        var user = await _userRepo.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        if (user.DriverProfile == null)
            throw new InvalidOperationException("L'utilisateur n'a pas de profil conducteur");

        // Vérifier unicité plaque
        var existing = await _repo.GetByLicensePlateAsync(dto.LicensePlate, ct);
        if (existing != null)
            throw new InvalidOperationException("Cette plaque d'immatriculation est déjà enregistrée");

        var vehicle = new Domain.Entities.Vehicle
        {
            Id = Guid.NewGuid(),
            DriverProfileId = user.DriverProfile.Id,
            Make = dto.Make,
            Model = dto.Model,
            Year = dto.Year,
            LicensePlate = dto.LicensePlate,
            Color = dto.Color,
            Capacity = dto.Capacity,
            PhotoUrl = dto.PhotoUrl,
            IsActive = true,
            IsDefault = !(await _repo.GetByDriverProfileIdAsync(user.DriverProfile.Id, ct)).Any(),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _repo.AddAsync(vehicle, ct);
        _logger.LogInformation("Véhicule créé: {VehicleId} pour conducteur {UserId}", vehicle.Id, userId);
        // GoTask trigger — GT-011 : premier véhicule ajouté
        _ = Task.Run(() => _goTasks.TryCompleteAsync(userId, "GT-011", ct), ct);
        return MapToResponse(vehicle);
    }

    public async Task<VehiculeResponseDto> UpdateAsync(Guid vehicleId, Guid userId, UpdateVehiculeDto dto, CancellationToken ct = default)
    {
        var vehicle = await _repo.GetByIdAsync(vehicleId, ct)
            ?? throw new KeyNotFoundException("Véhicule introuvable");

        await VerifyOwnership(vehicle, userId, ct);

        if (dto.Make != null) vehicle.Make = dto.Make;
        if (dto.Model != null) vehicle.Model = dto.Model;
        if (dto.Year.HasValue) vehicle.Year = dto.Year.Value;
        if (dto.LicensePlate != null)
        {
            var existing = await _repo.GetByLicensePlateAsync(dto.LicensePlate, ct);
            if (existing != null && existing.Id != vehicleId)
                throw new InvalidOperationException("Cette plaque d'immatriculation est déjà enregistrée");
            vehicle.LicensePlate = dto.LicensePlate;
        }
        if (dto.Color != null) vehicle.Color = dto.Color;
        if (dto.Capacity.HasValue) vehicle.Capacity = dto.Capacity.Value;
        if (dto.PhotoUrl != null) vehicle.PhotoUrl = dto.PhotoUrl;

        vehicle.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(vehicle, ct);
        return MapToResponse(vehicle);
    }

    public async Task SetDefaultAsync(Guid vehicleId, Guid userId, CancellationToken ct = default)
    {
        var vehicle = await _repo.GetByIdAsync(vehicleId, ct)
            ?? throw new KeyNotFoundException("Véhicule introuvable");

        await VerifyOwnership(vehicle, userId, ct);

        // Désactiver l'ancien défaut
        var currentDefault = await _repo.GetDefaultVehicleAsync(vehicle.DriverProfileId, ct);
        if (currentDefault != null && currentDefault.Id != vehicleId)
        {
            currentDefault.IsDefault = false;
            await _repo.UpdateAsync(currentDefault, ct);
        }

        vehicle.IsDefault = true;
        await _repo.UpdateAsync(vehicle, ct);
    }

    public async Task DeactivateAsync(Guid vehicleId, Guid userId, CancellationToken ct = default)
    {
        var vehicle = await _repo.GetByIdAsync(vehicleId, ct)
            ?? throw new KeyNotFoundException("Véhicule introuvable");

        await VerifyOwnership(vehicle, userId, ct);

        vehicle.IsActive = false;
        vehicle.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(vehicle, ct);
        _logger.LogInformation("Véhicule désactivé: {VehicleId}", vehicleId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private async Task VerifyOwnership(Domain.Entities.Vehicle vehicle, Guid userId, CancellationToken ct)
    {
        var user = await _userRepo.GetWithProfileAsync(userId, ct);
        if (user?.DriverProfile == null || vehicle.DriverProfileId != user.DriverProfile.Id)
            throw new UnauthorizedAccessException("Ce véhicule ne vous appartient pas");
    }

    private static VehiculeResponseDto MapToResponse(Domain.Entities.Vehicle v) => new()
    {
        Id = v.Id,
        DriverProfileId = v.DriverProfileId,
        Make = v.Make,
        Model = v.Model,
        Year = v.Year,
        LicensePlate = v.LicensePlate,
        Color = v.Color,
        Capacity = v.Capacity,
        IsActive = v.IsActive,
        IsDefault = v.IsDefault,
        PhotoUrl = v.PhotoUrl,
        CreatedAt = v.CreatedAt
    };
}
