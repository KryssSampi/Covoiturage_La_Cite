/**
 * @file seed-dashboard.js
 * @description Seeder pour enrichir les données mock du dashboard.
 *
 * Génère des données cohérentes et volumineuses pour tester le dashboard :
 * - 10 trajets pour Sophie (conductrice USR-2026-00001)
 * - 5  trajets pour Marie  (conductrice USR-2026-00003)
 * - 12 réservations réparties (Ahmed + Zara comme passagers)
 * - 20 notifications mixtes (Sophie, Ahmed, Marie)
 * - 10 avis reçus (pour Sophie et Marie)
 *
 * Usage : node scripts/seed-dashboard.js
 */

const fs   = require('fs');
const path = require('path');

// ─── Chemins ───────────────────────────────────────────────────────────────────
const DB_DIR = path.join(__dirname, '..', 'tests', 'db');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DB_DIR, file), 'utf-8'));
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(DB_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✔ ${file} — ${data.length} entrées`);
}

// ─── IDs utilisateurs ─────────────────────────────────────────────────────────
const SOPHIE = 'USR-2026-00001'; // conductrice
const AHMED  = 'USR-2026-00002'; // passager
const MARIE  = 'USR-2026-00003'; // conductrice
const ZARA   = 'USR-2026-00004'; // admin (utilisé comme passager dans les seeds)

// ─── Lieux récurrents autour d'Ottawa ─────────────────────────────────────────
const LIEUX = [
  { label: 'Campus La Cité',         addr: '801 promenade de l\'Aviation, Ottawa ON', lat: 45.4215, lng: -75.6442 },
  { label: 'Place d\'Orléans',        addr: '110 place d\'Orléans Drive, Orléans ON',  lat: 45.4777, lng: -75.5117 },
  { label: 'Rideau Centre',           addr: '50 rue Rideau, Ottawa ON',                 lat: 45.4247, lng: -75.6930 },
  { label: 'Tunney\'s Pasture',       addr: 'Tunney\'s Pasture, Ottawa ON',             lat: 45.4040, lng: -75.7380 },
  { label: 'Hôpital Civic',           addr: '1053 rue Carling, Ottawa ON',              lat: 45.3930, lng: -75.7340 },
  { label: 'Gatineau Centre-Ville',   addr: '170 rue de l\'Hôtel-de-Ville, Gatineau QC', lat: 45.4768, lng: -75.7020 },
  { label: 'Billings Bridge',         addr: '2277 Riverside Drive, Ottawa ON',           lat: 45.3905, lng: -75.6782 },
  { label: 'South Keys',              addr: '2210 Bank Street, Ottawa ON',               lat: 45.3648, lng: -75.6706 },
];

// ─── Générateur de polyline simplifiée ────────────────────────────────────────
function polyline(from, to, steps = 5) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push([
      parseFloat((from.lat + t * (to.lat - from.lat)).toFixed(4)),
      parseFloat((from.lng + t * (to.lng - from.lng)).toFixed(4)),
    ]);
  }
  return pts;
}

// ─── Générer les dates futures ─────────────────────────────────────────────────
function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function pastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function isoTs(daysOffset, hour = 8, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

// ─── Nouveaux trajets ──────────────────────────────────────────────────────────
const BASE_TRIP_ID = 6; // Les 5 premiers existent déjà

function buildTrip(idx, driverId, from, to, date, time, status = 'published', passengers = [], price = 5) {
  const id = `TRJ-2026-${String(idx).padStart(5, '0')}`;
  return {
    id,
    driverId,
    vehicleId: driverId === SOPHIE ? 'VEH-2026-00001' : 'VEH-2026-00002',
    passengerIds: passengers,
    departure: {
      label: from.label,
      fullAddress: from.addr,
      coordinates: { lat: from.lat, lng: from.lng },
      instructions: 'Entrée principale',
    },
    arrival: {
      label: to.label,
      fullAddress: to.addr,
      coordinates: { lat: to.lat, lng: to.lng },
      instructions: null,
    },
    waypoints: [],
    polyline: polyline(from, to),
    departureDate: date,
    departureTime: time,
    estimatedArrivalTime: time.replace(/^(\d{2}):/, (_, h) => `${String(parseInt(h) + 1).padStart(2,'0')}:`),
    maxPassengers: 3,
    currentPassengers: passengers.length,
    pricePerPassenger: price,
    paymentMethod: 'cash',
    status,
    departureType: 'planned',
    tripType: 'ponctuel',
    preferences: {
      baggageAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      musicAllowed: true,
      flexibleItinerary: false,
      conversationLevel: 'moderate',
      driverNote: null,
    },
    recurrenceDays: [],
    recurrenceEndDate: null,
    estimatedDistanceKm: parseFloat((Math.abs(from.lat - to.lat) * 111 + Math.abs(from.lng - to.lng) * 85).toFixed(1)),
    estimatedDurationMinutes: 30,
    co2SavedKg: 2.4,
    createdAt: isoTs(-30),
    updatedAt: isoTs(-1),
    notes: null,
  };
}

// ─── Nouveaux trajets Sophie (conductrice) ─────────────────────────────────────
const NEW_TRIPS = [
  buildTrip(6,  SOPHIE, LIEUX[0], LIEUX[1], futureDate(1),  '07:30', 'published', []),
  buildTrip(7,  SOPHIE, LIEUX[0], LIEUX[2], futureDate(2),  '08:00', 'published', [AHMED]),
  buildTrip(8,  SOPHIE, LIEUX[0], LIEUX[3], futureDate(3),  '07:45', 'published', []),
  buildTrip(9,  SOPHIE, LIEUX[1], LIEUX[4], futureDate(5),  '08:15', 'published', [AHMED]),
  buildTrip(10, SOPHIE, LIEUX[0], LIEUX[5], futureDate(7),  '17:00', 'published', []),
  buildTrip(11, SOPHIE, LIEUX[2], LIEUX[6], futureDate(10), '08:30', 'full',      [AHMED, ZARA]),
  buildTrip(12, SOPHIE, LIEUX[0], LIEUX[7], pastDate(5),    '08:00', 'completed', [AHMED]),
  // Marie
  buildTrip(13, MARIE,  LIEUX[3], LIEUX[0], futureDate(1),  '08:00', 'published', [AHMED]),
  buildTrip(14, MARIE,  LIEUX[4], LIEUX[2], futureDate(4),  '07:30', 'published', []),
  buildTrip(15, MARIE,  LIEUX[5], LIEUX[1], futureDate(6),  '17:30', 'published', []),
];

// ─── Nouvelles réservations ────────────────────────────────────────────────────
const BASE_RSV_ID = 6;

function buildReservation(idx, tripIdx, passengerId, driverId, status, msgFr = '') {
  const id     = `RSV-2026-${String(idx).padStart(5, '0')}`;
  const tripId = `TRJ-2026-${String(tripIdx).padStart(5, '0')}`;
  const now    = isoTs(-2);
  return {
    id,
    tripId,
    passengerId,
    driverId,
    status,
    pricePerSeat: 5,
    totalAmount: 5,
    requestedAt: now,
    expiresAt: isoTs(1),
    confirmedAt: status === 'confirmed' || status === 'in_progress' ? now : null,
    cancelledAt: status === 'cancelled' ? isoTs(-1) : null,
    completedAt: status === 'completed' ? isoTs(-1) : null,
    passengerMessage: msgFr || 'Bonjour! Je prends ce trajet régulièrement.',
    refusalReason: status === 'refused' ? 'Trajet déjà complet.' : null,
    cancellationReason: null,
    boardingConfirmedByDriver: false,
    boardingConfirmedByPassenger: false,
    compatibilityScore: Math.floor(Math.random() * 20) + 80,
    createdAt: now,
    updatedAt: now,
  };
}

const NEW_RESERVATIONS = [
  buildReservation(6,  6,  AHMED, SOPHIE, 'pending',    'Bonjour Sophie, je suis ponctuel.'),
  buildReservation(7,  7,  AHMED, SOPHIE, 'confirmed',  'Merci pour le trajet!'),
  buildReservation(8,  8,  AHMED, SOPHIE, 'pending',    'Je serai là 5 min à l\'avance.'),
  buildReservation(9,  9,  AHMED, SOPHIE, 'confirmed',  'À demain!'),
  buildReservation(10, 10, AHMED, SOPHIE, 'pending',    'Parfait pour moi.'),
  buildReservation(11, 12, AHMED, SOPHIE, 'completed',  'Trajet terminé, merci!'),
  buildReservation(12, 13, AHMED, MARIE,  'confirmed',  'Bonjour Marie!'),
  buildReservation(13, 14, AHMED, MARIE,  'pending',    'Je prends ce trajet svp.'),
  buildReservation(14, 11, ZARA,  SOPHIE, 'confirmed',  'Bonjour, je suis Jean-Paul.'),
  buildReservation(15, 1,  ZARA,  SOPHIE, 'cancelled',  'Je dois annuler, désolé.'),
];

// ─── Nouvelles notifications ───────────────────────────────────────────────────
const BASE_NOTIF_ID = 7;

function buildNotif(idx, userId, type, title, message, isRead, isImportant, relatedTripId, relatedRsvId, daysAgo = 1) {
  return {
    id: `NOTIF-2026-${String(idx).padStart(5, '0')}`,
    userId,
    type,
    title,
    message,
    isRead,
    isImportant,
    link: relatedTripId ? `/trajets/${relatedTripId}` : null,
    relatedTripId: relatedTripId || null,
    relatedReservationId: relatedRsvId || null,
    createdAt: isoTs(-daysAgo),
  };
}

const NEW_NOTIFICATIONS = [
  // Sophie — demandes reçues
  buildNotif(7,  SOPHIE, 'reservation_received', 'Nouvelle demande', 'Ahmed Ibrahim demande à rejoindre votre trajet du '+ futureDate(1), false, true,  'TRJ-2026-00006', 'RSV-2026-00006', 0),
  buildNotif(8,  SOPHIE, 'reservation_received', 'Nouvelle demande', 'Ahmed Ibrahim demande à rejoindre votre trajet du '+ futureDate(2), false, true,  'TRJ-2026-00007', 'RSV-2026-00007', 1),
  buildNotif(9,  SOPHIE, 'reservation_received', 'Nouvelle demande', 'Ahmed Ibrahim souhaite réserver le trajet du '+ futureDate(3), false, false, 'TRJ-2026-00008', 'RSV-2026-00008', 1),
  buildNotif(10, SOPHIE, 'reservation_received', 'Nouvelle demande', 'Jean-Paul Gagnon demande à rejoindre votre trajet.', true,  false, 'TRJ-2026-00011', 'RSV-2026-00014', 3),
  buildNotif(11, SOPHIE, 'reservation_cancelled', 'Réservation annulée', 'Jean-Paul Gagnon a annulé sa réservation.', true, false, 'TRJ-2026-00001', 'RSV-2026-00015', 2),
  buildNotif(12, SOPHIE, 'trip_completed', 'Trajet terminé', 'Votre trajet du '+ pastDate(5) +' est maintenant terminé. Merci!', true, false, 'TRJ-2026-00012', null, 4),
  buildNotif(13, SOPHIE, 'new_review_received', 'Nouvel avis reçu', 'Ahmed Ibrahim vous a laissé un avis 5 étoiles.', false, false, null, null, 1),
  buildNotif(14, SOPHIE, 'system', 'Mise à jour plateforme', 'La Cité Covoiturage v2.3 est disponible. Découvrez les nouvelles fonctionnalités!', true, false, null, null, 7),

  // Ahmed — notifications passager
  buildNotif(15, AHMED, 'reservation_accepted', 'Réservation confirmée', 'Sophie Leclerc a accepté votre demande de réservation.', false, true,  'TRJ-2026-00007', 'RSV-2026-00007', 1),
  buildNotif(16, AHMED, 'reservation_accepted', 'Réservation confirmée', 'Sophie Leclerc a accepté votre demande pour le trajet du '+ futureDate(5), false, true, 'TRJ-2026-00009', 'RSV-2026-00009', 0),
  buildNotif(17, AHMED, 'trip_starting_soon', 'Départ imminent !!!', 'Votre trajet avec Sophie Leclerc démarre dans 30 minutes.', false, true, 'TRJ-2026-00007', null, 0),
  buildNotif(18, AHMED, 'reservation_accepted', 'Réservation confirmée', 'Marie Tremblay a confirmé votre place.', true, false, 'TRJ-2026-00013', 'RSV-2026-00012', 2),
  buildNotif(19, AHMED, 'trip_completed', 'Trajet terminé', 'Votre trajet avec Sophie Leclerc est terminé! Pensez à laisser un avis.', true, false, 'TRJ-2026-00012', 'RSV-2026-00011', 5),
  buildNotif(20, AHMED, 'new_review_received', 'Nouvel avis reçu', 'Sophie Leclerc vous a laissé un avis 5 étoiles.', true, false, null, null, 4),
  buildNotif(21, AHMED, 'system', 'Bienvenue sur La Cité Covoiturage!', 'Retrouvez des trajets adaptés à votre horaire et économisez du CO₂.', true, false, null, null, 30),

  // Marie — notifications conductrice
  buildNotif(22, MARIE, 'reservation_received', 'Nouvelle demande', 'Ahmed Ibrahim demande à rejoindre votre trajet du '+ futureDate(1), false, true, 'TRJ-2026-00013', 'RSV-2026-00012', 0),
  buildNotif(23, MARIE, 'reservation_received', 'Nouvelle demande', 'Ahmed Ibrahim souhaite réserver le trajet du '+ futureDate(4), false, false, 'TRJ-2026-00014', 'RSV-2026-00013', 1),
  buildNotif(24, MARIE, 'trip_completed', 'Trajet terminé', 'Votre trajet du '+ pastDate(7) +' est terminé.', true, false, 'TRJ-2026-00005', null, 6),
  buildNotif(25, MARIE, 'new_review_received', 'Nouvel avis reçu', 'Ahmed Ibrahim vous a laissé un avis 4 étoiles.', true, false, null, null, 5),
  buildNotif(26, MARIE, 'system', 'Rappel : profil à compléter', 'Ajoutez une photo de profil pour rassurer vos passagers.', true, false, null, null, 14),
];

// ─── Nouveaux avis ─────────────────────────────────────────────────────────────
const BASE_REV_ID = 3;

function buildReview(idx, tripId, rsvId, reviewerId, revieweeId, revieweeRole, rating, comment, tags) {
  return {
    id: `REV-2026-${String(idx).padStart(5, '0')}`,
    tripId,
    reservationId: rsvId,
    reviewerId,
    revieweeId,
    revieweeRole,
    rating,
    comment,
    tags,
    createdAt: isoTs(-Math.floor(Math.random() * 14) - 1),
  };
}

const NEW_REVIEWS = [
  // Avis pour Sophie (conductrice)
  buildReview(3,  'TRJ-2026-00007', 'RSV-2026-00007', AHMED,  SOPHIE, 'driver', 5,   'Sophie est une conductrice exemplaire! Toujours à l\'heure, voiture propre et trajet agréable.', ['ponctuelle', 'voiture propre', 'sympathique']),
  buildReview(4,  'TRJ-2026-00009', 'RSV-2026-00009', AHMED,  SOPHIE, 'driver', 4.5, 'Très bon trajet, conduite douce et sécuritaire. Je recommande vivement.', ['conduite douce', 'sécuritaire']),
  buildReview(5,  'TRJ-2026-00012', 'RSV-2026-00011', AHMED,  SOPHIE, 'driver', 5,   'Superbe expérience! Sophie est agréable, la musique était parfaite et l\'itinéraire respecté.', ['musique agréable', 'ponctuelle', 'sympathique']),
  buildReview(6,  'TRJ-2026-00011', 'RSV-2026-00014', ZARA,   SOPHIE, 'driver', 4,   'Bonne conductrice, voiture confortable. Légèrement en retard au départ mais rien de grave.', ['voiture confortable']),
  buildReview(7,  'TRJ-2026-00001', 'RSV-2026-00001', AHMED,  SOPHIE, 'driver', 5,   'Parfait comme toujours avec Sophie! C\'est ma conductrice habituelle pour aller au campus.', ['régulière', 'fiable', 'sympathique']),
  buildReview(8,  'TRJ-2026-00004', 'RSV-2026-00002', AHMED,  SOPHIE, 'driver', 4.5, 'Trajet en cours super agréable. Sophie met les passagers à l\'aise.', ['à l\'aise', 'agréable']),

  // Avis pour Ahmed (passager)
  buildReview(9,  'TRJ-2026-00007', 'RSV-2026-00007', SOPHIE, AHMED,  'passenger', 5,   'Ahmed est un passager modèle! Ponctuel, respectueux et agréable à transporter.', ['ponctuel', 'respectueux', 'propre']),
  buildReview(10, 'TRJ-2026-00012', 'RSV-2026-00011', SOPHIE, AHMED,  'passenger', 5,   'Toujours un plaisir de prendre Ahmed dans mon trajet. Très fiable.', ['fiable', 'ponctuel']),
  buildReview(11, 'TRJ-2026-00013', 'RSV-2026-00012', MARIE,  AHMED,  'passenger', 4,   'Ahmed est agréable, arrive à l\'heure. Bonne communication.', ['ponctuel', 'communicatif']),

  // Avis pour Marie (conductrice)
  buildReview(12, 'TRJ-2026-00005', 'RSV-2026-00004', AHMED,  MARIE, 'driver', 4,   'Marie est une bonne conductrice, trajet sans encombre. Je recommande.', ['sécuritaire', 'professionnelle']),
];

// ─── Assemblage et écriture ────────────────────────────────────────────────────
(() => {
  const trips        = [...readJson('trips.json'),        ...NEW_TRIPS];
  const reservations = [...readJson('reservations.json'), ...NEW_RESERVATIONS];
  const notifications = [...readJson('notifications.json'), ...NEW_NOTIFICATIONS];
  const reviews      = [...readJson('reviews.json'),      ...NEW_REVIEWS];

  writeJson('trips.json',         trips);
  writeJson('reservations.json',  reservations);
  writeJson('notifications.json', notifications);
  writeJson('reviews.json',       reviews);

  console.log('\n✅ Seeder terminé! Données Dashboard enrichies.');
  console.log(`   - ${trips.length} trajets`);
  console.log(`   - ${reservations.length} réservations`);
  console.log(`   - ${notifications.length} notifications`);
  console.log(`   - ${reviews.length} avis`);
})();
