import type {
  LatLng,
  WaypointWithDistance,
  TrajetMapFixture,
  TrajetMapState,
} from '../types/map.types';
import {
  haversineM,
  bearingDeg,
  polylineDistanceM,
} from '../fixtures/map.fixtures';

// ─── enrichPolyline ───────────────────────────────────────────────────────────

/** Enrichit la polyline avec distances cumulées et cap (heading) */
export function enrichPolyline(pts: LatLng[]): WaypointWithDistance[] {
  let cum = 0;
  return pts.map((p, i) => {
    if (i > 0) cum += haversineM(pts[i - 1], p);
    return {
      latlng:        p,
      distFromStart: cum,
      heading:       i < pts.length - 1
        ? bearingDeg(p, pts[i + 1])
        : bearingDeg(pts[i - 1], p),
    };
  });
}

// ─── densifyPolyline ──────────────────────────────────────────────────────────

/** Subdivise les segments trop longs pour plus de fluidité d'animation */
export function densifyPolyline(pts: LatLng[], maxSegM = 150): LatLng[] {
  const out: LatLng[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const d = haversineM(pts[i], pts[i + 1]);
    if (d > maxSegM) {
      const n = Math.ceil(d / maxSegM);
      for (let j = 1; j <= n; j++) {
        const t = j / n;
        out.push({
          lat: pts[i].lat + t * (pts[i + 1].lat - pts[i].lat),
          lng: pts[i].lng + t * (pts[i + 1].lng - pts[i].lng),
        });
      }
    } else {
      out.push(pts[i + 1]);
    }
  }
  return out;
}

// ─── buildState ───────────────────────────────────────────────────────────────

/** Construit l'état initial de la carte pour une fixture donnée */
export function buildState(fixture: TrajetMapFixture): TrajetMapState {
  const densePoly  = densifyPolyline(fixture.polyline);
  const distTotale = polylineDistanceM(densePoly);
  const waypoints  = enrichPolyline(densePoly);
  return {
    fixture:            { ...fixture, polyline: densePoly, distanceTotaleM: distTotale },
    waypoints,
    positionActuelle:   densePoly[0],
    headingActuel:      waypoints[0]?.heading ?? 0,
    distanceParcourue:  0,
    pourcentageComplete: 0,
    estTermine:         false,
    prochainFixture:    null,
  };
}

// ─── fetchOsrmRoute ───────────────────────────────────────────────────────────

/**
 * Recalcule l'itinéraire via OSRM depuis la position courante.
 * Retourne null en cas d'échec (pas de connexion, OSRM indisponible).
 */
export async function fetchOsrmRoute(
  from: LatLng,
  to:   LatLng,
): Promise<LatLng[] | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson`;
    const res  = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as {
      routes?: Array<{ geometry: { coordinates: number[][] } }>;
    };
    const coords = data.routes?.[0]?.geometry?.coordinates;
    if (!coords) return null;
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return null;
  }
}
