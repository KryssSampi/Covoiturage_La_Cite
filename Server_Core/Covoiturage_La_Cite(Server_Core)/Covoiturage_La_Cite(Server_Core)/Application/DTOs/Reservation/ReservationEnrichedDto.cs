namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Reservation;

/// <summary>
/// Reservation enrichie avec trajet + participants.
/// </summary>
public record ReservationEnrichedDto
{
    public ReservationResponseDto Reservation { get; init; } = null!;
    public TripSummaryDto Trip { get; init; } = null!;
    public DriverSummaryDto Driver { get; init; } = null!;
    public PassengerSummaryDto Passenger { get; init; } = null!;
}

public record TripSummaryDto
{
    public Guid Id { get; init; }
    public string DepartureLabel { get; init; } = string.Empty;
    public string ArrivalLabel { get; init; } = string.Empty;
    public DateOnly DepartureDate { get; init; }
    public TimeOnly DepartureTime { get; init; }
    public int EstimatedDurationMinutes { get; init; }
    public int MaxPassengers { get; init; }
    public int CurrentPassengers { get; init; }
    public decimal PricePerPassenger { get; init; }
    public string Status { get; init; } = string.Empty;
}

public record DriverSummaryDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public decimal AverageRating { get; init; }
    public int TotalTripsAsDriver { get; init; }
}

public record PassengerSummaryDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public decimal AverageRating { get; init; }
    public int TotalTripsAsPassenger { get; init; }
}
