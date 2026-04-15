// ─────────────────────────────────────────────────────────────────────────────
// Services/map/OsrmService.cs
// Port C# de lib/routing.ts — calcul de circuits via OSRM public
//
// Stratégie de calcul graduelle (tolérance latence mobile) :
//   Phase 1 (0–60s)  : requête principale alternatives=true → vise 6 circuits
//                      si < 6, waypoints décalés N/E/S/O un par un
//   Seuil 1 min      : si >= 1 circuit trouvé → retourner immédiatement
//                      si 0 → continuer les waypoints restants
//   Phase 2 (60–300s): continuer à tenter les waypoints restants
//   Seuil 5 min      : OsrmTimeoutException (aucun circuit trouvé)
// ─────────────────────────────────────────────────────────────────────────────

using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Covoiturage_la_cite__App_Mobile_.Services.Map.Types;

namespace Covoiturage_la_cite__App_Mobile_.Services.Map;

// ── Exceptions ────────────────────────────────────────────────────────────────

public class OsrmTimeoutException(string message) : Exception(message);
public class OsrmNoRouteException(string message) : Exception(message);

// ── DTOs réponse OSRM ─────────────────────────────────────────────────────────

internal record OsrmResponse(
    [property: JsonPropertyName("routes")] List<OsrmRoute>? Routes
);

internal record OsrmRoute(
    [property: JsonPropertyName("geometry")]  OsrmGeometry  Geometry,
    [property: JsonPropertyName("duration")]  double        Duration,
    [property: JsonPropertyName("distance")]  double        Distance,
    [property: JsonPropertyName("legs")]      List<OsrmLeg> Legs
);

internal record OsrmGeometry(
    [property: JsonPropertyName("coordinates")] List<double[]> Coordinates
);

internal record OsrmLeg(
    [property: JsonPropertyName("summary")] string Summary
);

// ── Service ───────────────────────────────────────────────────────────────────

public sealed class OsrmService(HttpClient http)
{
    private const string OsrmBase = "https://router.project-osrm.org/route/v1/driving";
    private const int    TargetCircuits = 6;

    // Offsets cardinaux (degrés) — ~1.5 km dans chaque direction (identique au TS)
    private static readonly (double DLat, double DLng)[] WaypointOffsets =
    [
        ( 0.014,  0.000),   // Nord
        ( 0.000,  0.020),   // Est
        (-0.014,  0.000),   // Sud
        ( 0.000, -0.020),   // Ouest
        ( 0.010,  0.014),   // Nord-Est
        (-0.010, -0.014),   // Sud-Ouest
    ];

    // ── API publique ──────────────────────────────────────────────────────────

    /// <summary>
    /// Calcule une route simple entre deux points.
    /// </summary>
    public async Task<MapCircuit> FetchRouteAsync(
        double depLng, double depLat,
        double arrLng, double arrLat,
        string depLabel, string arrLabel,
        CancellationToken ct = default)
    {
        var url     = $"{OsrmBase}/{depLng},{depLat};{arrLng},{arrLat}?overview=full&geometries=geojson";
        var routes  = await OsrmFetchAsync(url, ct);
        if (routes.Count == 0) throw new OsrmNoRouteException("Aucune route trouvée.");

        return ToMapCircuit(routes[0], 0, [], (depLng, depLat), (arrLng, arrLat), depLabel, arrLabel);
    }

    /// <summary>
    /// Calcule 3 à 6 circuits alternatifs avec stratégie de timeout graduelle.
    ///
    /// Comportement :
    /// - Cherche au moins 6 circuits pendant 60 secondes
    /// - À 60s : si >= 1 circuit → retourne ce qu'on a
    /// - Si 0 à 60s → continue jusqu'à 5 min
    /// - À 5 min sans résultat → <see cref="OsrmTimeoutException"/>
    /// </summary>
    public async Task<IReadOnlyList<MapCircuit>> FetchCircuitsAsync(
        double depLng, double depLat,
        double arrLng, double arrLat,
        string depLabel, string arrLabel,
        CancellationToken externalCt = default)
    {
        var dep = (Lng: depLng, Lat: depLat);
        var arr = (Lng: arrLng, Lat: arrLat);

        using var cts1min = new CancellationTokenSource(TimeSpan.FromMinutes(1));
        using var cts5min = new CancellationTokenSource(TimeSpan.FromMinutes(5));
        using var linked1 = CancellationTokenSource.CreateLinkedTokenSource(externalCt, cts1min.Token);
        using var linked5 = CancellationTokenSource.CreateLinkedTokenSource(externalCt, cts5min.Token);

        var seen      = new HashSet<string>();
        var rawRoutes = new List<(OsrmRoute Route, double[]? Waypoint)>();

        // ── Étape 1 : requête principale avec alternatives ────────────────────
        try
        {
            var mainUrl = $"{OsrmBase}/{dep.Lng},{dep.Lat};{arr.Lng},{arr.Lat}" +
                          $"?overview=full&geometries=geojson&alternatives=true";

            foreach (var r in await OsrmFetchAsync(mainUrl, linked1.Token))
            {
                if (TryAdd(seen, rawRoutes, r, null))
                    if (rawRoutes.Count >= TargetCircuits) break;
            }
        }
        catch (OperationCanceledException) when (cts1min.IsCancellationRequested)
        {
            // Timeout 1 min atteint pendant la requête principale
        }

        // ── Étape 2 : waypoints décalés si < target ───────────────────────────
        if (rawRoutes.Count < TargetCircuits)
        {
            var (mLng, mLat) = Midpoint(dep, arr);

            foreach (var (dLat, dLng) in WaypointOffsets)
            {
                if (rawRoutes.Count >= TargetCircuits) break;

                // Seuil 1 min : si on a au moins 1 circuit, on retourne
                if (cts1min.IsCancellationRequested && rawRoutes.Count >= 1) break;

                // Seuil 5 min : erreur définitive
                if (cts5min.IsCancellationRequested) break;

                try
                {
                    var wp  = new double[] { mLng + dLng, mLat + dLat };
                    var url = $"{OsrmBase}/{dep.Lng},{dep.Lat};{wp[0]},{wp[1]};{arr.Lng},{arr.Lat}" +
                              $"?overview=full&geometries=geojson";

                    // Utilise le token 5 min (on continue même après 1 min si 0 circuit)
                    foreach (var r in await OsrmFetchAsync(url, linked5.Token))
                    {
                        TryAdd(seen, rawRoutes, r, wp);
                        if (rawRoutes.Count >= TargetCircuits) break;
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception)
                {
                    // Ignore les échecs individuels de waypoint
                }
            }
        }

        // ── Résultat ──────────────────────────────────────────────────────────
        externalCt.ThrowIfCancellationRequested();

        if (rawRoutes.Count == 0)
            throw new OsrmTimeoutException(
                "Aucun circuit trouvé. Vérifiez la connexion ou réessayez dans quelques instants.");

        return rawRoutes
            .Select((item, index) => ToMapCircuit(
                item.Route,
                index,
                item.Waypoint is { } wp ? [new LatLngPoint(wp[1], wp[0])] : [],
                dep,
                arr,
                depLabel,
                arrLabel))
            .OrderBy(c => c.Distance)
            .ToList()
            .AsReadOnly();
    }

    // ── Helpers internes ──────────────────────────────────────────────────────

    private async Task<List<OsrmRoute>> OsrmFetchAsync(string url, CancellationToken ct)
    {
        var response = await http.GetAsync(url, ct);
        response.EnsureSuccessStatusCode();
        var osrm = await response.Content.ReadFromJsonAsync<OsrmResponse>(ct);
        return osrm?.Routes ?? [];
    }

    /// <summary>Clé de déduplication — arrondi à 500 m et 30 s (identique au TS).</summary>
    private static string DedupeKey(OsrmRoute r) =>
        $"{Math.Round(r.Distance / 500)}_{Math.Round(r.Duration / 30)}";

    private static bool TryAdd(
        HashSet<string> seen,
        List<(OsrmRoute, double[]?)> list,
        OsrmRoute route,
        double[]? waypoint)
    {
        var key = DedupeKey(route);
        if (!seen.Add(key)) return false;
        list.Add((route, waypoint));
        return true;
    }

    private static (double Lng, double Lat) Midpoint(
        (double Lng, double Lat) a,
        (double Lng, double Lat) b) =>
        ((a.Lng + b.Lng) / 2, (a.Lat + b.Lat) / 2);

    /// <summary>Convertit une OsrmRoute en MapCircuit.</summary>
    private static MapCircuit ToMapCircuit(
        OsrmRoute route,
        int index,
        IReadOnlyList<LatLngPoint> waypointCoords,
        (double Lng, double Lat) dep,
        (double Lng, double Lat) arr,
        string depLabel,
        string arrLabel) =>
        new()
        {
            RouteIndex      = index,
            // OSRM retourne [lng, lat] → on convertit en [lat, lng] pour Leaflet
            LatLngs         = route.Geometry.Coordinates
                                   .Select(c => new LatLngPoint(c[1], c[0]))
                                   .ToList()
                                   .AsReadOnly(),
            WaypointCoords  = waypointCoords,
            Duration        = route.Duration,
            Distance        = route.Distance,
            Summary         = route.Legs.FirstOrDefault()?.Summary
                              ?? $"Itinéraire {index + 1}",
            DepartureCoords = dep,
            ArrivalCoords   = arr,
            DepartureLabel  = depLabel,
            ArrivalLabel    = arrLabel,
        };
}
