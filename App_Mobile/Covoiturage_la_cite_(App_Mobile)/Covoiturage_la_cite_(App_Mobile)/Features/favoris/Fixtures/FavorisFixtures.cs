// ============================================================
//  Features/favoris/Fixtures/FavorisFixtures.cs
//  Données de test pour la page des favoris.
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.favoris.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.favoris.Fixtures
{
    public static class FavorisFixtures
    {
        public static IReadOnlyList<FavoriteCardDisplayModel> All() =>
            Places().Concat(Persons()).Concat(Alerts()).ToList();

        // ── Lieux ─────────────────────────────────────────────────────
        public static IReadOnlyList<FavoriteCardDisplayModel> Places() =>
        [
            new(
                Id: "p1", Type: FavoriteType.Place,
                Name: "Maison", Emoji: "🏠", SubLabel: "Départ fréquent",
                PlaceAddress: "142 rue des Érables, Laval",
                PlaceEstimatedTime: "8 min",
                PersonInitial: "", PersonRoleLabel: "", PersonLastTripStr: "", PersonIsDriver: false,
                AlertOrigin: "", AlertDestination: "", AlertIsActive: false, AlertFrequency: ""),

            new(
                Id: "p2", Type: FavoriteType.Place,
                Name: "Cégep de la Cité", Emoji: "🏫", SubLabel: "Destination principale",
                PlaceAddress: "801 avenue Mendès France, Québec",
                PlaceEstimatedTime: "22 min",
                PersonInitial: "", PersonRoleLabel: "", PersonLastTripStr: "", PersonIsDriver: false,
                AlertOrigin: "", AlertDestination: "", AlertIsActive: false, AlertFrequency: ""),

            new(
                Id: "p3", Type: FavoriteType.Place,
                Name: "Centre commercial", Emoji: "🛍️", SubLabel: "Lieu récurrent",
                PlaceAddress: "Place Laurier, Québec",
                PlaceEstimatedTime: "15 min",
                PersonInitial: "", PersonRoleLabel: "", PersonLastTripStr: "", PersonIsDriver: false,
                AlertOrigin: "", AlertDestination: "", AlertIsActive: false, AlertFrequency: ""),
        ];

        // ── Personnes ─────────────────────────────────────────────────
        public static IReadOnlyList<FavoriteCardDisplayModel> Persons() =>
        [
            new(
                Id: "u1", Type: FavoriteType.Person,
                Name: "Marie Tremblay", Emoji: "👤", SubLabel: "Conductrice habituelle",
                PlaceAddress: null, PlaceEstimatedTime: null,
                PersonInitial: "MT", PersonRoleLabel: "Conductrice",
                PersonLastTripStr: "il y a 2 jours", PersonIsDriver: true,
                AlertOrigin: "", AlertDestination: "", AlertIsActive: false, AlertFrequency: ""),

            new(
                Id: "u2", Type: FavoriteType.Person,
                Name: "Jean Coutu", Emoji: "👤", SubLabel: "Passager régulier",
                PlaceAddress: null, PlaceEstimatedTime: null,
                PersonInitial: "JC", PersonRoleLabel: "Passager",
                PersonLastTripStr: "il y a 5 jours", PersonIsDriver: false,
                AlertOrigin: "", AlertDestination: "", AlertIsActive: false, AlertFrequency: ""),

            new(
                Id: "u3", Type: FavoriteType.Person,
                Name: "Sophie Leblanc", Emoji: "👤", SubLabel: "Conductrice occasionnelle",
                PlaceAddress: null, PlaceEstimatedTime: null,
                PersonInitial: "SL", PersonRoleLabel: "Conductrice",
                PersonLastTripStr: "il y a 2 semaines", PersonIsDriver: true,
                AlertOrigin: "", AlertDestination: "", AlertIsActive: false, AlertFrequency: ""),
        ];

        // ── Alertes ───────────────────────────────────────────────────
        public static IReadOnlyList<FavoriteCardDisplayModel> Alerts() =>
        [
            new(
                Id: "a1", Type: FavoriteType.Alert,
                Name: "Maison → Cégep", Emoji: "🔔", SubLabel: "Alertes trajets actives",
                PlaceAddress: null, PlaceEstimatedTime: null,
                PersonInitial: "", PersonRoleLabel: "", PersonLastTripStr: "", PersonIsDriver: false,
                AlertOrigin: "Maison", AlertDestination: "Cégep de la Cité",
                AlertIsActive: true, AlertFrequency: "Lun – Ven, 07 h 30"),

            new(
                Id: "a2", Type: FavoriteType.Alert,
                Name: "Cégep → Maison", Emoji: "🔔", SubLabel: "Retour soir",
                PlaceAddress: null, PlaceEstimatedTime: null,
                PersonInitial: "", PersonRoleLabel: "", PersonLastTripStr: "", PersonIsDriver: false,
                AlertOrigin: "Cégep de la Cité", AlertDestination: "Maison",
                AlertIsActive: true, AlertFrequency: "Lun – Ven, 17 h 00"),

            new(
                Id: "a3", Type: FavoriteType.Alert,
                Name: "Maison → Centre commercial", Emoji: "🔔", SubLabel: "Weekend",
                PlaceAddress: null, PlaceEstimatedTime: null,
                PersonInitial: "", PersonRoleLabel: "", PersonLastTripStr: "", PersonIsDriver: false,
                AlertOrigin: "Maison", AlertDestination: "Place Laurier",
                AlertIsActive: false, AlertFrequency: "Sam – Dim, 10 h 00"),
        ];
    }
}
