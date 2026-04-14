using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Interfaces;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<IEnumerable<Transaction>> GetByReservationIdAsync(Guid reservationId, CancellationToken ct = default);
    Task<IEnumerable<Transaction>> GetByDriverIdAsync(Guid driverId, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct = default);
    Task<IEnumerable<Transaction>> GetByPassengerIdAsync(Guid passengerId, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct = default);
    Task<decimal> GetDriverTotalEarningsAsync(Guid driverId, DateTimeOffset? from = null, CancellationToken ct = default);
    Task<decimal> GetPassengerTotalSpentAsync(Guid passengerId, DateTimeOffset? from = null, CancellationToken ct = default);
}

public interface IPenaltyRepository : IRepository<Penalty>
{
    Task<IEnumerable<Penalty>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<Penalty>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<decimal> GetTotalUndeductedAsync(Guid userId, CancellationToken ct = default);
}

public interface IWithdrawalRepository : IRepository<Withdrawal>
{
    Task<IEnumerable<Withdrawal>> GetByDriverProfileIdAsync(Guid driverProfileId, CancellationToken ct = default);
    Task<Withdrawal?> GetPendingAsync(Guid driverProfileId, CancellationToken ct = default);
}
