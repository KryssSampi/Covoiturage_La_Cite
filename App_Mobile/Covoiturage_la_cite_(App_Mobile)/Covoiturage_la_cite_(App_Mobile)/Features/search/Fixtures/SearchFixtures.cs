// Features/search/Fixtures/SearchFixtures.cs
// ════════════════════════════════════════════════════════════════════════
// Données de test statiques pour la SearchPage (phase beta).
// Passager : liste de conducteurs disponibles (DriverTripResultItem)
// Conducteur : circuits recommandés (MapCircuitResultItem)
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.search.Fixtures;

public static class SearchFixtures
{
    // ── Résultats passager : conducteurs disponibles ──────────────────

    public static IReadOnlyList<DriverTripResultItem> PassengerResults() =>
    [
        new(new DriverTripCardDisplayModel(
            TripId: "s1",
            TimeLabel: "07:40",
            Route: new RouteDisplayModel("Barrhaven", "Campus La Cité", "07:40", "08:20"),
            PassengerLabel: "1/3 passagers",
            Price: 6m,
            Status: DriverTripStatus.Published,
            PendingRequests: 0,
            ProgressPercent: 0,
            EtaLabel: null)),

        new(new DriverTripCardDisplayModel(
            TripId: "s2",
            TimeLabel: "08:00",
            Route: new RouteDisplayModel("Place d'Orléans", "Campus La Cité", "08:00", "08:45"),
            PassengerLabel: "0/4 passagers",
            Price: 8m,
            Status: DriverTripStatus.Published,
            PendingRequests: 0,
            ProgressPercent: 0,
            EtaLabel: null)),

        new(new DriverTripCardDisplayModel(
            TripId: "s3",
            TimeLabel: "08:15",
            Route: new RouteDisplayModel("Gloucester", "Campus La Cité", "08:15", "08:50"),
            PassengerLabel: "2/3 passagers",
            Price: 7m,
            Status: DriverTripStatus.Published,
            PendingRequests: 1,
            ProgressPercent: 0,
            EtaLabel: null)),

        new(new DriverTripCardDisplayModel(
            TripId: "s4",
            TimeLabel: "08:30",
            Route: new RouteDisplayModel("Kanata", "Campus La Cité", "08:30", "09:15"),
            PassengerLabel: "1/2 passagers",
            Price: 10m,
            Status: DriverTripStatus.Published,
            PendingRequests: 0,
            ProgressPercent: 0,
            EtaLabel: null)),

        new(new DriverTripCardDisplayModel(
            TripId: "s5",
            TimeLabel: "09:00",
            Route: new RouteDisplayModel("Nepean", "Campus La Cité", "09:00", "09:40"),
            PassengerLabel: "0/3 passagers",
            Price: 9m,
            Status: DriverTripStatus.Published,
            PendingRequests: 0,
            ProgressPercent: 0,
            EtaLabel: null)),

        new(new DriverTripCardDisplayModel(
            TripId: "s6",
            TimeLabel: "16:30",
            Route: new RouteDisplayModel("Campus La Cité", "Barrhaven", "16:30", "17:20"),
            PassengerLabel: "2/3 passagers",
            Price: 6m,
            Status: DriverTripStatus.Published,
            PendingRequests: 0,
            ProgressPercent: 0,
            EtaLabel: null)),

        new(new DriverTripCardDisplayModel(
            TripId: "s7",
            TimeLabel: "17:00",
            Route: new RouteDisplayModel("Campus La Cité", "Place d'Orléans", "17:00", "17:45"),
            PassengerLabel: "1/4 passagers",
            Price: 7m,
            Status: DriverTripStatus.Published,
            PendingRequests: 0,
            ProgressPercent: 0,
            EtaLabel: null)),
    ];

    // ── Résultats conducteur : circuits Leaflet ───────────────────────
    // Ces circuits alimentent aussi la WebView via le bridge JSON.

    public static IReadOnlyList<MapCircuitResultItem> DriverCircuits() =>
    [
        new(new MapCircuitCardDisplayModel(
            CircuitId: "c1",
            MapImageSource: "",
            Label: "Principal",
            LabelColorHex: "#1A56CC",
            FromAddress: "Votre position",
            ToAddress: "Campus La Cité",
            Via: "via autoroute 417 E",
            DurationMinutes: 18,
            DistanceKm: 12.4,
            CtaLabel: "Choisir ce circuit")),

        new(new MapCircuitCardDisplayModel(
            CircuitId: "c2",
            MapImageSource: "",
            Label: "Alternatif",
            LabelColorHex: "#0F6E56",
            FromAddress: "Votre position",
            ToAddress: "Campus La Cité",
            Via: "via chemin Innes / bd Ogilvie",
            DurationMinutes: 24,
            DistanceKm: 9.8,
            CtaLabel: "Choisir ce circuit")),

        new(new MapCircuitCardDisplayModel(
            CircuitId: "c3",
            MapImageSource: "",
            Label: "Scenic",
            LabelColorHex: "#854F0B",
            FromAddress: "Votre position",
            ToAddress: "Campus La Cité",
            Via: "via bd Blair / prom. de l'Aviation",
            DurationMinutes: 28,
            DistanceKm: 11.1,
            CtaLabel: "Choisir ce circuit")),
    ];
}
