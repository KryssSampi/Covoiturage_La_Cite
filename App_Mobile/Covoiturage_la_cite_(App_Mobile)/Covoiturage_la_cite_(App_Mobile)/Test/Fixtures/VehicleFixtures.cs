// ============================================================
//  Test/Fixtures/VehicleFixtures.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;

namespace Covoiturage_la_cite__App_Mobile_.Test.Fixtures
{
    public static class VehicleFixtures
    {
        private static readonly IReadOnlyList<VehicleModel> _all = new List<VehicleModel>
        {
            new() { Id = "veh-001", DriverId = "drv-01", Make = "Honda", Model = "Civic",  Year = 2020, Color = "Grise",  MaxSeats = 5, IsActive = true, IsValidated = true },
            new() { Id = "veh-002", DriverId = "drv-01", Make = "Toyota", Model = "Corolla", Year = 2019, Color = "Blanche", MaxSeats = 5, IsActive = true, IsValidated = true },
            new() { Id = "veh-003", DriverId = "drv-02", Make = "Kia",    Model = "Soul",   Year = 2021, Color = "Rouge",  MaxSeats = 5, IsActive = true, IsValidated = true },
        };

        public static IReadOnlyList<VehicleModel> All => _all;

        public static IReadOnlyList<VehicleModel> ForDriver(string driverId) =>
            _all.Where(v => v.DriverId == driverId).ToList();
    }
}
