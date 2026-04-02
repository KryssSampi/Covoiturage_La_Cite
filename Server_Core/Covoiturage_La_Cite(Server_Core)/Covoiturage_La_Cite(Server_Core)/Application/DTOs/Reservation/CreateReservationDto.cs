namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Reservation;

/// <summary>
/// DTO de creation d'une reservation.
/// </summary>
public record CreateReservationDto
{
    public Guid TripId { get; init; }
    public string? PassengerMessage { get; init; }
    public int? CompatibilityScore { get; init; }
}
