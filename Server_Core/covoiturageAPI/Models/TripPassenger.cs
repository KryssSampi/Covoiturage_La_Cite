namespace covoiturageAPI.Models
{
    public class TripPassenger
    {
        public int Id { get; set; }
        public int TripId { get; set; }
        public Trip Trip { get; set; }
        public string PassengerId { get; set; }
        public User Passenger { get; set; }
        public string Status { get; set; } // Accepted, Pending, Cancelled
    }
}