namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class PlatformStats
{
    public Guid Id { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsersLast30Days { get; set; }
    public int TotalTrips { get; set; }
    public int TripsToday { get; set; }
    public int TripsThisMonth { get; set; }
    public decimal TotalCo2SavedKg { get; set; }
    public decimal TotalRevenuePlatform { get; set; }
    public int PendingReports { get; set; }
    public int PendingDriverApplications { get; set; }
    public DateTimeOffset ComputedAt { get; set; }
}
