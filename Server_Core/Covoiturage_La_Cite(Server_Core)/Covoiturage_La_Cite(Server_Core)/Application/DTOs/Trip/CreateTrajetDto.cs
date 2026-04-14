using System.ComponentModel.DataAnnotations;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Trip;

/// <summary>
/// DTO pour la création d'un trajet (POST /api/trips).
/// </summary>
public record CreateTrajetDto
{
    [Required]
    public Guid VehicleId { get; init; }

    // Départ
    [Required, MaxLength(200)]
    public string DepartureLabel { get; init; } = string.Empty;
    [Required, MaxLength(500)]
    public string DepartureAddress { get; init; } = string.Empty;
    [Required]
    public double DepartureLat { get; init; }
    [Required]
    public double DepartureLng { get; init; }

    // Arrivée
    [Required, MaxLength(200)]
    public string ArrivalLabel { get; init; } = string.Empty;
    [Required, MaxLength(500)]
    public string ArrivalAddress { get; init; } = string.Empty;
    [Required]
    public double ArrivalLat { get; init; }
    [Required]
    public double ArrivalLng { get; init; }

    // Horaire
    [Required]
    public DateOnly DepartureDate { get; init; }
    [Required]
    public TimeOnly DepartureTime { get; init; }

    // Capacité et prix
    [Range(1, 8)]
    public int MaxPassengers { get; init; } = 3;
    [Range(0, 100)]
    public decimal PricePerPassenger { get; init; }
    public string PaymentMethod { get; init; } = "cash";

    // Récurrence
    public string TripType { get; init; } = "unique";
    public int[]? RecurrenceDays { get; init; }
    public DateOnly? RecurrenceEndDate { get; init; }

    // Données géo calculées (ORS)
    public int EstimatedDurationMinutes { get; init; }
    public decimal EstimatedDistanceKm { get; init; }
    public string? Polyline { get; init; }

    // Préférences
    public bool BaggageAllowed { get; init; } = true;
    public bool PetsAllowed { get; init; }
    public bool SmokingAllowed { get; init; }
    public bool MusicAllowed { get; init; } = true;
    public string ConversationLevel { get; init; } = "moderate";
    public string? DriverNote { get; init; }
}

/// <summary>
/// DTO pour la mise à jour d'un trajet (PUT /api/trips/{id}).
/// </summary>
public record UpdateTrajetDto
{
    public Guid? VehicleId { get; init; }
    public string? DepartureLabel { get; init; }
    public string? DepartureAddress { get; init; }
    public double? DepartureLat { get; init; }
    public double? DepartureLng { get; init; }
    public string? ArrivalLabel { get; init; }
    public string? ArrivalAddress { get; init; }
    public double? ArrivalLat { get; init; }
    public double? ArrivalLng { get; init; }
    public DateOnly? DepartureDate { get; init; }
    public TimeOnly? DepartureTime { get; init; }
    public int? MaxPassengers { get; init; }
    public decimal? PricePerPassenger { get; init; }
    public string? PaymentMethod { get; init; }
    public bool? BaggageAllowed { get; init; }
    public bool? PetsAllowed { get; init; }
    public bool? SmokingAllowed { get; init; }
    public bool? MusicAllowed { get; init; }
    public string? ConversationLevel { get; init; }
    public string? DriverNote { get; init; }
}

/// <summary>
/// DTO pour la recherche de trajets (GET /api/trips/search).
/// </summary>
public record TrajetSearchDto
{
    public double? DepartureLat { get; init; }
    public double? DepartureLng { get; init; }
    public double? ArrivalLat { get; init; }
    public double? ArrivalLng { get; init; }
    public double RadiusKm { get; init; } = 5.0;
    public DateOnly? Date { get; init; }
    public TimeOnly? TimeMin { get; init; }
    public TimeOnly? TimeMax { get; init; }
    public int? MaxPassengers { get; init; }
    public string? PaymentMethod { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

/// <summary>
/// DTO pour l'annulation d'un trajet.
/// </summary>
public record CancelTripRequest
{
    public string? Reason { get; init; }
}
