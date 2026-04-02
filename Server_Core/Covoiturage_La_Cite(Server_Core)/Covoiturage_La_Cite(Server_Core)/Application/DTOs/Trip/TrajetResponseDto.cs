using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Trip;

/// <summary>
/// DTO réponse complète pour un trajet.
/// </summary>
public record TrajetResponseDto
{
    public Guid Id { get; init; }
    public Guid DriverId { get; init; }
    public Guid VehicleId { get; init; }

    // Départ
    public string DepartureLabel { get; init; } = string.Empty;
    public string DepartureAddress { get; init; } = string.Empty;
    public double DepartureLat { get; init; }
    public double DepartureLng { get; init; }

    // Arrivée
    public string ArrivalLabel { get; init; } = string.Empty;
    public string ArrivalAddress { get; init; } = string.Empty;
    public double ArrivalLat { get; init; }
    public double ArrivalLng { get; init; }

    public string? Polyline { get; init; }
    public DateOnly DepartureDate { get; init; }
    public TimeOnly DepartureTime { get; init; }
    public TimeOnly? EstimatedArrivalTime { get; init; }
    public int EstimatedDurationMinutes { get; init; }
    public decimal EstimatedDistanceKm { get; init; }

    public int MaxPassengers { get; init; }
    public int CurrentPassengers { get; init; }
    public decimal PricePerPassenger { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;
    public string TripType { get; init; } = string.Empty;
    public int[]? RecurrenceDays { get; init; }
    public DateOnly? RecurrenceEndDate { get; init; }

    // Préférences
    public bool BaggageAllowed { get; init; }
    public bool PetsAllowed { get; init; }
    public bool SmokingAllowed { get; init; }
    public bool MusicAllowed { get; init; }
    public string ConversationLevel { get; init; } = string.Empty;
    public string? DriverNote { get; init; }

    // Temps réel
    public DateTimeOffset? ActualStartedAt { get; init; }
    public DateTimeOffset? ActualCompletedAt { get; init; }
    public decimal? Co2SavedKg { get; init; }
    public decimal? AverageRating { get; init; }

    // Metadata
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }

    // Conducteur enrichi
    public TripDriverDto? Driver { get; init; }
    public TripVehicleDto? Vehicle { get; init; }
}

public record TripDriverDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public decimal AverageRating { get; init; }
    public int GoScore { get; init; }
    public bool IsProfileVerified { get; init; }
}

public record TripVehicleDto
{
    public Guid Id { get; init; }
    public string Make { get; init; } = string.Empty;
    public string Model { get; init; } = string.Empty;
    public int Year { get; init; }
    public string Color { get; init; } = string.Empty;
    public string LicensePlate { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public string? PhotoUrl { get; init; }
}

/// <summary>
/// DTO pour les passagers confirmés d'un trajet.
/// </summary>
public record TrajetPassengerDto
{
    public Guid UserId { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public Guid ReservationId { get; init; }
    public string ReservationStatus { get; init; } = string.Empty;
    public bool? BoardingConfirmedByPassenger { get; init; }
}

/// <summary>
/// DTO pour le trajet en cours (données temps réel).
/// </summary>
public record TrajetEnCoursDto
{
    public Guid Id { get; init; }
    public string Status { get; init; } = string.Empty;
    public TripDriverDto Driver { get; init; } = null!;
    public TripVehicleDto Vehicle { get; init; } = null!;

    public string DepartureLabel { get; init; } = string.Empty;
    public string ArrivalLabel { get; init; } = string.Empty;
    public double DepartureLat { get; init; }
    public double DepartureLng { get; init; }
    public double ArrivalLat { get; init; }
    public double ArrivalLng { get; init; }
    public string? Polyline { get; init; }

    public DateOnly DepartureDate { get; init; }
    public TimeOnly DepartureTime { get; init; }
    public TimeOnly? EstimatedArrivalTime { get; init; }
    public DateTimeOffset? ActualStartedAt { get; init; }

    public IEnumerable<TrajetPassengerDto> Passengers { get; init; } = Enumerable.Empty<TrajetPassengerDto>();

    // Position GPS en temps réel du conducteur
    public double? CurrentLat { get; init; }
    public double? CurrentLng { get; init; }
    public DateTimeOffset? LastGpsUpdate { get; init; }
}
