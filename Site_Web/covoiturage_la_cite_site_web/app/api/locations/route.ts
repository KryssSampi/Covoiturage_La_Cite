import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

// ─── Tracking en mémoire pour la logique métier GPS ──────────────────────────
// Réinitialisé au redémarrage du serveur — suffisant pour une session de trajet.

interface TripTrackingState {
  nearDepartureAt?: Date;
  positionHistory: Array<{ lat: number; lng: number; at: Date }>;
}
const tripTracking = new Map<string, TripTrackingState>();

// ─── Utilitaires géographiques ────────────────────────────────────────────────

function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

/** Vérifie si un point est à moins de `thresholdM` mètres d'un segment de polyline */
function nearPolyline(
  pos: { lat: number; lng: number },
  polyline: [number, number][],
  thresholdM = 50,
): boolean {
  for (let i = 0; i < polyline.length - 1; i++) {
    const a = { lat: polyline[i][0], lng: polyline[i][1] };
    const b = { lat: polyline[i + 1][0], lng: polyline[i + 1][1] };
    if (haversineM(pos, a) <= thresholdM || haversineM(pos, b) <= thresholdM)
      return true;
  }
  return false;
}

// ─── PATCH /api/locations ─────────────────────────────────────────────────────
// Body: { userId, lat, lng, tripId? }

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as {
      userId: string;
      lat: number;
      lng: number;
      tripId?: string;
      isSimulation?: boolean;
    };

    const { userId, lat, lng, tripId, isSimulation } = body;
    if (!userId || lat == null || lng == null) {
      return NextResponse.json(
        { error: 'userId, lat et lng sont requis' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    // Met à jour la position courante de l'utilisateur
    persistenceManager.updateItem<Record<string, unknown>>('users', userId, {
      currentLocation: { lat, lng },
      updatedAt: now,
    });

    const tripUpdates: Record<string, unknown> = {};
    const reservationUpdates: Record<string, unknown> = {};

    if (tripId) {
      const trip = persistenceManager.readById<Record<string, unknown>>(
        'trips',
        tripId,
      );

      if (trip) {
        // Si l'admin a pris le contrôle GPS et que ce n'est pas une position simulée,
        // on ignore silencieusement la position GPS réelle du conducteur.
        if (trip.simControlActive && !isSimulation) {
          return NextResponse.json({ ok: true, skipped: 'sim_control_active' });
        }

        const polyline = (trip.polyline as [number, number][]) ?? [];
        const departure = (
          trip.departure as { coordinates: { lat: number; lng: number } }
        )?.coordinates;
        const arrival = (
          trip.arrival as { coordinates: { lat: number; lng: number } }
        )?.coordinates;

        // ── Logique conducteur ──────────────────────────────────────────────
        if (trip.driverId === userId) {
          const tracking: TripTrackingState = tripTracking.get(tripId) ?? {
            positionHistory: [],
          };

          tracking.positionHistory.push({ lat, lng, at: new Date() });
          // Garde les 30 dernières positions (~2 min à 4 s d'intervalle)
          if (tracking.positionHistory.length > 30) {
            tracking.positionHistory.splice(0, tracking.positionHistory.length - 30);
          }
          tripTracking.set(tripId, tracking);

          // En mode simulation admin : skip les gardes de départ (alreadyOnTheirWay déjà posé)
          if (isSimulation) {
            if (!trip.theyReallyEnd && arrival) {
              const distToArr = haversineM({ lat, lng }, arrival);
              if (distToArr <= 30) {
                persistenceManager.updateItem<Record<string, unknown>>('trips', tripId, {
                  theyReallyEnd: true,
                  status: 'completed',
                  simControlActive: false,
                  updatedAt: now,
                });
                tripUpdates.theyReallyEnd = true;
                tripUpdates.status = 'completed';
                tripTracking.delete(tripId);
              }
            }
            return NextResponse.json({ ok: true, ...tripUpdates });
          }

          // 1. Conducteur près du départ → marque le début du suivi
          if (!trip.alreadyOnTheirWay && departure) {
            const distToDep = haversineM({ lat, lng }, departure);
            if (distToDep <= 30 && !tracking.nearDepartureAt) {
              tracking.nearDepartureAt = new Date();
            }

            // 2. Après ~15 positions suivant la polyline → alreadyOnTheirWay
            if (
              tracking.nearDepartureAt &&
              tracking.positionHistory.length >= 15
            ) {
              const recent = tracking.positionHistory.slice(-15);
              const onRoute = recent.filter((p) =>
                nearPolyline(p, polyline, 50),
              ).length;
              if (onRoute >= 10) {
                persistenceManager.updateItem<Record<string, unknown>>(
                  'trips',
                  tripId,
                  { alreadyOnTheirWay: true, updatedAt: now },
                );
                tripUpdates.alreadyOnTheirWay = true;
              }
            }
          }

          // 3. Conducteur au lieu d'arrivée + alreadyOnTheirWay → fin réelle
          if (
            (trip.alreadyOnTheirWay || tripUpdates.alreadyOnTheirWay) &&
            !trip.theyReallyEnd &&
            arrival
          ) {
            const distToArr = haversineM({ lat, lng }, arrival);
            if (distToArr <= 30) {
              persistenceManager.updateItem<Record<string, unknown>>(
                'trips',
                tripId,
                {
                  theyReallyEnd: true,
                  status: 'completed',
                  updatedAt: now,
                },
              );
              tripUpdates.theyReallyEnd = true;
              tripUpdates.status = 'completed';
              tripTracking.delete(tripId);
            }
          }
        }

        // ── Logique passager : heIsReallyCome ──────────────────────────────
        if (trip.driverId !== userId && departure) {
          const reservations =
            persistenceManager.readAll<Record<string, unknown>>('reservations');
          const myRsv = reservations.find(
            (r) =>
              r.tripId === tripId &&
              r.passengerId === userId &&
              (r.status === 'confirmed' || r.status === 'in_progress') &&
              !r.heIsReallyCome,
          );

          if (myRsv) {
            const distToDep = haversineM({ lat, lng }, departure);
            if (distToDep <= 100) {
              persistenceManager.updateItem<Record<string, unknown>>(
                'reservations',
                myRsv.id as string,
                { heIsReallyCome: true, updatedAt: now },
              );
              reservationUpdates.heIsReallyCome = true;
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true, ...tripUpdates, ...reservationUpdates });
  } catch (error) {
    console.error('[PATCH /api/locations]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
