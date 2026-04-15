// ─────────────────────────────────────────────────────────────────────────────
// Services/map/Types/MapCircuit.cs
// Type de données circuit — miroir exact de l'interface TypeScript MapCircuit
// ─────────────────────────────────────────────────────────────────────────────

namespace Covoiturage_la_cite__App_Mobile_.Services.Map.Types;

/// <summary>
/// Coordonnée GPS.
/// latLngs utilise [lat, lng] (format Leaflet) — DepartureCoords/ArrivalCoords
/// utilisent [lng, lat] (format OSRM natif) — comme côté web.
/// </summary>
public readonly record struct LatLngPoint(double Lat, double Lng);

/// <summary>
/// Circuit routier calculé par OsrmService.
/// Miroir exact du type TypeScript MapCircuit du site web.
/// Sérialisé en JSON et envoyé à la WebView via postMessage.
/// </summary>
public record MapCircuit
{
    /// <summary>Index dans la liste (0 = principal, 1+ = alternatifs).</summary>
    public required int RouteIndex { get; init; }

    /// <summary>Polyline complète [[lat, lng], ...] — format Leaflet.</summary>
    public required IReadOnlyList<LatLngPoint> LatLngs { get; init; }

    /// <summary>Waypoints intermédiaires forcés (peut être vide).</summary>
    public IReadOnlyList<LatLngPoint> WaypointCoords { get; init; } = [];

    /// <summary>Durée estimée en secondes.</summary>
    public required double Duration { get; init; }

    /// <summary>Distance en mètres.</summary>
    public required double Distance { get; init; }

    /// <summary>"via Rue X, Rue Y"</summary>
    public required string Summary { get; init; }

    /// <summary>Départ au format OSRM (Lng, Lat).</summary>
    public required (double Lng, double Lat) DepartureCoords { get; init; }

    /// <summary>Arrivée au format OSRM (Lng, Lat).</summary>
    public required (double Lng, double Lat) ArrivalCoords { get; init; }

    public required string DepartureLabel { get; init; }
    public required string ArrivalLabel   { get; init; }

    // ── Helpers d'affichage (utilisés par MapCircuitCardDisplayModel) ─────────

    public string FormattedDuration
    {
        get
        {
            var m = (int)Math.Round(Duration / 60);
            return m < 60 ? $"{m} min" : $"{m / 60}h{m % 60:D2}";
        }
    }

    public string FormattedDistance =>
        Distance >= 1000 ? $"{Distance / 1000:F1} km" : $"{(int)Distance} m";

    /// <summary>"Principal" | "Alternatif 1" | "Alternatif 2" | ...</summary>
    public string Label => RouteIndex == 0 ? "Principal" : $"Alternatif {RouteIndex}";

    /// <summary>Couleur badge CSS pour MapCircuitCard.</summary>
    public string LabelColorHex => RouteIndex == 0 ? "#0F6E56" : "#1A56CC";
}
