using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Reservation;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IReservationService
{
    Task<ReservationResponseDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ReservationResponseDto> CreateAsync(Guid passengerId, CreateReservationDto dto, CancellationToken ct = default);
    Task<PaginatedResult<ReservationResponseDto>> GetMineAsync(Guid userId, string? role, int page, int pageSize, CancellationToken ct = default);
    Task<IEnumerable<ReservationResponseDto>> GetActiveByPassengerAsync(Guid passengerId, CancellationToken ct = default);
    Task CancelAllPendingAsync(Guid passengerId, CancellationToken ct = default);

    Task<ReservationResponseDto> AcceptAsync(Guid reservationId, Guid driverId, CancellationToken ct = default);
    Task<ReservationResponseDto> RefuseAsync(Guid reservationId, Guid driverId, string? reason, CancellationToken ct = default);
    Task<ReservationResponseDto> CancelAsync(Guid reservationId, Guid userId, string? reason, CancellationToken ct = default);
    Task<ReservationResponseDto> ConfirmBoardingDriverAsync(Guid reservationId, Guid driverId, CancellationToken ct = default);
    Task<ReservationResponseDto> ConfirmBoardingPassengerAsync(Guid reservationId, Guid passengerId, CancellationToken ct = default);

    Task<IEnumerable<ReservationEnrichedDto>> GetPassengerEnrichedAsync(Guid passengerId, CancellationToken ct = default);
    Task<IEnumerable<ReservationEnrichedDto>> GetDriverRequestsAsync(Guid driverId, CancellationToken ct = default);
}
