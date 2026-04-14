using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid ReservationId { get; set; }
    public Guid ReviewerId { get; set; }
    public Guid RevieweeId { get; set; }
    public UserRole RevieweeRole { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string[] Tags { get; set; } = [];
    public bool IsPublished { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Trip Trip { get; set; } = null!;
    public Reservation Reservation { get; set; } = null!;
    public User Reviewer { get; set; } = null!;
    public User Reviewee { get; set; } = null!;
}
