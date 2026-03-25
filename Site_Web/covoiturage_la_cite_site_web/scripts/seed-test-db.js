#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "..", "tests", "db");

const VALID_RESERVATION_STATUSES = new Set([
  "pending",
  "confirmed",
  "refused",
  "cancelled",
  "in_progress",
  "completed",
  "no_show",
]);

const VALID_NOTIFICATION_TYPES = new Set([
  "reservation_received",
  "reservation_accepted",
  "reservation_refused",
  "reservation_cancelled",
  "trip_starting_soon",
  "trip_started",
  "trip_completed",
  "trip_cancelled",
  "boarding_requested",
  "new_review_received",
  "cancellation_penalty",
  "security_alert",
  "system",
]);

const LOCATIONS = [
  { label: "Campus La Cite", fullAddress: "801 promenade de l'Aviation, Ottawa, ON", lat: 45.4215, lng: -75.6442, instructions: "Devant l'entree principale" },
  { label: "Place d'Orleans", fullAddress: "110 Place d'Orleans Dr, Ottawa, ON", lat: 45.4777, lng: -75.5117, instructions: "Entree principale du centre commercial" },
  { label: "ByWard Market", fullAddress: "55 ByWard Market Sq, Ottawa, ON", lat: 45.4278, lng: -75.6944, instructions: "Coin York et William" },
  { label: "Kanata Centrum", fullAddress: "130 Earl Grey Dr, Kanata, ON", lat: 45.3099, lng: -75.9136, instructions: "Pres du stationnement principal" },
  { label: "Barrhaven Centre", fullAddress: "3651 Strandherd Dr, Ottawa, ON", lat: 45.2745, lng: -75.7368, instructions: "Stationnement cote sud" },
  { label: "South Keys", fullAddress: "2210 Bank St, Ottawa, ON", lat: 45.3648, lng: -75.6706, instructions: "Devant l'entree LRT" },
  { label: "Rideau Centre", fullAddress: "50 Rideau St, Ottawa, ON", lat: 45.4253, lng: -75.6901, instructions: "Porte principale Rideau" },
  { label: "Gatineau Centre-Ville", fullAddress: "170 rue de l'Hotel-de-Ville, Gatineau, QC", lat: 45.4768, lng: -75.702, instructions: "Devant l'hotel de ville" },
];

function dbPath(file) {
  return path.join(DB_DIR, file);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(dbPath(file), "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(dbPath(file), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateOnly(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toIsoLocal(date) {
  return `${toDateOnly(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.000Z`;
}

function dateAt(dayOffset, hour, minute) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date;
}

function dateOnlyOffset(dayOffset) {
  return toDateOnly(dateAt(dayOffset, 9, 0));
}

function timePlusMinutes(time, minutesToAdd) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(2026, 0, 1, hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + minutesToAdd);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function polyline(from, to, steps = 8) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const ratio = index / steps;
    return [
      Number((from.lat + (to.lat - from.lat) * ratio).toFixed(4)),
      Number((from.lng + (to.lng - from.lng) * ratio).toFixed(4)),
    ];
  });
}

function distanceKm(from, to) {
  const latKm = Math.abs(from.lat - to.lat) * 111;
  const lngKm = Math.abs(from.lng - to.lng) * 78;
  return Number((latKm + lngKm).toFixed(1));
}

function logIssues(label, issues) {
  if (issues.length === 0) {
    console.log(`- ${label}: aucune incoherence detectee`);
    return;
  }

  console.log(`- ${label}: ${issues.length} incoherence(s)`);
  issues.slice(0, 5).forEach((issue) => console.log(`  * ${issue}`));
  if (issues.length > 5) {
    console.log(`  * ... ${issues.length - 5} autre(s)`);
  }
}

function auditCurrentData() {
  const users = readJson("users.json");
  const trips = readJson("trips.json");
  const reservations = readJson("reservations.json");
  const notifications = readJson("notifications.json");
  const reviews = readJson("reviews.json");
  const vehicles = readJson("vehicles.json");
  const drafts = readJson("drafts.json");

  const userIds = new Set(users.map((item) => item.id));
  const tripMap = new Map(trips.map((item) => [item.id, item]));
  const vehicleMap = new Map(vehicles.map((item) => [item.id, item]));
  const reservationMap = new Map(reservations.map((item) => [item.id, item]));

  const tripIssues = trips.flatMap((trip) => {
    const issues = [];
    if (!userIds.has(trip.driverId)) issues.push(`${trip.id}: conducteur introuvable (${trip.driverId})`);
    if (!vehicleMap.has(trip.vehicleId)) issues.push(`${trip.id}: vehicule introuvable (${trip.vehicleId})`);
    if (!Array.isArray(trip.passengerIds)) issues.push(`${trip.id}: passengerIds invalide`);
    if (typeof trip.currentPassengers !== "number") issues.push(`${trip.id}: currentPassengers invalide`);
    return issues;
  });

  const reservationIssues = reservations.flatMap((reservation) => {
    const issues = [];
    const trip = tripMap.get(reservation.tripId);
    if (!trip) issues.push(`${reservation.id}: trajet introuvable (${reservation.tripId})`);
    if (!userIds.has(reservation.passengerId)) issues.push(`${reservation.id}: passager introuvable (${reservation.passengerId})`);
    if (!userIds.has(reservation.driverId)) issues.push(`${reservation.id}: conducteur introuvable (${reservation.driverId})`);
    if (trip && reservation.driverId !== trip.driverId) issues.push(`${reservation.id}: driverId incoherent avec ${trip.id}`);
    if (!VALID_RESERVATION_STATUSES.has(reservation.status)) issues.push(`${reservation.id}: statut invalide (${reservation.status})`);
    return issues;
  });

  const notificationIssues = notifications.flatMap((notification) => {
    const issues = [];
    if (!userIds.has(notification.userId)) issues.push(`${notification.id}: userId introuvable (${notification.userId})`);
    if (!VALID_NOTIFICATION_TYPES.has(notification.type)) issues.push(`${notification.id}: type invalide (${notification.type})`);
    if (notification.relatedTripId && !tripMap.has(notification.relatedTripId)) {
      issues.push(`${notification.id}: relatedTripId introuvable (${notification.relatedTripId})`);
    }
    if (notification.relatedReservationId && !reservationMap.has(notification.relatedReservationId)) {
      issues.push(`${notification.id}: relatedReservationId introuvable (${notification.relatedReservationId})`);
    }
    return issues;
  });

  const reviewIssues = reviews.flatMap((review) => {
    const issues = [];
    if (!tripMap.has(review.tripId)) issues.push(`${review.id}: tripId introuvable (${review.tripId})`);
    if (!reservationMap.has(review.reservationId)) issues.push(`${review.id}: reservationId introuvable (${review.reservationId})`);
    if (!userIds.has(review.reviewerId)) issues.push(`${review.id}: reviewer introuvable (${review.reviewerId})`);
    if (!userIds.has(review.revieweeId)) issues.push(`${review.id}: reviewee introuvable (${review.revieweeId})`);
    return issues;
  });

  const draftIssues = drafts.flatMap((draft) => {
    const issues = [];
    if (!userIds.has(draft.driverId)) issues.push(`${draft.id}: conducteur introuvable (${draft.driverId})`);
    if (!vehicleMap.has(draft.vehicleId)) issues.push(`${draft.id}: vehicule introuvable (${draft.vehicleId})`);
    return issues;
  });

  console.log("Audit des JSON existants");
  logIssues("trips", tripIssues);
  logIssues("reservations", reservationIssues);
  logIssues("notifications", notificationIssues);
  logIssues("reviews", reviewIssues);
  logIssues("drafts", draftIssues);
  console.log("");
}

function seed() {
  auditCurrentData();

  const users = readJson("users.json");
  const vehicles = readJson("vehicles.json");
  const bankAccounts = readJson("bank_accounts.json");
  const favoritePlaces = readJson("lieux_favoris.json");
  const astuces = readJson("astuces.json");
  const goTasks = readJson("gotasks.json");
  const affinites = readJson("affinites.json");

  const vehicleByDriver = new Map(vehicles.map((vehicle) => [vehicle.driverId, vehicle]));
  const drivers = users.filter((user) => user.role === "driver" && vehicleByDriver.has(user.id));
  const passengers = users.filter((user) => user.passengerProfile && user.role !== "driver");

  if (drivers.length < 2) {
    throw new Error("Le seed a besoin d'au moins deux conducteurs avec vehicule.");
  }
  if (passengers.length < 1) {
    throw new Error("Le seed a besoin d'au moins un passager.");
  }

  const sophie = drivers[0];
  const marie = drivers[1];
  const ahmed = passengers[0];
  const secondPassenger = passengers[1] ?? passengers[0];

  const tripSpecs = [
    { id: "TRJ-2026-00001", driver: sophie, from: 0, to: 1, dayOffset: 0, time: "08:00", status: "published", maxPassengers: 3, price: 5 },
    { id: "TRJ-2026-00002", driver: sophie, from: 0, to: 4, dayOffset: 0, time: "17:30", status: "published", maxPassengers: 3, price: 8 },
    { id: "TRJ-2026-00003", driver: marie, from: 2, to: 3, dayOffset: 0, time: "09:00", status: "published", maxPassengers: 3, price: 7 },
    { id: "TRJ-2026-00004", driver: sophie, from: 0, to: 6, dayOffset: -1, time: "08:00", status: "completed", maxPassengers: 3, price: 5 },
    { id: "TRJ-2026-00005", driver: marie, from: 5, to: 0, dayOffset: -2, time: "07:45", status: "completed", maxPassengers: 3, price: 4 },
    { id: "TRJ-2026-00006", driver: sophie, from: 0, to: 1, dayOffset: 1, time: "07:30", status: "published", maxPassengers: 3, price: 5 },
    { id: "TRJ-2026-00007", driver: sophie, from: 1, to: 6, dayOffset: 2, time: "08:00", status: "full", maxPassengers: 2, price: 6 },
    { id: "TRJ-2026-00008", driver: sophie, from: 0, to: 7, dayOffset: 3, time: "07:45", status: "published", maxPassengers: 3, price: 5 },
    { id: "TRJ-2026-00009", driver: marie, from: 7, to: 2, dayOffset: 4, time: "08:15", status: "published", maxPassengers: 3, price: 7 },
    { id: "TRJ-2026-00010", driver: sophie, from: 4, to: 0, dayOffset: 6, time: "17:00", status: "published", maxPassengers: 3, price: 6 },
    { id: "TRJ-2026-00011", driver: sophie, from: 0, to: 1, dayOffset: 8, time: "08:30", status: "published", maxPassengers: 3, price: 5 },
    { id: "TRJ-2026-00012", driver: marie, from: 3, to: 5, dayOffset: 9, time: "17:30", status: "published", maxPassengers: 3, price: 7 },
  ];

  const tripById = new Map();
  const trips = tripSpecs.map((spec) => {
    const from = LOCATIONS[spec.from];
    const to = LOCATIONS[spec.to];
    const departureDate = dateOnlyOffset(spec.dayOffset);
    const createdAt = toIsoLocal(dateAt(spec.dayOffset - 7, 9, 0));
    const updatedAt = toIsoLocal(dateAt(spec.dayOffset - 1, 12, 0));
    const vehicle = vehicleByDriver.get(spec.driver.id);
    const trip = {
      id: spec.id,
      driverId: spec.driver.id,
      vehicleId: vehicle.id,
      passengerIds: [],
      departure: {
        label: from.label,
        fullAddress: from.fullAddress,
        coordinates: { lat: from.lat, lng: from.lng },
        instructions: from.instructions,
      },
      arrival: {
        label: to.label,
        fullAddress: to.fullAddress,
        coordinates: { lat: to.lat, lng: to.lng },
        instructions: to.instructions,
      },
      waypoints: [],
      polyline: polyline(from, to),
      departureDate,
      departureTime: spec.time,
      estimatedArrivalTime: timePlusMinutes(spec.time, 35 + (spec.from % 3) * 10),
      maxPassengers: spec.maxPassengers,
      currentPassengers: 0,
      pricePerPassenger: spec.price,
      paymentMethod: spec.driver.id === sophie.id ? "interac" : "cash",
      status: spec.status,
      departureType: "planned",
      tripType: spec.dayOffset <= 1 ? "recurrent" : "unique",
      preferences: {
        baggageAllowed: true,
        petsAllowed: false,
        smokingAllowed: false,
        musicAllowed: spec.driver.id === sophie.id,
        flexibleItinerary: spec.driver.id === marie.id,
        conversationLevel: spec.driver.id === sophie.id ? "moderate" : "quiet",
        driverNote: spec.driver.id === sophie.id ? "Merci d'etre pret 5 minutes avant le depart." : "Trajet calme privilegie.",
      },
      recurrenceDays: spec.dayOffset <= 1 ? [1, 2, 3, 4, 5] : undefined,
      recurrenceEndDate: spec.dayOffset <= 1 ? dateOnlyOffset(30) : undefined,
      estimatedDistanceKm: distanceKm(from, to),
      estimatedDurationMinutes: 35 + (spec.from % 3) * 10,
      co2SavedKg: Number((distanceKm(from, to) * 0.19).toFixed(1)),
      createdAt,
      updatedAt,
      notes: null,
    };
    tripById.set(trip.id, trip);
    return trip;
  });

  const reservationBlueprints = [
    { id: "RSV-2026-00001", tripId: "TRJ-2026-00001", passenger: ahmed, status: "confirmed", message: "Bonjour Sophie, ce trajet m'aide beaucoup pour le campus." },
    { id: "RSV-2026-00002", tripId: "TRJ-2026-00002", passenger: ahmed, status: "pending", message: "Est-ce que vous avez encore une place pour ce soir ?" },
    { id: "RSV-2026-00003", tripId: "TRJ-2026-00003", passenger: ahmed, status: "pending", message: "Bonjour Marie, je suis ponctuel et leger en bagages." },
    { id: "RSV-2026-00004", tripId: "TRJ-2026-00004", passenger: ahmed, status: "completed", message: "Merci pour le trajet de ce matin." },
    { id: "RSV-2026-00005", tripId: "TRJ-2026-00004", passenger: secondPassenger, status: "completed", message: "Je serai au point de rendez-vous a l'heure." },
    { id: "RSV-2026-00006", tripId: "TRJ-2026-00005", passenger: ahmed, status: "completed", message: "Trajet termine, merci encore." },
    { id: "RSV-2026-00007", tripId: "TRJ-2026-00006", passenger: ahmed, status: "confirmed", message: "Je confirme ma presence demain matin." },
    { id: "RSV-2026-00008", tripId: "TRJ-2026-00007", passenger: ahmed, status: "confirmed", message: "Parfait pour moi." },
    { id: "RSV-2026-00009", tripId: "TRJ-2026-00007", passenger: secondPassenger, status: "confirmed", message: "Merci, a bientot." },
    { id: "RSV-2026-00010", tripId: "TRJ-2026-00008", passenger: ahmed, status: "refused", message: "Je tente ma chance pour ce trajet." },
    { id: "RSV-2026-00011", tripId: "TRJ-2026-00009", passenger: ahmed, status: "cancelled", message: "Je devrai peut-etre annuler au besoin." },
    { id: "RSV-2026-00012", tripId: "TRJ-2026-00011", passenger: ahmed, status: "confirmed", message: "Ce trajet m'interesse pour la semaine prochaine." },
    { id: "RSV-2026-00013", tripId: "TRJ-2026-00012", passenger: secondPassenger, status: "pending", message: "Je voudrais reserver cette place si possible." },
  ];

  const reservations = reservationBlueprints.map((blueprint, index) => {
    const trip = tripById.get(blueprint.tripId);
    const requestedAt = toIsoLocal(dateAt(-Math.max(1, 5 - index), 10 + (index % 5), 15));
    const reservation = {
      id: blueprint.id,
      tripId: blueprint.tripId,
      passengerId: blueprint.passenger.id,
      driverId: trip.driverId,
      status: blueprint.status,
      pricePerSeat: trip.pricePerPassenger,
      totalAmount: trip.pricePerPassenger,
      requestedAt,
      expiresAt: toIsoLocal(dateAt(Math.max(1, index % 3), 23, 0)),
      confirmedAt: ["confirmed", "in_progress", "completed", "no_show"].includes(blueprint.status)
        ? toIsoLocal(dateAt(-Math.max(1, 4 - index), 11, 0))
        : null,
      cancelledAt: blueprint.status === "cancelled" ? toIsoLocal(dateAt(-1, 21, 30)) : null,
      completedAt: blueprint.status === "completed" ? toIsoLocal(dateAt(-1, 9, 15 + (index % 3) * 10)) : null,
      passengerMessage: blueprint.message,
      refusalReason: blueprint.status === "refused" ? "Le trajet est deja complet ou priorise un autre profil." : null,
      cancellationReason: blueprint.status === "cancelled" ? "Annulee par le passager" : null,
      boardingConfirmedByDriver: blueprint.status === "in_progress" || blueprint.status === "completed",
      boardingConfirmedByPassenger: blueprint.status === "in_progress" || blueprint.status === "completed",
      compatibilityScore: 82 + (index % 17),
      createdAt: requestedAt,
      updatedAt: requestedAt,
    };
    return reservation;
  });

  const confirmedStatuses = new Set(["confirmed", "in_progress", "completed", "no_show"]);
  trips.forEach((trip) => {
    const confirmedReservations = reservations.filter(
      (reservation) => reservation.tripId === trip.id && confirmedStatuses.has(reservation.status),
    );
    trip.passengerIds = confirmedReservations.map((reservation) => reservation.passengerId);
    trip.currentPassengers = trip.passengerIds.length;
    if (trip.status === "full") {
      trip.maxPassengers = Math.max(1, trip.currentPassengers);
    }
  });

  const reviews = [
    {
      id: "REV-2026-00001",
      tripId: "TRJ-2026-00005",
      reservationId: "RSV-2026-00006",
      reviewerId: ahmed.id,
      revieweeId: marie.id,
      revieweeRole: "driver",
      rating: 4.8,
      comment: "Trajet fluide, tres bon accueil et conduite rassurante.",
      tags: ["ponctuelle", "securitaire", "agrable"],
      createdAt: toIsoLocal(dateAt(-1, 12, 0)),
    },
    {
      id: "REV-2026-00002",
      tripId: "TRJ-2026-00005",
      reservationId: "RSV-2026-00006",
      reviewerId: marie.id,
      revieweeId: ahmed.id,
      revieweeRole: "passenger",
      rating: 4.9,
      comment: "Passager tres ponctuel et respectueux.",
      tags: ["ponctuel", "respectueux", "fiable"],
      createdAt: toIsoLocal(dateAt(-1, 12, 20)),
    },
  ];

  const drafts = drivers.map((driver, index) => {
    const from = LOCATIONS[(index * 2) % LOCATIONS.length];
    const to = LOCATIONS[(index * 2 + 3) % LOCATIONS.length];
    const vehicle = vehicleByDriver.get(driver.id);
    const departureDate = dateOnlyOffset(5 + index);
    const departureTime = index === 0 ? "08:30" : "17:15";
    return {
      id: `DRF-2026-${String(index + 1).padStart(5, "0")}`,
      driverId: driver.id,
      departureLocation: `${from.label}, ${from.fullAddress}`,
      arrivalLocation: `${to.label}, ${to.fullAddress}`,
      departureDate,
      departureTime,
      vehicleId: vehicle.id,
      maxPassengers: 4,
      availableSeats: 3,
      pricePerPassenger: 5 + index,
      paymentMethod: index === 0 ? "interac" : "cash",
      preferences: {
        baggageAllowed: true,
        petsAllowed: false,
        smokingAllowed: false,
        musicAllowed: true,
        flexibleItinerary: false,
      },
      departureCoords: [from.lat, from.lng],
      arrivalCoords: [to.lat, to.lng],
      notes: "Brouillon genere automatiquement pour les tests.",
      createdAt: toIsoLocal(dateAt(-2, 14, 0)),
      updatedAt: toIsoLocal(dateAt(-1, 9, 30)),
    };
  });

  const notifications = [
    {
      id: "NTF-2026-00001",
      userId: sophie.id,
      type: "reservation_received",
      title: "Nouvelle demande de reservation",
      message: `${ahmed.firstName} ${ahmed.lastName} souhaite rejoindre votre trajet de ce soir.`,
      isRead: false,
      isImportant: true,
      link: `/driver/reservations/${sophie.id}`,
      relatedTripId: "TRJ-2026-00002",
      relatedReservationId: "RSV-2026-00002",
      createdAt: toIsoLocal(dateAt(0, 16, 50)),
    },
    {
      id: "NTF-2026-00002",
      userId: marie.id,
      type: "reservation_received",
      title: "Nouvelle demande de reservation",
      message: `${ahmed.firstName} ${ahmed.lastName} souhaite rejoindre votre trajet du matin.`,
      isRead: false,
      isImportant: true,
      link: `/driver/reservations/${marie.id}`,
      relatedTripId: "TRJ-2026-00003",
      relatedReservationId: "RSV-2026-00003",
      createdAt: toIsoLocal(dateAt(0, 16, 55)),
    },
    {
      id: "NTF-2026-00003",
      userId: ahmed.id,
      type: "reservation_accepted",
      title: "Reservation confirmee",
      message: `Votre place pour ${tripById.get("TRJ-2026-00006").departure.label} vers ${tripById.get("TRJ-2026-00006").arrival.label} est confirmee.`,
      isRead: false,
      isImportant: true,
      link: `/passenger/reservations/${ahmed.id}`,
      relatedTripId: "TRJ-2026-00006",
      relatedReservationId: "RSV-2026-00007",
      createdAt: toIsoLocal(dateAt(-1, 18, 0)),
    },
    {
      id: "NTF-2026-00004",
      userId: ahmed.id,
      type: "reservation_refused",
      title: "Reservation refusee",
      message: "Votre demande pour le trajet vers Gatineau n'a pas ete retenue.",
      isRead: true,
      isImportant: false,
      link: `/passenger/reservations/${ahmed.id}`,
      relatedTripId: "TRJ-2026-00008",
      relatedReservationId: "RSV-2026-00010",
      createdAt: toIsoLocal(dateAt(-1, 19, 0)),
    },
    {
      id: "NTF-2026-00005",
      userId: ahmed.id,
      type: "reservation_cancelled",
      title: "Reservation annulee",
      message: "Votre reservation vers ByWard Market a ete annulee.",
      isRead: true,
      isImportant: false,
      link: `/passenger/reservations/${ahmed.id}`,
      relatedTripId: "TRJ-2026-00009",
      relatedReservationId: "RSV-2026-00011",
      createdAt: toIsoLocal(dateAt(-1, 20, 0)),
    },
    {
      id: "NTF-2026-00006",
      userId: sophie.id,
      type: "trip_completed",
      title: "Trajet termine",
      message: "Votre trajet du matin d'hier a ete cloture correctement.",
      isRead: true,
      isImportant: false,
      link: "/trajets/TRJ-2026-00004",
      relatedTripId: "TRJ-2026-00004",
      relatedReservationId: "RSV-2026-00004",
      createdAt: toIsoLocal(dateAt(-1, 8, 5)),
    },
    {
      id: "NTF-2026-00007",
      userId: marie.id,
      type: "trip_completed",
      title: "Trajet termine",
      message: "Votre trajet recent a ete marque comme termine.",
      isRead: true,
      isImportant: false,
      link: `/trajets/TRJ-2026-00005`,
      relatedTripId: "TRJ-2026-00005",
      relatedReservationId: "RSV-2026-00006",
      createdAt: toIsoLocal(dateAt(-1, 10, 0)),
    },
    {
      id: "NTF-2026-00008",
      userId: marie.id,
      type: "new_review_received",
      title: "Nouvel avis recu",
      message: `${ahmed.firstName} ${ahmed.lastName} vous a laisse un avis apres votre trajet.`,
      isRead: false,
      isImportant: false,
      link: `/${marie.role}/${marie.id}`,
      relatedTripId: "TRJ-2026-00005",
      relatedReservationId: "RSV-2026-00006",
      createdAt: toIsoLocal(dateAt(-1, 12, 5)),
    },
    {
      id: "NTF-2026-00009",
      userId: sophie.id,
      type: "system",
      title: "Base de test regeneree",
      message: "Les donnees de demonstration ont ete regenerees avec des dependances coherentes.",
      isRead: true,
      isImportant: false,
      link: null,
      relatedTripId: null,
      relatedReservationId: null,
      createdAt: toIsoLocal(dateAt(0, 9, 0)),
    },
  ];

  const driverFinanceAccounts = drivers.map((driver, index) => {
    const driverReservations = reservations.filter((reservation) => reservation.driverId === driver.id);
    const completed = driverReservations.filter((reservation) => reservation.status === "completed");
    const inTransit = driverReservations.filter((reservation) => reservation.status === "in_progress");
    const commission = 0.15;
    const soldeDisponible = Number(
      completed.reduce((sum, reservation) => sum + reservation.totalAmount * (1 - commission), 0).toFixed(2),
    );
    const soldeEnTransit = Number(
      inTransit.reduce((sum, reservation) => sum + reservation.totalAmount * (1 - commission), 0).toFixed(2),
    );
    const transactions = [
      ...completed.map((reservation, transactionIndex) => ({
        id: `DTXN-${driver.id}-${transactionIndex + 1}`,
        type: "revenu_trajet",
        montant: Number((reservation.totalAmount * (1 - commission)).toFixed(2)),
        description: `Trajet ${reservation.tripId} confirme`,
        trajetId: reservation.tripId,
        statut: "confirme",
        createdAt: reservation.completedAt ?? reservation.updatedAt,
      })),
      ...inTransit.map((reservation, transactionIndex) => ({
        id: `DTXN-${driver.id}-TRANSIT-${transactionIndex + 1}`,
        type: "revenu_trajet",
        montant: Number((reservation.totalAmount * (1 - commission)).toFixed(2)),
        description: `Trajet ${reservation.tripId} en transit`,
        trajetId: reservation.tripId,
        statut: "en_transit",
        createdAt: reservation.updatedAt,
      })),
    ];
    return {
      id: `DFA-${driver.id}`,
      driverId: driver.id,
      soldeDisponible,
      soldeEnTransit,
      soldePenalites: 0,
      tauxPrelevement: 0.1,
      commission,
      transactions,
      updatedAt: toIsoLocal(dateAt(0, 9 + index, 0)),
    };
  });

  const indisponibilities = [
    {
      id: sophie.id,
      dates: [
        {
          id: `${dateOnlyOffset(12)}-08:30`,
          startAt: `${dateOnlyOffset(12)}T08:30:00`,
          endAt: `${dateOnlyOffset(12)}T09:00:00`,
        },
      ],
      createdAt: toIsoLocal(dateAt(0, 8, 0)),
      updatedAt: toIsoLocal(dateAt(0, 8, 0)),
    },
    {
      id: ahmed.id,
      dates: [
        {
          id: `${dateOnlyOffset(2)}-18:00`,
          startAt: `${dateOnlyOffset(2)}T18:00:00`,
          endAt: `${dateOnlyOffset(2)}T19:00:00`,
        },
      ],
      createdAt: toIsoLocal(dateAt(0, 8, 15)),
      updatedAt: toIsoLocal(dateAt(0, 8, 15)),
    },
  ];

  writeJson("trips.json", trips);
  writeJson("reservations.json", reservations);
  writeJson("notifications.json", notifications);
  writeJson("reviews.json", reviews);
  writeJson("drafts.json", drafts);
  writeJson("driver_finance_accounts.json", driverFinanceAccounts);
  writeJson("indisponibilities.json", indisponibilities);

  console.log("Seed termine");
  console.log(`- ${users.length} utilisateurs conserves`);
  console.log(`- ${vehicles.length} vehicules conserves`);
  console.log(`- ${trips.length} trajets regeneres`);
  console.log(`- ${reservations.length} reservations regenerees`);
  console.log(`- ${notifications.length} notifications regenerees`);
  console.log(`- ${reviews.length} avis regeneres`);
  console.log(`- ${drafts.length} brouillons regeneres`);
  console.log(`- ${driverFinanceAccounts.length} comptes finance conducteur regeneres`);
  console.log(`- ${indisponibilities.length} indisponibilites regenerees`);
  console.log(`- ${bankAccounts.length} comptes bancaires conserves`);
  console.log(`- ${favoritePlaces.length} favoris conserves`);
  console.log(`- ${astuces.length} astuces conservees`);
  console.log(`- ${goTasks.length} GoTasks conserves`);
  console.log(`- ${affinites.length} affinites conservees`);
}

seed();
