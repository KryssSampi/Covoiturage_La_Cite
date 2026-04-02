using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Vehicle;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IVehiculeService
{
    Task<IEnumerable<VehiculeResponseDto>> GetMyVehiclesAsync(Guid userId, CancellationToken ct = default);
    Task<VehiculeResponseDto?> GetByIdAsync(Guid vehicleId, CancellationToken ct = default);
    Task<VehiculeResponseDto> CreateAsync(Guid userId, CreateVehiculeDto dto, CancellationToken ct = default);
    Task<VehiculeResponseDto> UpdateAsync(Guid vehicleId, Guid userId, UpdateVehiculeDto dto, CancellationToken ct = default);
    Task SetDefaultAsync(Guid vehicleId, Guid userId, CancellationToken ct = default);
    Task DeactivateAsync(Guid vehicleId, Guid userId, CancellationToken ct = default);
}
