using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Trip
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }

    public string DepartureLabel { get; set; } = string.Empty;
    public string DepartureAddress { get; set; } = string.Empty;
    public Point DeparturePoint { get; set; } = null!;
    public string ArrivalLabel { get; set; } = string.Empty;
    public string ArrivalAddress { get; set; } = string.Empty;
    public Point ArrivalPoint { get; set; } = null!;
    public string? Polyline { get; set; }

    public DateOnly DepartureDate { get; set; }
    public TimeOnly DepartureTime { get; set; }
    public TimeOnly? EstimatedArrivalTime { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public decimal EstimatedDistanceKm { get; set; }

    public int MaxPassengers { get; set; }
    public int CurrentPassengers { get; set; }
    public decimal PricePerPassenger { get; set; }
    public decimal PassengerPrice { get; set; }
    public PaymentMethod PaymentMethod { get; set; }

    public TripStatus Status { get; set; }
    public TripType TripType { get; set; }
    public int[]? RecurrenceDays { get; set; }
    public DateOnly? RecurrenceEndDate { get; set; }
    public Guid? ParentTripId { get; set; }

    public bool BaggageAllowed { get; set; }
    public bool PetsAllowed { get; set; }
    public bool SmokingAllowed { get; set; }
    public bool MusicAllowed { get; set; }
    public ConversationLevel ConversationLevel { get; set; }
    public string? DriverNote { get; set; }

    public DateTimeOffset? ActualStartedAt { get; set; }
    public DateTimeOffset? ActualCompletedAt { get; set; }
    public decimal? Co2SavedKg { get; set; }
    public decimal? AverageRating { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public User Driver { get; set; } = null!;
    public Vehicle Vehicle { get; set; } = null!;
    public Trip? ParentTrip { get; set; }
    public ICollection<Trip> RecurringInstances { get; set; } = new List<Trip>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<GpsPosition> GpsPositions { get; set; } = new List<GpsPosition>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<WaypointTrip> Waypoints { get; set; } = new List<WaypointTrip>();
}
