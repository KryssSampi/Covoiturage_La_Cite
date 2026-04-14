using Covoiturage_La_Cite_Server_Core_.Domain.Entities;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IVehiculeRepository : Domain.Interfaces.IRepository<Vehicle>
{
    Task<IEnumerable<Vehicle>> GetByDriverProfileIdAsync(Guid driverProfileId, CancellationToken ct = default);
    Task<Vehicle?> GetDefaultVehicleAsync(Guid driverProfileId, CancellationToken ct = default);
    Task<Vehicle?> GetByLicensePlateAsync(string licensePlate, CancellationToken ct = default);
}
