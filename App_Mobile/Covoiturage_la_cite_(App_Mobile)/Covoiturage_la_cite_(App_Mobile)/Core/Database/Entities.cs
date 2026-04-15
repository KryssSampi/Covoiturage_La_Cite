using SQLite;

namespace Covoiturage_la_cite__App_Mobile_.Core.Database
{
    // ─── User ──────────────────────────────────────────────────────────────────

    [Table("users")]
    public class UserEntity
    {
        [PrimaryKey, AutoIncrement]
        public int LocalId { get; set; }

        [Indexed, NotNull]
        public string ServerId { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string? AvatarUrl { get; set; }
        public string Role { get; set; } = "Passenger"; // "Driver" | "Passenger"
        public bool CanBeDriver { get; set; }
        public bool ProfileVerified { get; set; }
        public int GoScore { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // ─── Trip ──────────────────────────────────────────────────────────────────

    [Table("trips")]
    public class TripEntity
    {
        [PrimaryKey, AutoIncrement]
        public int LocalId { get; set; }

        [Indexed, NotNull]
        public string ServerId { get; set; } = "";
        public string DriverId { get; set; } = "";
        public string DriverName { get; set; } = "";
        public string? DriverAvatarUrl { get; set; }
        public string DepartureCity { get; set; } = "";
        public string ArrivalCity { get; set; } = "";
        public string DepartureLat { get; set; } = "";
        public string DepartureLng { get; set; } = "";
        public string ArrivalLat { get; set; } = "";
        public string ArrivalLng { get; set; } = "";
        public DateTime DepartureTime { get; set; }
        public decimal PricePerSeat { get; set; }
        public int AvailableSeats { get; set; }
        public int TotalSeats { get; set; }
        public string Status { get; set; } = "Published"; // Published|Draft|InProgress|Completed|Cancelled
        public bool IsFavorite { get; set; }
        public string? VehicleModel { get; set; }
        public string? VehicleColor { get; set; }
        public int DriverRating { get; set; }
        public int DriverRatingCount { get; set; }
        public DateTime CachedAt { get; set; } = DateTime.UtcNow;
    }

    // ─── Reservation ───────────────────────────────────────────────────────────

    [Table("reservations")]
    public class ReservationEntity
    {
        [PrimaryKey, AutoIncrement]
        public int LocalId { get; set; }

        [Indexed, NotNull]
        public string ServerId { get; set; } = "";
        public string TripServerId { get; set; } = "";
        public string PassengerId { get; set; } = "";
        public string PassengerName { get; set; } = "";
        public string? PassengerAvatarUrl { get; set; }
        public int SeatsReserved { get; set; }
        public string Status { get; set; } = "Pending"; // Pending|Accepted|Rejected|Cancelled|Completed
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // ─── Conversation ──────────────────────────────────────────────────────────

    [Table("conversations")]
    public class ConversationEntity
    {
        [PrimaryKey, AutoIncrement]
        public int LocalId { get; set; }

        [Indexed, NotNull]
        public string ServerId { get; set; } = "";
        public string OtherUserId { get; set; } = "";
        public string OtherUserName { get; set; } = "";
        public string? OtherUserAvatarUrl { get; set; }
        public string? TripServerId { get; set; }
        public string? LastMessageText { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
        public DateTime CachedAt { get; set; } = DateTime.UtcNow;
    }

    // ─── Message ───────────────────────────────────────────────────────────────

    [Table("messages")]
    public class MessageEntity
    {
        [PrimaryKey, AutoIncrement]
        public int LocalId { get; set; }

        [Indexed, NotNull]
        public string ServerId { get; set; } = "";

        [Indexed]
        public string ConversationServerId { get; set; } = "";
        public string SenderId { get; set; } = "";
        public string Text { get; set; } = "";
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
        public bool IsMine { get; set; }
    }
}
