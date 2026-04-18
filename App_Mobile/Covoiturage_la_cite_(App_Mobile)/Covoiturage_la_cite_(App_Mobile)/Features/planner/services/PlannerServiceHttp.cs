using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Services.Api;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.planner.Services;

public class PlannerServiceHttp : PlannerService
{
    private readonly IApiService _api;

    public PlannerServiceHttp(IApiService api)
    {
        _api = api;
    }

    // API HTTP planner (en complément des méthodes métier héritées de PlannerService)
    public async Task<IReadOnlyList<PlannerRideItem>> GetTripsAsync(UserRole role, CancellationToken ct = default)
    {
        var envelope = await _api.GetAsync<ApiEnvelope<IEnumerable<TripApiDto>>>("api/trips", ct);
        var trips = envelope?.Data ?? Enumerable.Empty<TripApiDto>();

        return trips.Select(t => role == UserRole.Driver
            ? (PlannerRideItem)MapDriverRide(t)
            : MapPassengerRide(t)).ToList();
    }

    public async Task<PlannerRideItem?> CreateTripAsync(object request, UserRole role, CancellationToken ct = default)
    {
        var envelope = await _api.PostAsync<object, ApiEnvelope<TripApiDto>>("api/trips", request, ct);
        var data = envelope?.Data;
        if (data is null) return null;

        return role == UserRole.Driver
            ? MapDriverRide(data)
            : MapPassengerRide(data);
    }

    public async Task<IReadOnlyList<UnavailabilityDisplayModel>> GetIndisponibilitiesAsync(CancellationToken ct = default)
    {
        var envelope = await _api.GetAsync<ApiEnvelope<IEnumerable<IndisponibilityApiDto>>>("api/indisponibilities", ct);
        var data = envelope?.Data ?? Enumerable.Empty<IndisponibilityApiDto>();
        return data.Select(MapIndisponibility).ToList();
    }

    public async Task<UnavailabilityDisplayModel?> CreateIndisponibilityAsync(UnavailabilityDisplayModel request, CancellationToken ct = default)
    {
        var body = new
        {
            id = request.Id,
            isRecurrent = request.IsRecurrent,
            specificDate = request.SpecificDate,
            startTime = request.StartTime,
            endTime = request.EndTime,
            recurringDays = request.RecurringDays
        };

        var envelope = await _api.PostAsync<object, ApiEnvelope<IndisponibilityApiDto>>("api/indisponibilities", body, ct);
        return envelope?.Data is null ? null : MapIndisponibility(envelope.Data);
    }

    private static DriverRideItem MapDriverRide(TripApiDto trip)
    {
        var departureTime = trip.DepartureTime?.ToString(@"hh\:mm") ?? "--:--";
        var eta = trip.EstimatedArrivalTime?.ToString(@"hh\:mm");
        var tripDate = trip.DepartureDate?.ToDateTime(TimeOnly.MinValue) ?? DateTime.Today;

        var model = new DriverTripCardDisplayModel(
            TripId: trip.Id?.ToString() ?? Guid.NewGuid().ToString(),
            TimeLabel: departureTime,
            Route: new RouteDisplayModel(trip.DepartureLabel ?? "Départ", trip.ArrivalLabel ?? "Arrivée", departureTime, eta),
            PassengerLabel: $"{trip.CurrentPassengers}/{Math.Max(1, trip.MaxPassengers)} passagers",
            Price: trip.PricePerPassenger,
            Status: MapDriverCardStatus(trip.Status),
            PendingRequests: 0,
            ProgressPercent: 0,
            EtaLabel: eta);

        return new DriverRideItem(model, MapDriverStatus(trip.Status), tripDate);
    }

    private static PassengerRideItem MapPassengerRide(TripApiDto trip)
    {
        var departureTime = trip.DepartureTime?.ToString(@"hh\:mm") ?? "--:--";
        var tripDate = trip.DepartureDate?.ToDateTime(TimeOnly.MinValue) ?? DateTime.Today;
        var driverName = $"{trip.Driver?.FirstName} {trip.Driver?.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(driverName))
            driverName = "Conducteur";

        var model = new PassengerReservationCardDisplayModel(
            DriverAvatar: BuildAvatar(trip.Driver?.FirstName, trip.Driver?.LastName, trip.Driver?.AvatarUrl),
            DriverName: driverName,
            DriverRating: 0,
            DriverTripCount: 0,
            TimeLabel: departureTime,
            Route: new RouteDisplayModel(trip.DepartureLabel ?? "Départ", trip.ArrivalLabel ?? "Arrivée"),
            Price: trip.PricePerPassenger,
            Status: MapPassengerCardStatus(trip.Status),
            VehicleLabel: trip.Vehicle is null ? null : $"{trip.Vehicle.Make} {trip.Vehicle.Model}".Trim(),
            EtaLabel: trip.EstimatedArrivalTime?.ToString(@"hh\:mm"),
            CanRate: false,
            TripId: trip.Id?.ToString() ?? Guid.NewGuid().ToString());

        return new PassengerRideItem(model, MapPassengerStatus(trip.Status), tripDate);
    }

    private static UnavailabilityDisplayModel MapIndisponibility(IndisponibilityApiDto dto)
    {
        var recurringDays = dto.RecurringDays?.Select(v => (DayOfWeek)v).ToList() ?? new List<DayOfWeek>();
        var start = dto.StartTime ?? TimeSpan.Zero;
        var end = dto.EndTime ?? TimeSpan.Zero;
        var isRecurrent = dto.IsRecurrent;
        var specificDate = dto.SpecificDate?.DateTime;

        var title = dto.Title;
        if (string.IsNullOrWhiteSpace(title))
        {
            var timeLabel = $"{start:hh\\:mm} - {end:hh\\:mm}";
            title = isRecurrent
                ? $"{string.Join(", ", recurringDays)} · {timeLabel}"
                : $"{specificDate:dd/MM/yyyy} · {timeLabel}";
        }

        return new UnavailabilityDisplayModel(
            Id: dto.Id?.ToString() ?? Guid.NewGuid().ToString(),
            Title: title ?? "Indisponibilité",
            Detail: dto.Detail ?? (isRecurrent ? "Récurrent" : "Journée spécifique"),
            IsRecurrent: isRecurrent,
            SpecificDate: isRecurrent ? null : specificDate,
            StartTime: start,
            EndTime: end,
            RecurringDays: recurringDays);
    }

    private static DriverTripStatusEnum MapDriverStatus(string? status)
        => status?.ToLowerInvariant() switch
        {
            "confirmed" or "confirme" => DriverTripStatusEnum.Confirmed,
            "inprogress" or "in_progress" or "en_cours" => DriverTripStatusEnum.InProgress,
            "completed" or "termine" => DriverTripStatusEnum.Completed,
            "cancelled" or "annule" => DriverTripStatusEnum.Cancelled,
            _ => DriverTripStatusEnum.Published
        };

    private static PassengerReservationStatusEnum MapPassengerStatus(string? status)
        => status?.ToLowerInvariant() switch
        {
            "confirmed" or "confirme" => PassengerReservationStatusEnum.Confirmed,
            "inprogress" or "in_progress" or "en_cours" => PassengerReservationStatusEnum.InProgress,
            "completed" or "termine" => PassengerReservationStatusEnum.Completed,
            "cancelled" or "annule" => PassengerReservationStatusEnum.Cancelled,
            "rejected" or "refused" or "rejete" => PassengerReservationStatusEnum.Rejected,
            _ => PassengerReservationStatusEnum.Pending
        };

    private static DriverTripStatus MapDriverCardStatus(string? status)
        => status?.ToLowerInvariant() switch
        {
            "inprogress" or "in_progress" or "en_cours" => DriverTripStatus.InProgress,
            "completed" or "termine" => DriverTripStatus.Completed,
            "cancelled" or "annule" => DriverTripStatus.Cancelled,
            "withrequests" or "with_requests" => DriverTripStatus.WithRequests,
            _ => DriverTripStatus.Published
        };

    private static PassengerReservationStatus MapPassengerCardStatus(string? status)
        => status?.ToLowerInvariant() switch
        {
            "confirmed" or "confirme" => PassengerReservationStatus.Confirmed,
            "inprogress" or "in_progress" or "en_cours" => PassengerReservationStatus.InProgress,
            "completed" or "termine" => PassengerReservationStatus.Completed,
            "rejected" or "refused" or "rejete" => PassengerReservationStatus.Refused,
            _ => PassengerReservationStatus.Pending
        };

    private static AvatarDisplayModel BuildAvatar(string? firstName, string? lastName, string? avatarUrl)
    {
        var firstInitial = string.IsNullOrWhiteSpace(firstName) ? "?" : firstName.Trim()[0].ToString().ToUpperInvariant();
        var lastInitial = string.IsNullOrWhiteSpace(lastName) ? string.Empty : lastName.Trim()[0].ToString().ToUpperInvariant();
        return new AvatarDisplayModel(
            Initials: $"{firstInitial}{lastInitial}",
            BackgroundHex: "#E8F0FE",
            ForegroundHex: "#1A56CC",
            ImageUrl: avatarUrl);
    }

    private sealed record ApiEnvelope<T>(bool Success, T? Data, string? Message, string[]? Errors);

    private sealed record TripApiDto(
        Guid? Id,
        string? DepartureLabel,
        string? ArrivalLabel,
        DateOnly? DepartureDate,
        TimeOnly? DepartureTime,
        TimeOnly? EstimatedArrivalTime,
        int MaxPassengers,
        int CurrentPassengers,
        decimal PricePerPassenger,
        string? Status,
        TripDriverApiDto? Driver,
        TripVehicleApiDto? Vehicle);

    private sealed record TripDriverApiDto(
        string? FirstName,
        string? LastName,
        string? AvatarUrl);

    private sealed record TripVehicleApiDto(
        string? Make,
        string? Model);

    private sealed record IndisponibilityApiDto(
        Guid? Id,
        string? Title,
        string? Detail,
        bool IsRecurrent,
        DateTimeOffset? SpecificDate,
        TimeSpan? StartTime,
        TimeSpan? EndTime,
        IEnumerable<int>? RecurringDays);
}
