using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Reservation;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Reservation;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _repo;
    private readonly ITrajetRepository _trajetRepo;
    private readonly ILogger<ReservationService> _logger;

    public ReservationService(
        IReservationRepository repo,
        ITrajetRepository trajetRepo,
        ILogger<ReservationService> logger)
    {
        _repo = repo;
        _trajetRepo = trajetRepo;
        _logger = logger;
    }

    // -- Lecture -------------------------------------------------------------

    public async Task<ReservationResponseDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var reservation = await _repo.GetWithDetailsAsync(id, ct);
        return reservation == null ? null : MapToResponse(reservation);
    }

    public async Task<PaginatedResult<ReservationResponseDto>> GetMineAsync(
        Guid userId,
        string? role,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        IEnumerable<Domain.Entities.Reservation> list;

        if (!string.IsNullOrWhiteSpace(role) && role.Equals("driver", StringComparison.OrdinalIgnoreCase))
            list = await _repo.GetByDriverIdAsync(userId, ct);
        else
            list = await _repo.GetByPassengerIdAsync(userId, ct);

        var items = list.ToList();
        var paged = items
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToResponse);

        return new PaginatedResult<ReservationResponseDto>
        {
            Items = paged,
            TotalCount = items.Count,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IEnumerable<ReservationResponseDto>> GetActiveByPassengerAsync(Guid passengerId, CancellationToken ct = default)
    {
        var list = await _repo.GetActiveByPassengerIdAsync(passengerId, ct);
        return list.Select(MapToResponse);
    }

    public async Task<IEnumerable<ReservationEnrichedDto>> GetPassengerEnrichedAsync(Guid passengerId, CancellationToken ct = default)
    {
        var list = await _repo.GetPassengerEnrichedAsync(passengerId, ct);
        return list.Select(MapToEnriched);
    }

    public async Task<IEnumerable<ReservationEnrichedDto>> GetDriverRequestsAsync(Guid driverId, CancellationToken ct = default)
    {
        var list = await _repo.GetPendingByDriverIdAsync(driverId, ct);
        return list.Select(MapToEnriched);
    }

    // -- Ecriture ------------------------------------------------------------

    public async Task<ReservationResponseDto> CreateAsync(Guid passengerId, CreateReservationDto dto, CancellationToken ct = default)
    {
        var trip = await _trajetRepo.GetByIdAsync(dto.TripId, ct)
            ?? throw new KeyNotFoundException("Trajet introuvable");

        if (trip.DriverId == passengerId)
            throw new InvalidOperationException("Impossible de réserver son propre trajet");

        if (trip.Status != TripStatus.Published && trip.Status != TripStatus.Confirmed)
            throw new InvalidOperationException("Trajet non disponible pour réservation");

        if (trip.CurrentPassengers >= trip.MaxPassengers)
            throw new InvalidOperationException("Trajet complet");

        var activeCount = await _repo.CountActiveByPassengerIdAsync(passengerId, ct);
        if (activeCount >= 5)
            throw new InvalidOperationException("Limite de 5 demandes actives atteinte");

        var now = DateTimeOffset.UtcNow;
        var reservation = new Domain.Entities.Reservation
        {
            Id = Guid.NewGuid(),
            TripId = trip.Id,
            PassengerId = passengerId,
            DriverId = trip.DriverId,
            Status = ReservationStatus.Pending,
            ExpiresAt = ComputeExpiration(trip, now),
            PricePerSeat = trip.PricePerPassenger,
            TotalAmount = trip.PricePerPassenger,
            PaymentStatus = PaymentStatus.Pending,
            PassengerMessage = dto.PassengerMessage,
            CompatibilityScore = dto.CompatibilityScore ?? 0,
            RequestedAt = now,
            UpdatedAt = now
        };

        await _repo.AddAsync(reservation, ct);
        _logger.LogInformation("Reservation créée: {ReservationId} (Trip {TripId})", reservation.Id, trip.Id);

        return MapToResponse(reservation);
    }

    public async Task<ReservationResponseDto> AcceptAsync(Guid reservationId, Guid driverId, CancellationToken ct = default)
    {
        var reservation = await _repo.GetWithDetailsAsync(reservationId, ct)
            ?? throw new KeyNotFoundException("Réservation introuvable");

        if (reservation.DriverId != driverId)
            throw new UnauthorizedAccessException("Vous n'êtes pas le conducteur de ce trajet");

        if (reservation.Status != ReservationStatus.Pending)
            throw new InvalidOperationException("La réservation n'est pas en attente");

        var trip = reservation.Trip ?? await _trajetRepo.GetByIdAsync(reservation.TripId, ct)
            ?? throw new KeyNotFoundException("Trajet introuvable");

        if (trip.CurrentPassengers >= trip.MaxPassengers)
            throw new InvalidOperationException("Trajet complet");

        reservation.Status = ReservationStatus.Confirmed;
        reservation.ConfirmedAt = DateTimeOffset.UtcNow;
        reservation.UpdatedAt = DateTimeOffset.UtcNow;
        reservation.PaymentStatus = PaymentStatus.PreAuthorized;

        trip.CurrentPassengers += 1;
        if (trip.CurrentPassengers >= trip.MaxPassengers)
            trip.Status = TripStatus.Full;
        else if (trip.Status == TripStatus.Published)
            trip.Status = TripStatus.Confirmed;

        await _repo.UpdateAsync(reservation, ct);
        await _trajetRepo.UpdateAsync(trip, ct);

        return MapToResponse(reservation);
    }

    public async Task<ReservationResponseDto> RefuseAsync(Guid reservationId, Guid driverId, string? reason, CancellationToken ct = default)
    {
        var reservation = await _repo.GetWithDetailsAsync(reservationId, ct)
            ?? throw new KeyNotFoundException("Réservation introuvable");

        if (reservation.DriverId != driverId)
            throw new UnauthorizedAccessException("Vous n'êtes pas le conducteur de ce trajet");

        if (reservation.Status != ReservationStatus.Pending)
            throw new InvalidOperationException("La réservation n'est pas en attente");

        reservation.Status = ReservationStatus.Refused;
        reservation.RefusalReason = reason;
        reservation.CancelledAt = DateTimeOffset.UtcNow;
        reservation.UpdatedAt = DateTimeOffset.UtcNow;

        await _repo.UpdateAsync(reservation, ct);

        return MapToResponse(reservation);
    }

    public async Task<ReservationResponseDto> CancelAsync(Guid reservationId, Guid userId, string? reason, CancellationToken ct = default)
    {
        var reservation = await _repo.GetWithDetailsAsync(reservationId, ct)
            ?? throw new KeyNotFoundException("Réservation introuvable");

        if (reservation.PassengerId != userId && reservation.DriverId != userId)
            throw new UnauthorizedAccessException("Vous ne pouvez pas annuler cette réservation");

        if (reservation.Status == ReservationStatus.Completed)
            throw new InvalidOperationException("Impossible d'annuler une réservation terminée");

        if (reservation.Status == ReservationStatus.Cancelled || reservation.Status == ReservationStatus.Refused)
            return MapToResponse(reservation);

        var trip = reservation.Trip ?? await _trajetRepo.GetByIdAsync(reservation.TripId, ct)
            ?? throw new KeyNotFoundException("Trajet introuvable");

        var previousStatus = reservation.Status;
        reservation.Status = ReservationStatus.Cancelled;
        reservation.CancellationReason = reason;
        reservation.CancelledAt = DateTimeOffset.UtcNow;
        reservation.UpdatedAt = DateTimeOffset.UtcNow;

        await _repo.UpdateAsync(reservation, ct);

        // Réajuster les places si la réservation était confirmée
        if (previousStatus == ReservationStatus.Confirmed || previousStatus == ReservationStatus.InProgress)
        {
            trip.CurrentPassengers = Math.Max(0, trip.CurrentPassengers - 1);

            if (trip.Status == TripStatus.Full || trip.Status == TripStatus.Confirmed)
            {
                var confirmedCount = await _repo.CountConfirmedByTripAsync(trip.Id, ct);
                trip.Status = confirmedCount == 0 ? TripStatus.Published : TripStatus.Confirmed;
            }

            await _trajetRepo.UpdateAsync(trip, ct);
        }

        return MapToResponse(reservation);
    }

    public async Task<ReservationResponseDto> ConfirmBoardingDriverAsync(Guid reservationId, Guid driverId, CancellationToken ct = default)
    {
        var reservation = await _repo.GetWithDetailsAsync(reservationId, ct)
            ?? throw new KeyNotFoundException("Réservation introuvable");

        if (reservation.DriverId != driverId)
            throw new UnauthorizedAccessException("Vous n'êtes pas le conducteur de ce trajet");

        if (reservation.Status != ReservationStatus.Confirmed && reservation.Status != ReservationStatus.InProgress)
            throw new InvalidOperationException("La réservation n'est pas confirmée");

        reservation.BoardingConfirmedByDriver = true;
        if (reservation.BoardingConfirmedByPassenger == true)
            reservation.Status = ReservationStatus.InProgress;

        reservation.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(reservation, ct);

        return MapToResponse(reservation);
    }

    public async Task<ReservationResponseDto> ConfirmBoardingPassengerAsync(Guid reservationId, Guid passengerId, CancellationToken ct = default)
    {
        var reservation = await _repo.GetWithDetailsAsync(reservationId, ct)
            ?? throw new KeyNotFoundException("Réservation introuvable");

        if (reservation.PassengerId != passengerId)
            throw new UnauthorizedAccessException("Vous n'êtes pas le passager de cette réservation");

        if (reservation.Status != ReservationStatus.Confirmed && reservation.Status != ReservationStatus.InProgress)
            throw new InvalidOperationException("La réservation n'est pas confirmée");

        reservation.BoardingConfirmedByPassenger = true;
        if (reservation.BoardingConfirmedByDriver == true)
            reservation.Status = ReservationStatus.InProgress;

        reservation.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(reservation, ct);

        return MapToResponse(reservation);
    }

    public async Task CancelAllPendingAsync(Guid passengerId, CancellationToken ct = default)
    {
        var all = await _repo.GetByPassengerIdAsync(passengerId, ct);
        var pending = all.Where(r => r.Status == ReservationStatus.Pending).ToList();
        if (pending.Count == 0) return;

        foreach (var reservation in pending)
        {
            reservation.Status = ReservationStatus.Cancelled;
            reservation.CancellationReason = "cancel_all";
            reservation.CancelledAt = DateTimeOffset.UtcNow;
            reservation.UpdatedAt = DateTimeOffset.UtcNow;
            await _repo.UpdateAsync(reservation, ct);
        }
    }

    // -- Mapping privé --------------------------------------------------------

    private static ReservationResponseDto MapToResponse(Domain.Entities.Reservation r)
        => new()
        {
            Id = r.Id,
            TripId = r.TripId,
            PassengerId = r.PassengerId,
            DriverId = r.DriverId,
            Status = r.Status.ToString().ToLower(),
            ExpiresAt = r.ExpiresAt,
            ConfirmedAt = r.ConfirmedAt,
            CancelledAt = r.CancelledAt,
            CompletedAt = r.CompletedAt,
            PricePerSeat = r.PricePerSeat,
            TotalAmount = r.TotalAmount,
            PaymentStatus = r.PaymentStatus.ToString().ToLower(),
            PassengerMessage = r.PassengerMessage,
            RefusalReason = r.RefusalReason,
            CancellationReason = r.CancellationReason,
            BoardingConfirmedByDriver = r.BoardingConfirmedByDriver,
            BoardingConfirmedByPassenger = r.BoardingConfirmedByPassenger,
            PassengerActuallyBoarded = r.PassengerActuallyBoarded,
            CompatibilityScore = r.CompatibilityScore,
            RequestedAt = r.RequestedAt,
            UpdatedAt = r.UpdatedAt
        };

    private static ReservationEnrichedDto MapToEnriched(Domain.Entities.Reservation r)
    {
        var trip = r.Trip;
        var driver = r.Driver;
        var passenger = r.Passenger;

        return new ReservationEnrichedDto
        {
            Reservation = MapToResponse(r),
            Trip = new TripSummaryDto
            {
                Id = trip.Id,
                DepartureLabel = trip.DepartureLabel,
                ArrivalLabel = trip.ArrivalLabel,
                DepartureDate = trip.DepartureDate,
                DepartureTime = trip.DepartureTime,
                EstimatedDurationMinutes = trip.EstimatedDurationMinutes,
                MaxPassengers = trip.MaxPassengers,
                CurrentPassengers = trip.CurrentPassengers,
                PricePerPassenger = trip.PricePerPassenger,
                Status = trip.Status.ToString().ToLower()
            },
            Driver = new DriverSummaryDto
            {
                Id = driver.Id,
                FirstName = driver.FirstName,
                LastName = driver.LastName,
                AvatarUrl = driver.AvatarUrl,
                AverageRating = driver.DriverProfile?.AverageRating ?? 0m,
                TotalTripsAsDriver = driver.DriverProfile?.TotalTripsAsDriver ?? 0
            },
            Passenger = new PassengerSummaryDto
            {
                Id = passenger.Id,
                FirstName = passenger.FirstName,
                LastName = passenger.LastName,
                AvatarUrl = passenger.AvatarUrl,
                AverageRating = passenger.Stats?.AverageRatingAsPassenger ?? 0m,
                TotalTripsAsPassenger = passenger.Stats?.TotalTripsAsPassenger ?? 0
            }
        };
    }

    private static DateTimeOffset ComputeExpiration(Domain.Entities.Trip trip, DateTimeOffset now)
    {
        var departureLocal = trip.DepartureDate.ToDateTime(trip.DepartureTime);
        var departureUtc = DateTime.SpecifyKind(departureLocal, DateTimeKind.Utc);
        var delta = departureUtc - now.UtcDateTime;

        if (delta <= TimeSpan.FromHours(2))
            return now.AddMinutes(15);
        if (delta <= TimeSpan.FromHours(24))
            return now.AddHours(2);
        return now.AddHours(24);
    }
}
