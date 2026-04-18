using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Services.Api;

namespace Covoiturage_la_cite__App_Mobile_.Features.search.Services;

public class SearchServiceHttp : ISearchService
{
    private readonly IApiService _api;

    public SearchServiceHttp(IApiService api)
    {
        _api = api;
    }

    public async Task<IReadOnlyList<SearchResultItem>> SearchAsync(string from, string to, UserRole role, CancellationToken ct = default)
    {
        var query = $"api/trips/search?from={Uri.EscapeDataString(from)}&to={Uri.EscapeDataString(to)}&page=1&pageSize=20";
        var envelope = await _api.GetAsync<ApiEnvelope<PaginatedResultApi<TripApiDto>>>(query, ct);
        var items = envelope?.Data?.Items?.ToList() ?? new List<TripApiDto>();

        return role == UserRole.Driver
            ? items.Select(MapToCircuit).Cast<SearchResultItem>().ToList()
            : items.Select(MapToDriverTrip).Cast<SearchResultItem>().ToList();
    }

    private static MapCircuitResultItem MapToCircuit(TripApiDto trip)
    {
        var routeLabel = $"{trip.DepartureLabel ?? "Départ"} → {trip.ArrivalLabel ?? "Arrivée"}";
        return new MapCircuitResultItem(new MapCircuitCardDisplayModel(
            CircuitId: trip.Id?.ToString() ?? Guid.NewGuid().ToString(),
            MapImageSource: string.Empty,
            Label: routeLabel,
            LabelColorHex: "#1A56CC",
            FromAddress: trip.DepartureAddress ?? trip.DepartureLabel ?? "Départ",
            ToAddress: trip.ArrivalAddress ?? trip.ArrivalLabel ?? "Arrivée",
            Via: trip.EstimatedDistanceKm > 0 ? $"via trajet estimé ({trip.EstimatedDistanceKm:0.#} km)" : "via trajet calculé",
            DurationMinutes: trip.EstimatedDurationMinutes,
            DistanceKm: (double)trip.EstimatedDistanceKm,
            CtaLabel: "Choisir ce circuit"));
    }

    private static DriverTripResultItem MapToDriverTrip(TripApiDto trip)
    {
        var departureTime = trip.DepartureTime?.ToString(@"hh\:mm") ?? "--:--";
        var arrivalTime = trip.EstimatedArrivalTime?.ToString(@"hh\:mm");
        var maxPassengers = Math.Max(1, trip.MaxPassengers);
        var passengerLabel = $"{trip.CurrentPassengers}/{maxPassengers} passagers";
        var status = MapDriverTripStatus(trip.Status);

        var card = new DriverTripCardDisplayModel(
            TripId: trip.Id?.ToString() ?? Guid.NewGuid().ToString(),
            TimeLabel: departureTime,
            Route: new RouteDisplayModel(
                FromLabel: trip.DepartureLabel ?? "Départ",
                ToLabel: trip.ArrivalLabel ?? "Arrivée",
                DepartureTime: departureTime,
                ArrivalTime: arrivalTime),
            PassengerLabel: passengerLabel,
            Price: trip.PricePerPassenger,
            Status: status,
            PendingRequests: 0,
            ProgressPercent: 0,
            EtaLabel: null,
            LastPassengerAvatar: trip.Driver is null ? null : BuildAvatar(trip.Driver.FirstName, trip.Driver.LastName, trip.Driver.AvatarUrl),
            LastPassengerName: trip.Driver is null ? null : $"{trip.Driver.FirstName} {trip.Driver.LastName}".Trim());

        return new DriverTripResultItem(card);
    }

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

    private static DriverTripStatus MapDriverTripStatus(string? status)
        => status?.ToLowerInvariant() switch
        {
            "inprogress" or "in_progress" or "en_cours" => DriverTripStatus.InProgress,
            "completed" or "termine" => DriverTripStatus.Completed,
            "cancelled" or "canceled" or "annule" => DriverTripStatus.Cancelled,
            "withrequests" or "with_requests" => DriverTripStatus.WithRequests,
            _ => DriverTripStatus.Published
        };

    private sealed record ApiEnvelope<T>(bool Success, T? Data, string? Message, string[]? Errors);

    private sealed record PaginatedResultApi<T>(
        IEnumerable<T>? Items,
        int TotalCount,
        int Page,
        int PageSize);

    private sealed record TripApiDto(
        Guid? Id,
        string? DepartureLabel,
        string? DepartureAddress,
        string? ArrivalLabel,
        string? ArrivalAddress,
        DateOnly? DepartureDate,
        TimeOnly? DepartureTime,
        TimeOnly? EstimatedArrivalTime,
        int EstimatedDurationMinutes,
        decimal EstimatedDistanceKm,
        int MaxPassengers,
        int CurrentPassengers,
        decimal PricePerPassenger,
        string? Status,
        TripDriverApiDto? Driver);

    private sealed record TripDriverApiDto(
        Guid? Id,
        string? FirstName,
        string? LastName,
        string? AvatarUrl);
}
