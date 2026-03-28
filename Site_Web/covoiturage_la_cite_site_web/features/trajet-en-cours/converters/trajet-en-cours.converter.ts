import type { TripModel } from '@/core/models/TripModel';
import type { UserModel } from '@/core/models/UserModel';
import type { VehicleModel } from '@/core/models/VehicleModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type {
  TrajetEnCoursData,
  ConducteurInfo,
  PassagerInfo,
  PointTrajet,
  StatutTrajet,
  TarifTrajet,
  PreferencesTrajet,
} from '../types/trajet-en-cours.types';
import type { TrajetMapFixture, LatLng } from '../types/map.types';
import type { TrajetProgressionFixture } from '../types/progression-signalement.types';
import { polylineDistanceM } from '../fixtures/map.fixtures';

/**
 * Convertisseurs trajet-en-cours
 * Transforment les modèles core en types UI du composant TrajetEnCoursPage
 */

const COULEURS_AVATAR = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
];

function couleurAvatar(index: number): string {
  return COULEURS_AVATAR[index % COULEURS_AVATAR.length];
}

/** Convertit un UserModel conducteur en ConducteurInfo */
export function toConducteurInfo(driver: UserModel, vehicle: VehicleModel): ConducteurInfo {
  return {
    id: driver.id,
    prenom: driver.firstName,
    nom: driver.lastName,
    initiales: driver.initials,
    photo: driver.avatarUrl ?? undefined,
    note: driver.driverProfile?.averageRating ?? 4.5,
    nbTrajets: driver.driverProfile?.totalTripsAsDriver ?? 0,
    nbTrajetsEnsemble: 0,
    badges: [],
    vehicule: {
      marque: vehicle.make,
      modele: vehicle.model,
      annee: vehicle.year,
      couleur: vehicle.color,
      immatriculation: vehicle.licensePlate,
      nbPlaces: vehicle.maxSeats,
      photo: vehicle.photoUrl ?? undefined,
    },
    estVerifie: driver.profileVerified,
    telephone: driver.phone ?? undefined,
  };
}

/** Convertit un UserModel passager en PassagerInfo */
export function toPassagerInfo(passenger: UserModel, index: number): PassagerInfo {
  return {
    id: passenger.id,
    prenom: passenger.firstName,
    nom: passenger.lastName,
    initiales: passenger.initials,
    photo: passenger.avatarUrl ?? undefined,
    couleurAvatar: couleurAvatar(index),
    note: passenger.passengerProfile.averageRating,
    place: index + 1,
    telephone: passenger.phone ?? undefined,
  };
}

/** Convertit un TripLocation en PointTrajet */
function toPointTrajet(location: TripModel['departure']): PointTrajet {
  return {
    nom: location.label,
    adresse: location.fullAddress,
    coordonnees: { lat: location.coordinates.lat, lng: location.coordinates.lng },
    instructions: location.instructions ?? undefined,
  };
}

/** Construit le StatutTrajet depuis un TripModel */
function toStatutTrajet(trip: TripModel): StatutTrajet {
  const etatMap: Record<string, StatutTrajet['etat']> = {
    published: 'confirme',
    full: 'confirme',
    confirmed: 'confirme',
    in_progress: 'en_cours',
    completed: 'termine',
    cancelled: 'annule',
    draft: 'confirme',
    no_show: 'annule',
  };

  const modeMap: Record<string, StatutTrajet['modePaiement']> = {
    cash: 'comptant',
    interac: 'virtuel',
  };

  return {
    etat: etatMap[trip.status] ?? 'confirme',
    typeDepart: trip.tripType === 'recurrent' ? 'recurrent' : 'unique',
    estRecurrent: trip.tripType === 'recurrent',
    detourMaxMin: 0,
    modePaiement: modeMap[trip.paymentMethod] ?? 'comptant',
    nbPlacesDisponibles: trip.maxPassengers - trip.currentPassengers,
    nbPlacesTotales: trip.maxPassengers,
    derniereMaj: new Date(trip.updatedAt),
  };
}

/** Construit les PreferencesTrajet depuis un TripModel */
function toPreferencesTrajet(trip: TripModel): PreferencesTrajet {
  const convMap: Record<string, PreferencesTrajet['niveauConversation']> = {
    quiet: 'silencieux',
    moderate: 'modere',
    chatty: 'bavard',
  };

  return {
    bagagesAutorises: trip.preferences.baggageAllowed,
    animauxAcceptes: trip.preferences.petsAllowed,
    fumeur: trip.preferences.smokingAllowed,
    musique: trip.preferences.musicAllowed,
    niveauConversation: convMap[trip.preferences.conversationLevel] ?? 'modere',
    messagePassagers: trip.preferences.driverNote ?? undefined,
  };
}

/**
 * Convertit un TripModel + entités liées en TrajetEnCoursData
 * (format attendu par TrajetEnCoursPage)
 */
export function toTrajetEnCoursData(
  trip: TripModel,
  role: 'driver' | 'passenger',
  driver: UserModel,
  vehicle: VehicleModel,
  passengers: UserModel[],
  // reservation optionnelle — réservé pour usage futur
  _reservation?: ReservationModel // eslint-disable-line @typescript-eslint/no-unused-vars
): TrajetEnCoursData {
  const conducteur = toConducteurInfo(driver, vehicle);

  // Le passager voit passengerPrice (pricePerPassenger × 1.15), le conducteur voit son propre prix
  const prixParPassager = role === 'passenger' ? (trip.passengerPrice ?? trip.pricePerPassenger * 1.15) : trip.pricePerPassenger;
  const economieVsTaxi = Math.round(prixParPassager * 3.5);
  const co2 = trip.co2SavedKg ?? (trip.estimatedDistanceKm ?? 0) * 0.12;

  const tarif: TarifTrajet = {
    prixParPassager,
    economieVsTaxi,
    co2EconomiseKg: Math.round(co2 * 10) / 10,
  };

  return {
    id: trip.id,
    titre: `${trip.departure.label} → ${trip.arrival.label}`,
    role,
    conducteur,
    passagers: passengers.map((p, i) => toPassagerInfo(p, i)),
    depart: toPointTrajet(trip.departure),
    arrivee: toPointTrajet(trip.arrival),
    preferences: toPreferencesTrajet(trip),
    statut: toStatutTrajet(trip),
    tarif,
    dateDepart: trip.departureDate,
    heureDepart: trip.departureTime,
  };
}

/**
 * Construit un TrajetProgressionFixture depuis un TripModel.
 * Génère des étapes à partir du départ, des waypoints et de l'arrivée.
 */
export function tripToProgressionFixture(trip: TripModel): TrajetProgressionFixture {
  const totalKm =
    trip.estimatedDistanceKm ??
    (trip.polyline.length > 1
      ? polylineDistanceM(trip.polyline.map(([lat, lng]) => ({ lat, lng }))) / 1000
      : 20);
  const totalSec = (trip.estimatedDurationMinutes ?? trip.durationEstimation ?? 30) * 60;

  const allPoints: { label: string; distanceKm: number; tempsSecondes: number; icone: string }[] = [
    { label: trip.departure.label, distanceKm: 0, tempsSecondes: 0, icone: '🏁' },
    ...trip.waypoints.map((wp, i) => {
      const ratio = (i + 1) / (trip.waypoints.length + 1);
      return {
        label: wp.location.label,
        distanceKm: parseFloat((totalKm * ratio).toFixed(1)),
        tempsSecondes: Math.round(totalSec * ratio),
        icone: '📍',
      };
    }),
    { label: trip.arrival.label, distanceKm: parseFloat(totalKm.toFixed(1)), tempsSecondes: totalSec, icone: '🏁' },
  ];

  return {
    id: trip.id,
    labelDepart: trip.departure.label,
    labelArrivee: trip.arrival.label,
    dureeTotaleSecondes: totalSec,
    distanceTotaleKm: parseFloat(totalKm.toFixed(1)),
    etapes: allPoints.map((p, i) => ({
      id: `e${i + 1}`,
      nom: p.label,
      ville: '',
      icone: p.icone,
      tempsSecondes: p.tempsSecondes,
      distanceKm: p.distanceKm,
    })),
  };
}

/**
 * Construit un TrajetMapFixture pour la carte temps réel à partir d'un TripModel.
 * La polyline TripModel est au format [[lat, lng], ...] (format Leaflet).
 * Retourne null si les coordonnées de départ/arrivée sont manquantes.
 */
export function tripToMapFixture(trip: TripModel): TrajetMapFixture | null {
  const dep = trip.departure.coordinates;
  const arr = trip.arrival.coordinates;
  if (!dep || !arr) return null;

  // Conversion [lat, lng][] → LatLng[]
  const polylineLatLng: LatLng[] =
    trip.polyline.length > 0
      ? trip.polyline.map(([lat, lng]) => ({ lat, lng }))
      : [dep, arr];

  const distanceTotaleM =
    polylineLatLng.length > 1
      ? polylineDistanceM(polylineLatLng)
      : (trip.estimatedDistanceKm ?? 20) * 1000;

  return {
    id: trip.id,
    label: `${trip.departure.label} → ${trip.arrival.label}`,
    depart: dep,
    arrivee: arr,
    labelDepart: trip.departure.label,
    labelArrivee: trip.arrival.label,
    vitesseMoyenneKmh: 50,
    polyline: polylineLatLng,
    distanceTotaleM,
  };
}
