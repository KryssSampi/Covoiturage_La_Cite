using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Trip;
using Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using NetTopologySuite.Geometries;
using UserEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.User;
using VehicleEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.Vehicle;
using TripEntity = Covoiturage_La_Cite_Server_Core_.Domain.Entities.Trip;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Trip;

public class TrajetService : ITrajetService
{
    private readonly ITrajetRepository _repo;
    private readonly IGoTaskService _goTasks;
    private readonly ILogger<TrajetService> _logger;
    private static readonly GeometryFactory _gf = new(new PrecisionModel(), 4326);

    public TrajetService(ITrajetRepository repo, IGoTaskService goTasks, ILogger<TrajetService> logger)
    {
        _repo = repo;
        _goTasks = goTasks;
        _logger = logger;
    }

    // ── Lecture ───────────────────────────────────────────────────────────────

    public async Task<TrajetResponseDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var trip = await _repo.GetWithDetailsAsync(id, ct);
        return trip == null ? null : MapToResponse(trip);
    }

    public async Task<PaginatedResult<TrajetResponseDto>> SearchAsync(TrajetSearchDto criteria, CancellationToken ct = default)
    {
        var searchCriteria = new TripSearchCriteria
        {
            DepartureLat = criteria.DepartureLat,
            DepartureLng = criteria.DepartureLng,
            ArrivalLat = criteria.ArrivalLat,
            ArrivalLng = criteria.ArrivalLng,
            RadiusKm = criteria.RadiusKm,
            Date = criteria.Date,
            TimeMin = criteria.TimeMin,
            TimeMax = criteria.TimeMax,
            PaymentMethod = criteria.PaymentMethod != null && Enum.TryParse<PaymentMethod>(criteria.PaymentMethod, true, out var pm) ? pm : null,
            Page = criteria.Page,
            PageSize = criteria.PageSize
        };

        var trips = await _repo.SearchAsync(searchCriteria, ct);
        var total = await _repo.SearchCountAsync(searchCriteria, ct);

        return new PaginatedResult<TrajetResponseDto>
        {
            Items = trips.Select(MapToResponse),
            TotalCount = total,
            Page = criteria.Page,
            PageSize = criteria.PageSize
        };
    }

    public async Task<PaginatedResult<TrajetResponseDto>> GetDriverTripsAsync(Guid driverId, string? status, int page, int pageSize, CancellationToken ct = default)
    {
        TripStatus? tripStatus = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TripStatus>(status, true, out var s))
            tripStatus = s;

        var trips = await _repo.GetByDriverIdAsync(driverId, tripStatus, ct);
        var list = trips.ToList();

        var paged = list
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToResponse);

        return new PaginatedResult<TrajetResponseDto>
        {
            Items = paged,
            TotalCount = list.Count,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<TrajetResponseDto>> GetDriverHistoriqueAsync(Guid driverId, int page, int pageSize, CancellationToken ct = default)
    {
        var trips = await _repo.GetDriverHistoriqueAsync(driverId, page, pageSize, ct);
        return new PaginatedResult<TrajetResponseDto>
        {
            Items = trips.Select(MapToResponse),
            TotalCount = trips.Count(),
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<TrajetResponseDto>> GetPassengerHistoriqueAsync(Guid passengerId, int page, int pageSize, CancellationToken ct = default)
    {
        var trips = await _repo.GetPassengerHistoriqueAsync(passengerId, page, pageSize, ct);
        return new PaginatedResult<TrajetResponseDto>
        {
            Items = trips.Select(MapToResponse),
            TotalCount = trips.Count(),
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<TrajetEnCoursDto?> GetTripEnCoursAsync(Guid tripId, CancellationToken ct = default)
    {
        var trip = await _repo.GetTripEnCoursAsync(tripId, ct);
        if (trip == null) return null;

        var lastGps = trip.GpsPositions.FirstOrDefault();

        return new TrajetEnCoursDto
        {
            Id = trip.Id,
            Status = trip.Status.ToString().ToLower(),
            Driver = MapDriver(trip.Driver),
            Vehicle = MapVehicle(trip.Vehicle),
            DepartureLabel = trip.DepartureLabel,
            ArrivalLabel = trip.ArrivalLabel,
            DepartureLat = trip.DeparturePoint.Y,
            DepartureLng = trip.DeparturePoint.X,
            ArrivalLat = trip.ArrivalPoint.Y,
            ArrivalLng = trip.ArrivalPoint.X,
            Polyline = trip.Polyline,
            DepartureDate = trip.DepartureDate,
            DepartureTime = trip.DepartureTime,
            EstimatedArrivalTime = trip.EstimatedArrivalTime,
            ActualStartedAt = trip.ActualStartedAt,
            Passengers = trip.Reservations
                .Where(r => r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.InProgress)
                .Select(r => new TrajetPassengerDto
                {
                    UserId = r.PassengerId,
                    FirstName = r.Passenger.FirstName,
                    LastName = r.Passenger.LastName,
                    AvatarUrl = r.Passenger.AvatarUrl,
                    ReservationId = r.Id,
                    ReservationStatus = r.Status.ToString().ToLower(),
                    BoardingConfirmedByPassenger = r.BoardingConfirmedByPassenger
                }),
            CurrentLat = lastGps?.Location.Y,
            CurrentLng = lastGps?.Location.X,
            LastGpsUpdate = lastGps?.CapturedAt
        };
    }

    public async Task<IEnumerable<TrajetPassengerDto>> GetTripPassengersAsync(Guid tripId, CancellationToken ct = default)
    {
        var trip = await _repo.GetWithDetailsAsync(tripId, ct);
        if (trip == null) return Enumerable.Empty<TrajetPassengerDto>();

        return trip.Reservations
            .Where(r => r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.InProgress)
            .Select(r => new TrajetPassengerDto
            {
                UserId = r.PassengerId,
                FirstName = r.Passenger.FirstName,
                LastName = r.Passenger.LastName,
                AvatarUrl = r.Passenger.AvatarUrl,
                ReservationId = r.Id,
                ReservationStatus = r.Status.ToString().ToLower(),
                BoardingConfirmedByPassenger = r.BoardingConfirmedByPassenger
            });
    }

    // ── Brouillons ───────────────────────────────────────────────────────────

    public async Task<IEnumerable<TrajetResponseDto>> GetDraftsAsync(Guid driverId, CancellationToken ct = default)
    {
        var drafts = await _repo.GetDraftsByDriverIdAsync(driverId, ct);
        return drafts.Select(MapToResponse);
    }

    public async Task<TrajetResponseDto?> GetDraftByIdAsync(Guid draftId, Guid driverId, CancellationToken ct = default)
    {
        var trip = await _repo.GetWithDetailsAsync(draftId, ct);
        if (trip == null || trip.DriverId != driverId || trip.Status != TripStatus.Draft)
            return null;
        return MapToResponse(trip);
    }

    // ── Écriture ─────────────────────────────────────────────────────────────

    public async Task<TrajetResponseDto> CreateAsync(Guid driverId, CreateTrajetDto dto, CancellationToken ct = default)
    {
        var trip = BuildTrip(driverId, dto, TripStatus.Published);
        await _repo.AddAsync(trip, ct);
        _logger.LogInformation("Trajet créé et publié: {TripId} par {DriverId}", trip.Id, driverId);
        return MapToResponse(trip);
    }

    public async Task<TrajetResponseDto> SaveDraftAsync(Guid driverId, CreateTrajetDto dto, CancellationToken ct = default)
    {
        var trip = BuildTrip(driverId, dto, TripStatus.Draft);
        await _repo.AddAsync(trip, ct);
        _logger.LogInformation("Brouillon sauvegardé: {TripId} par {DriverId}", trip.Id, driverId);
        return MapToResponse(trip);
    }

    public async Task<TrajetResponseDto> UpdateAsync(Guid tripId, Guid driverId, UpdateTrajetDto dto, CancellationToken ct = default)
    {
        var trip = await _repo.GetByIdAsync(tripId, ct)
            ?? throw new KeyNotFoundException("Trajet introuvable");

        if (trip.DriverId != driverId)
            throw new UnauthorizedAccessException("Vous n'êtes pas le conducteur de ce trajet");

        if (trip.Status != TripStatus.Draft && trip.Status != TripStatus.Published)
            throw new InvalidOperationException("Impossible de modifier un trajet en cours ou terminé");

        // Restrictions si passagers confirmés
        if (trip.CurrentPassengers > 0 && (dto.DepartureLat.HasValue || dto.ArrivalLat.HasValue || dto.DepartureDate.HasValue))
            throw new InvalidOperationException("Impossible de modifier l'itinéraire ou la date avec des passagers confirmés");

        if (dto.VehicleId.HasValue) trip.VehicleId = dto.VehicleId.Value;
        if (dto.DepartureLabel != null) trip.DepartureLabel = dto.DepartureLabel;
        if (dto.DepartureAddress != null) trip.DepartureAddress = dto.DepartureAddress;
        if (dto.DepartureLat.HasValue && dto.DepartureLng.HasValue)
            trip.DeparturePoint = _gf.CreatePoint(new Coordinate(dto.DepartureLng.Value, dto.DepartureLat.Value));
        if (dto.ArrivalLabel != null) trip.ArrivalLabel = dto.ArrivalLabel;
        if (dto.ArrivalAddress != null) trip.ArrivalAddress = dto.ArrivalAddress;
        if (dto.ArrivalLat.HasValue && dto.ArrivalLng.HasValue)
            trip.ArrivalPoint = _gf.CreatePoint(new Coordinate(dto.ArrivalLng.Value, dto.ArrivalLat.Value));
        if (dto.DepartureDate.HasValue) trip.DepartureDate = dto.DepartureDate.Value;
        if (dto.DepartureTime.HasValue) trip.DepartureTime = dto.DepartureTime.Value;
        if (dto.MaxPassengers.HasValue) trip.MaxPassengers = dto.MaxPassengers.Value;
        if (dto.PricePerPassenger.HasValue) trip.PricePerPassenger = dto.PricePerPassenger.Value;
        if (dto.PaymentMethod != null && Enum.TryParse<Domain.Enums.PaymentMethod>(dto.PaymentMethod, true, out var pm))
            trip.PaymentMethod = pm;
        if (dto.BaggageAllowed.HasValue) trip.BaggageAllowed = dto.BaggageAllowed.Value;
        if (dto.PetsAllowed.HasValue) trip.PetsAllowed = dto.PetsAllowed.Value;
        if (dto.SmokingAllowed.HasValue) trip.SmokingAllowed = dto.SmokingAllowed.Value;
        if (dto.MusicAllowed.HasValue) trip.MusicAllowed = dto.MusicAllowed.Value;
        if (dto.ConversationLevel != null && Enum.TryParse<ConversationLevel>(dto.ConversationLevel, true, out var cl))
            trip.ConversationLevel = cl;
        if (dto.DriverNote != null) trip.DriverNote = dto.DriverNote;

        trip.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(trip, ct);
        return MapToResponse(trip);
    }

    // ── Machine d'états ──────────────────────────────────────────────────────

    public async Task<TrajetResponseDto> PublishAsync(Guid tripId, Guid driverId, CancellationToken ct = default)
    {
        var trip = await GetOwnedTrip(tripId, driverId, ct);

        if (trip.Status != TripStatus.Draft)
            throw new InvalidOperationException($"Impossible de publier un trajet en statut {trip.Status}");

        trip.Status = TripStatus.Published;
        trip.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(trip, ct);
        _logger.LogInformation("Trajet publié: {TripId}", tripId);
        // GoTask trigger — GT-010 : premier trajet publié comme conducteur
        _ = Task.Run(() => _goTasks.TryCompleteAsync(driverId, "GT-010", ct), ct);
        return MapToResponse(trip);
    }

    public async Task<TrajetResponseDto> StartAsync(Guid tripId, Guid driverId, CancellationToken ct = default)
    {
        var trip = await GetOwnedTrip(tripId, driverId, ct);

        if (trip.Status != TripStatus.Published && trip.Status != TripStatus.Confirmed && trip.Status != TripStatus.Full)
            throw new InvalidOperationException($"Impossible de démarrer un trajet en statut {trip.Status}");

        trip.Status = TripStatus.InProgress;
        trip.ActualStartedAt = DateTimeOffset.UtcNow;
        trip.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(trip, ct);
        _logger.LogInformation("Trajet démarré: {TripId}", tripId);
        return MapToResponse(trip);
    }

    public async Task<TrajetResponseDto> CompleteAsync(Guid tripId, Guid driverId, CancellationToken ct = default)
    {
        var trip = await GetOwnedTrip(tripId, driverId, ct);

        if (trip.Status != TripStatus.InProgress)
            throw new InvalidOperationException($"Impossible de terminer un trajet en statut {trip.Status}");

        trip.Status = TripStatus.Completed;
        trip.ActualCompletedAt = DateTimeOffset.UtcNow;
        trip.UpdatedAt = DateTimeOffset.UtcNow;

        // Calcul CO2 estimé : 0.12 kg/km × distance × (passagers - 1 car 1 conducteur)
        if (trip.CurrentPassengers > 0)
            trip.Co2SavedKg = trip.EstimatedDistanceKm * 0.12m * trip.CurrentPassengers;

        await _repo.UpdateAsync(trip, ct);
        _logger.LogInformation("Trajet terminé: {TripId}, CO2 sauvé: {Co2}kg", tripId, trip.Co2SavedKg);
        // GoTask triggers — GT-002 : premier trajet terminé
        _ = Task.Run(() => _goTasks.TryCompleteAsync(driverId, "GT-002", ct), ct);
        return MapToResponse(trip);
    }

    public async Task CancelAsync(Guid tripId, Guid driverId, string? reason, CancellationToken ct = default)
    {
        var trip = await GetOwnedTrip(tripId, driverId, ct);

        if (trip.Status == TripStatus.Completed || trip.Status == TripStatus.Cancelled)
            throw new InvalidOperationException($"Impossible d'annuler un trajet en statut {trip.Status}");

        trip.Status = TripStatus.Cancelled;
        trip.DriverNote = reason ?? trip.DriverNote;
        trip.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(trip, ct);
        _logger.LogInformation("Trajet annulé: {TripId}, raison: {Reason}", tripId, reason);
    }

    // ── Helpers privés ───────────────────────────────────────────────────────

    private async Task<Domain.Entities.Trip> GetOwnedTrip(Guid tripId, Guid driverId, CancellationToken ct)
    {
        var trip = await _repo.GetByIdAsync(tripId, ct)
            ?? throw new KeyNotFoundException("Trajet introuvable");
        if (trip.DriverId != driverId)
            throw new UnauthorizedAccessException("Vous n'êtes pas le conducteur de ce trajet");
        return trip;
    }

    private static Domain.Entities.Trip BuildTrip(Guid driverId, CreateTrajetDto dto, TripStatus status)
    {
        return new Domain.Entities.Trip
        {
            Id = Guid.NewGuid(),
            DriverId = driverId,
            VehicleId = dto.VehicleId,
            DepartureLabel = dto.DepartureLabel,
            DepartureAddress = dto.DepartureAddress,
            DeparturePoint = _gf.CreatePoint(new Coordinate(dto.DepartureLng, dto.DepartureLat)),
            ArrivalLabel = dto.ArrivalLabel,
            ArrivalAddress = dto.ArrivalAddress,
            ArrivalPoint = _gf.CreatePoint(new Coordinate(dto.ArrivalLng, dto.ArrivalLat)),
            DepartureDate = dto.DepartureDate,
            DepartureTime = dto.DepartureTime,
            MaxPassengers = dto.MaxPassengers,
            PricePerPassenger = dto.PricePerPassenger,
            PassengerPrice = dto.PricePerPassenger,
            PaymentMethod = Enum.TryParse<Domain.Enums.PaymentMethod>(dto.PaymentMethod, true, out var pm) ? pm : Domain.Enums.PaymentMethod.Cash,
            Status = status,
            TripType = Enum.TryParse<TripType>(dto.TripType, true, out var tt) ? tt : TripType.Unique,
            RecurrenceDays = dto.RecurrenceDays,
            RecurrenceEndDate = dto.RecurrenceEndDate,
            BaggageAllowed = dto.BaggageAllowed,
            PetsAllowed = dto.PetsAllowed,
            SmokingAllowed = dto.SmokingAllowed,
            MusicAllowed = dto.MusicAllowed,
            ConversationLevel = Enum.TryParse<ConversationLevel>(dto.ConversationLevel, true, out var cl) ? cl : ConversationLevel.Moderate,
            DriverNote = dto.DriverNote,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    private static TrajetResponseDto MapToResponse(Domain.Entities.Trip t)
    {
        return new TrajetResponseDto
        {
            Id = t.Id,
            DriverId = t.DriverId,
            VehicleId = t.VehicleId,
            DepartureLabel = t.DepartureLabel,
            DepartureAddress = t.DepartureAddress,
            DepartureLat = t.DeparturePoint.Y,
            DepartureLng = t.DeparturePoint.X,
            ArrivalLabel = t.ArrivalLabel,
            ArrivalAddress = t.ArrivalAddress,
            ArrivalLat = t.ArrivalPoint.Y,
            ArrivalLng = t.ArrivalPoint.X,
            Polyline = t.Polyline,
            DepartureDate = t.DepartureDate,
            DepartureTime = t.DepartureTime,
            EstimatedArrivalTime = t.EstimatedArrivalTime,
            EstimatedDurationMinutes = t.EstimatedDurationMinutes,
            EstimatedDistanceKm = t.EstimatedDistanceKm,
            MaxPassengers = t.MaxPassengers,
            CurrentPassengers = t.CurrentPassengers,
            PricePerPassenger = t.PricePerPassenger,
            PaymentMethod = t.PaymentMethod.ToString().ToLower(),
            Status = t.Status.ToString().ToLower(),
            TripType = t.TripType.ToString().ToLower(),
            RecurrenceDays = t.RecurrenceDays,
            RecurrenceEndDate = t.RecurrenceEndDate,
            BaggageAllowed = t.BaggageAllowed,
            PetsAllowed = t.PetsAllowed,
            SmokingAllowed = t.SmokingAllowed,
            MusicAllowed = t.MusicAllowed,
            ConversationLevel = t.ConversationLevel.ToString().ToLower(),
            DriverNote = t.DriverNote,
            ActualStartedAt = t.ActualStartedAt,
            ActualCompletedAt = t.ActualCompletedAt,
            Co2SavedKg = t.Co2SavedKg,
            AverageRating = t.AverageRating,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            Driver = t.Driver != null ? MapDriver(t.Driver) : null,
            Vehicle = t.Vehicle != null ? MapVehicle(t.Vehicle) : null
        };
    }

    private static TripDriverDto MapDriver(UserEntity d) => new()
    {
        Id = d.Id,
        FirstName = d.FirstName,
        LastName = d.LastName,
        AvatarUrl = d.AvatarUrl,
        AverageRating = d.DriverProfile?.AverageRating ?? 0,
        GoScore = d.GoScore,
        IsProfileVerified = d.IsProfileVerified
    };

    private static TripVehicleDto MapVehicle(VehicleEntity v) => new()
    {
        Id = v.Id,
        Make = v.Make,
        Model = v.Model,
        Year = v.Year,
        Color = v.Color,
        LicensePlate = v.LicensePlate,
        Capacity = v.Capacity,
        PhotoUrl = v.PhotoUrl
    };

    // ── Recommandations ───────────────────────────────────────────────────────

    public async Task<IEnumerable<TrajetResponseDto>> GetRecommendedAsync(Guid userId, CancellationToken ct = default)
    {
        const int count = 5;
        var recommended = new List<Domain.Entities.Trip>();

        // 1. Analyser les destinations récentes du passager (30 derniers jours)
        var recentPassenger = await _repo.GetPassengerHistoriqueAsync(userId, 1, 20, ct);
        var recentDriver   = await _repo.GetDriverHistoriqueAsync(userId, 1, 20, ct);
        var recent = recentPassenger.Concat(recentDriver).ToList();

        if (recent.Count > 0)
        {
            // Destination la plus fréquente
            var topArrival = recent
                .GroupBy(t => t.ArrivalLabel)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefault();

            if (!string.IsNullOrEmpty(topArrival))
            {
                var byDestination = await _repo.GetPublishedByArrivalLabelAsync(topArrival, count, ct);
                recommended.AddRange(byDestination);
            }
        }

        // 2. Compléter jusqu'à 5 avec des trajets aléatoires si nécessaire
        if (recommended.Count < count)
        {
            var random = await _repo.GetRandomPublishedAsync(count, ct);
            foreach (var t in random)
            {
                if (recommended.Count >= count) break;
                if (recommended.All(r => r.Id != t.Id))
                    recommended.Add(t);
            }
        }

        return recommended.Take(count).Select(MapToResponse);
    }
}
