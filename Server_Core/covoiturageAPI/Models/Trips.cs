namespace covoiturageAPI.Models
{
    public class Trip
    {
        
            public int Id { get; set; }

            public string DriverId { get; set; } = "";
            public User Driver { get; set; }

            public string Departure { get; set; } = "";
            public string Destination { get; set; } = "";

            public DateTime Date { get; set; }

            public int AvailableSeats { get; set; }

            public string Status { get; set; } = "OPEN"; // OPEN, COMPLETED

            public List<TripPassenger> Passengers { get; set; } = new();
        
    }
}
