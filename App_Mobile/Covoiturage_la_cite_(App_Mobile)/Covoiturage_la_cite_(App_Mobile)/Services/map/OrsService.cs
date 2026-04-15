// ─────────────────────────────────────────────────────────────────────────────
// Services/map/OrsService.cs
// Remplacement de OsrmService.cs — calcul de circuits via OpenRouteService (ORS)
//
// ⚠️  TEMPORAIRE (dev) : clé API stockée ici en attendant le déploiement du
//     serveur core qui centralisera l'accès ORS (une seule clé, toutes instances).
//
// Stratégie de calcul :
//   Phase 1 (0–60s)  : requête principale avec alternative_routes (target 3)
//   Seuil 1 min      : si >= 1 circuit trouvé → retourner immédiatement
//                      si 0 → continuer les waypoints restants
//   Phase 2 (60–300s): waypoints décalés N/E/S/O/NE/SO
//   Seuil 5 min      : OrsTimeoutException (aucun circuit trouvé)
// ─────────────────────────────────────────────────────────────────────────────

using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Covoiturage_la_cite__App_Mobile_.Services.Map.Types;

namespace Covoiturage_la_cite__App_Mobile_.Services.Map;

// ── Exceptions ────────────────────────────────────────────────────────────────

public class OrsTimeoutException(string message) : Exception(message);
public class OrsNoRouteException(string message)  : Exception(message);

// ── DTOs réponse ORS GeoJSON ──────────────────────────────────────────────────

internal record OrsGeoJson(
    [property: JsonPropertyName("features")] List<OrsFeature>? Features
);

internal record OrsFeature(
    [property: JsonPropertyName("properties")] OrsProperties Properties,
    [property: JsonPropertyName("geometry")]   OrsGeometry   Geometry
);

internal record OrsProperties(
    [property: JsonPropertyName("summary")]  OrsSummary        Summary,
    [property: JsonPropertyName("segments")] List<OrsSegment>? Segments
);

internal record OrsSummary(
    [property: JsonPropertyName("distance")] double Distance,
    [property: JsonPropertyName("duration")] double Duration
);

internal record OrsSegment(
    [property: JsonPropertyName("steps")] List<OrsStep>? Steps
);

internal record OrsStep(
    [property: JsonPropertyName("name")] string? Name
);

internal record OrsGeometry(
    [property: JsonPropertyName("coordinates")] List<double[]> Coordinates
);

// ── Service ───────────────────────────────────────────────────────────────────

public sealed class OrsService(HttpClient http, string apiKey)
{
    // TODO : déplacer vers le serveur core au déploiement (clé unique centralisée)
    public const string DevApiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFhOTllOTlmNTRkNDRlMDVhYWU2ZjZkNGQ0NDVjMzZjIiwiaCI6Im11cm11cjY0In0=";

    private const string OrsBase      = "https://api.openrouteservice.org/v2/directions/driving-car";
    private const int    TargetCircuits = 6;

    // Offsets cardinaux (degrés) — ~1.5 km (identiques à OsrmService)
    private static readonly (double DLat, double DLng)[] WaypointOffsets =
    [
        ( 0.014,  0.000),  // Nord
        ( 0.000,  0.020),  // Est
        (-0.014,  0.000),  // Sud
        ( 0.000, -0.020),  // Ouest
        ( 0.010,  0.014),  // Nord-Est
        (-0.010, -0.014),  // Sud-Ouest
    ];

    // ── API publique ──────────────────────────────────────────────────────────

    /// <summary>Calcule une route simple entre deux points.</summary>
    public async Task<MapCircuit> FetchRouteAsync(
        double depLng, double depLat,
        double arrLng, double arrLat,
        string depLabel, string arrLabel,
        CancellationToken ct = default)
    {
        var features = await OrsFetchAsync([[depLng, depLat], [arrLng, arrLat]], false, ct);
        if (features.Count == 0) throw new OrsNoRouteException("Aucune route trouvée.");
        return ToMapCircuit(features[0], 0, [], (depLng, depLat), (arrLng, arrLat), depLabel, arrLabel);
    }

    /// <summary>
    /// Calcule 3 à 6 circuits alternatifs avec stratégie de timeout graduelle.
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
        var rawRoutes = new List<(OrsFeature Feature, double[]? Waypoint)>();

        // ── Étape 1 : requête principale avec alternatives ────────────────────
        try
        {
            foreach (var f in await OrsFetchAsync([[dep.Lng, dep.Lat], [arr.Lng, arr.Lat]], true, linked1.Token))
            {
                if (TryAdd(seen, rawRoutes, f, null) && rawRoutes.Count >= TargetCircuits) break;
            }
        }
        catch (OperationCanceledException) when (cts1min.IsCancellationRequested) { }

        // ── Étape 2 : waypoints décalés si < target ───────────────────────────
        if (rawRoutes.Count < TargetCircuits)
        {
            var (mLng, mLat) = Midpoint(dep, arr);

            foreach (var (dLat, dLng) in WaypointOffsets)
            {
                if (rawRoutes.Count >= TargetCircuits) break;
                if (cts1min.IsCancellationRequested && rawRoutes.Count >= 1) break;
                if (cts5min.IsCancellationRequested) break;

                try
                {
                    var wp = new double[] { mLng + dLng, mLat + dLat };
                    foreach (var f in await OrsFetchAsync([[dep.Lng, dep.Lat], wp, [arr.Lng, arr.Lat]], false, linked5.Token))
                    {
                        TryAdd(seen, rawRoutes, f, wp);
                        if (rawRoutes.Count >= TargetCircuits) break;
                    }
                }
                catch (OperationCanceledException) { break; }
                catch (Exception) { /* ignore les échecs individuels */ }
            }
        }

        // ── Résultat ──────────────────────────────────────────────────────────
        externalCt.ThrowIfCancellationRequested();

        if (rawRoutes.Count == 0)
            throw new OrsTimeoutException(
                "Aucun circuit trouvé. Vérifiez la connexion ou réessayez dans quelques instants.");

        return rawRoutes
            .Select((item, index) => ToMapCircuit(
                item.Feature, index,
                item.Waypoint is { } wp ? [new LatLngPoint(wp[1], wp[0])] : [],
                dep, arr, depLabel, arrLabel))
            .OrderBy(c => c.Distance)
            .ToList()
            .AsReadOnly();
    }

    // ── Helpers internes ──────────────────────────────────────────────────────

    private async Task<List<OrsFeature>> OrsFetchAsync(
        double[][] coordinates,
        bool withAlternatives,
        CancellationToken ct)
    {
        var body = new Dictionary<string, object> { ["coordinates"] = coordinates };
        if (withAlternatives)
            body["alternative_routes"] = new { target_count = 3, weight_factor = 1.4, share_factor = 0.6 };

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{OrsBase}/geojson");
        request.Headers.Add("Authorization", apiKey);
        request.Content = JsonContent.Create(body);

        var response = await http.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();

        var geojson = await response.Content.ReadFromJsonAsync<OrsGeoJson>(ct);
        return geojson?.Features ?? [];
    }

    private static string DedupeKey(OrsFeature f) =>
        $"{Math.Round(f.Properties.Summary.Distance / 500)}_{Math.Round(f.Properties.Summary.Duration / 30)}";

    private static bool TryAdd(
        HashSet<string> seen,
        List<(OrsFeature, double[]?)> list,
        OrsFeature feature,
        double[]? waypoint)
    {
        if (!seen.Add(DedupeKey(feature))) return false;
        list.Add((feature, waypoint));
        return true;
    }

    private static (double Lng, double Lat) Midpoint(
        (double Lng, double Lat) a,
        (double Lng, double Lat) b) =>
        ((a.Lng + b.Lng) / 2, (a.Lat + b.Lat) / 2);

    private static MapCircuit ToMapCircuit(
        OrsFeature feature,
        int index,
        IReadOnlyList<LatLngPoint> waypointCoords,
        (double Lng, double Lat) dep,
        (double Lng, double Lat) arr,
        string depLabel,
        string arrLabel) =>
        new()
        {
            RouteIndex      = index,
            // ORS retourne [lng, lat] (GeoJSON) → on convertit en [lat, lng] pour Leaflet
            LatLngs         = feature.Geometry.Coordinates
                                     .Select(c => new LatLngPoint(c[1], c[0]))
                                     .ToList()
                                     .AsReadOnly(),
            WaypointCoords  = waypointCoords,
            Duration        = feature.Properties.Summary.Duration,
            Distance        = feature.Properties.Summary.Distance,
            Summary         = feature.Properties.Segments?.FirstOrDefault()?.Steps?.FirstOrDefault()?.Name
                              ?? $"Itinéraire {index + 1}",
            DepartureCoords = dep,
            ArrivalCoords   = arr,
            DepartureLabel  = depLabel,
            ArrivalLabel    = arrLabel,
        };
}
