using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;

namespace Covoiturage_la_cite__App_Mobile_.Test.Fixtures
{
    public static class UserFixtures
    {
        public static UserModel CreateUserModel()
        {
            return new UserModel(
                Id: "USR-2026-00001",
                Email: "sophie.pelletier@collegelacite.ca",
                FirstName: "Sophie",
                LastName: "Pelletier",
                Initials: "SP",
                AvatarUrl: "",
                Phone: "",
                Role: UserRole.Passenger,
                CanBeDriver: true,
                ProfileVerified: true,
                IsActive: true,
                DriverProfile: null,
                PassengerProfile: new PassengerProfile(
                    AverageRating: 4.7,
                    TotalTripsAsPassenger: 18,
                    Co2SavedKg: 32.4,
                    PunctualityScore: 92,
                    NoShowCount: 0
                ),
                Preferences: new UserPreferences(
                    MusicAccepted: true,
                    PetsAccepted: false,
                    SmokingAccepted: false,
                    ConversationLevel: ConversationLevel.Moderate
                ),
                GoScore: 412,
                BadgeIds: new[] { "student", "confirmed", "eco-starter" },
                PreferencesId: null,
                CurrentLocation: null,
                CreatedAt: new DateTime(2026, 1, 12),
                UpdatedAt: new DateTime(2026, 3, 20)
            );
        }

        public static UserViewModel CreateUserViewModel()
        {
            var vm = new UserViewModel();
            vm.Load(CreateUserModel());
            return vm;
        }
    }
}
