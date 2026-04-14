using Covoiturage_La_Cite_Server_Core_.Domain.Entities;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IReservationRepository : Domain.Interfaces.IRepository<Reservation>
{
    Task<Reservation?> GetWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Reservation>> GetByPassengerIdAsync(Guid passengerId, CancellationToken ct = default);
    Task<IEnumerable<Reservation>> GetByDriverIdAsync(Guid driverId, CancellationToken ct = default);
    Task<IEnumerable<Reservation>> GetPendingByDriverIdAsync(Guid driverId, CancellationToken ct = default);
    Task<IEnumerable<Reservation>> GetActiveByPassengerIdAsync(Guid passengerId, CancellationToken ct = default);
    Task<int> CountActiveByPassengerIdAsync(Guid passengerId, CancellationToken ct = default);
    Task<int> CountConfirmedByTripAsync(Guid tripId, CancellationToken ct = default);
    Task<IEnumerable<Reservation>> GetPassengerEnrichedAsync(Guid passengerId, CancellationToken ct = default);
    Task<IEnumerable<Reservation>> GetDriverEnrichedAsync(Guid driverId, CancellationToken ct = default);
}
