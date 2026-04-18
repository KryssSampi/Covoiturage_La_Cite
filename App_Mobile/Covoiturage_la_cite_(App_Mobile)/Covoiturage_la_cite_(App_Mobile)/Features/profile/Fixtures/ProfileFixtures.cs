namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Fixtures;

using Covoiturage_la_cite__App_Mobile_.Features.profile.Services;
using System;
using System.Collections.Generic;

public static class ProfileFixtures
{
    public static MeDto GetMe() => new(
        "me-001", "me@lacitec.on.ca", "Sophie", "Pelletier",
        "613-555-0101", null, "Passionnée de covoiturage et de durabilité.",
        null, "etudiant", "passenger", new List<string> { "FR", "EN" });

    public static UserPublicDto GetPublicUser(string userId) => new(
        userId, "Ahmed", "Ibrahim", null, null,
        "Conducteur expérimenté, ponctuel et agréable.", true, true,
        "etudiant", "driver", 850, new List<string> { "FR", "EN" },
        DateTime.Now.AddYears(-2).ToString("O"),
        23, false, false, false,
        new DriverProfileDto("approuve", 4.8, 134, 612, null, "Honda", "Civic", 2018, "Bleu"),
        new List<ReviewDto>
        {
            new("r1", "Marie L.", "u2", null, 5.0, "Conducteur exceptionnel!", DateTime.Now.AddDays(-5).ToString("O")),
            new("r2", "Pierre D.", "u3", null, 4.5, "Super trajet.", DateTime.Now.AddDays(-12).ToString("O"))
        },
        new List<PublicTripDto>
        {
            new("t1", "Campus La Cité", "Orléans", DateTime.Now.AddDays(1).ToString("yyyy-MM-dd"), "08:00", 2, 8.0),
            new("t2", "Orléans", "Campus La Cité", DateTime.Now.AddDays(2).ToString("yyyy-MM-dd"), "17:30", 3, 7.0)
        },
        new List<UsualTripDto> { new("Campus La Cité", "Gatineau"), new("Gatineau", "Campus La Cité") },
        new List<BadgeDto>
        {
            new("b1", "Conducteur Expert", "Expert Driver", "car", "#E8F0FE", "#1A56CC"),
            new("b2", "Ponctuel", "Punctual", "clock", "#E1F5EE", "#0F6E56")
        });

    public static IEnumerable<VehicleDto> GetVehicles() => new List<VehicleDto>
    {
        new("v1", "Honda", "Civic", 2018, "Bleu", "ABC-1234", 4, null, true, true, false)
    };

    public static PreferencesDto GetPreferences() => new(
        true, false, false, "moderate",
        true, true, false, true, true, false,
        false, true, false,
        true, true, true, true,
        2000, 2000, 30, null, false, 0, 3.0, 0, false);
}
