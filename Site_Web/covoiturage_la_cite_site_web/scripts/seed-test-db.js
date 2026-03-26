#!/usr/bin/env node

const {
  LOCATIONS,
  readJson,
  writeJson,
  toDateOnly,
  toIso,
  dateAt,
  timePlusMinutes,
  approxDistanceKm,
  buildPolyline,
  buildUserPreferences,
  buildDriverFinanceAccounts,
  buildPassengerFinanceAccounts,
  buildBankAccounts,
  buildUserStats,
} = require("./test-db-utils");

// Configuration de seed avec des volumes augmentes de facon coherente
const SEED_CONFIG = {
  driverCount: 12,           // 4 → 12 (3x plus de conducteurs)
  passengerCount: 20,        // 6 → 20 (3x plus de passagers)
  adminCount: 2,             // 1 → 2 (proportionnel a l'augmentation)
  tripCount: 80,             // 24 → 80 (3x plus de trajets)
  draftsPerDriver: 4,        // 3 → 4 (plus de brouillons par conducteur)
  maxReviewReservationCount: 25,        // 8 → 25 (augmente avec plus de trajets)
  maxConfirmedReservationNotifications: 15,  // 5 → 15 (proportionnel)
  maxReviewNotifications: 12,           // 4 → 12 (3x plus)
  maxMessageReservationThreads: 35,     // 12 → 35 (proportionnel aux reservations)
  penaltyCount: 6,           // 2 → 6 (3x plus de penalites)
  indisponibilityRangesPerUser: 2,      // 1 → 2 (plus de plages d'indisponibilite)
};

const FIRST_NAMES = ["Sophie", "Ahmed", "Marie", "Jean-Paul", "Nadia", "Kevin", "Fatima", "Louis", "Sara", "Olivier", "Maya", "Karim", "Camille", "Samir", "Noemie", "Youssef"];
const LAST_NAMES = ["Leclerc", "Ibrahim", "Tremblay", "Gagnon", "Bouchard", "Roy", "Benali", "Pelletier", "Cote", "Nguyen", "Lavoie", "Diallo", "Germain", "Moreau", "Lefebvre", "Haddad"];
const VEHICLE_MAKES = [
  { make: "Toyota", models: ["Corolla", "Prius", "Camry"] },
  { make: "Honda", models: ["Civic", "Accord", "CR-V"] },
  { make: "Hyundai", models: ["Elantra", "Kona", "Tucson"] },
  { make: "Mazda", models: ["Mazda3", "CX-5"] },
  { make: "Kia", models: ["Forte", "Seltos", "Sportage"] },
  { make: "Nissan", models: ["Sentra", "Rogue"] },
];
const VEHICLE_COLORS = ["Gris perle", "Bleu nuit", "Noir", "Blanc glacier", "Rouge bordeaux", "Argent", "Vert foret"];
const BADGE_SETS = {
  driverStrong: ["BADGE-VETERAN", "BADGE-ECO-CHAMPION", "BADGE-SUPER-DRIVER"],
  driverRegular: ["BADGE-VETERAN", "BADGE-ECO-CHAMPION"],
  passengerRegular: ["BADGE-FIRST-TRIP", "BADGE-GREEN-COMMUTER"],
  passengerLight: ["BADGE-FIRST-TRIP"],
};

function createWaypoint(location) {
  return {
    order: 1,
    location: {
      label: location.label,
      fullAddress: location.fullAddress,
      coordinates: { lat: location.lat, lng: location.lng },
      instructions: location.instructions,
    },
  };
}

function pickWaypointLocation(route, index) {
  const candidateIndexes = [
    (route[0] + route[1] + index) % LOCATIONS.length,
    (route[0] + index + 3) % LOCATIONS.length,
    (route[1] + index + 5) % LOCATIONS.length,
  ];

  const uniqueCandidates = [...new Set(candidateIndexes)];
  const selectedIndex = uniqueCandidates.find((candidateIndex) => candidateIndex !== route[0] && candidateIndex !== route[1]);
  return typeof selectedIndex === "number" ? LOCATIONS[selectedIndex] : null;
}

function buildUsers(now) {
  const users = [];
  let userIndex = 1;

  const createCommonUser = (roleIndex, role) => {
    const firstName = FIRST_NAMES[roleIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[roleIndex % LAST_NAMES.length];
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
    const createdAt = toIso(dateAt(now, -(220 - roleIndex * 9), 8 + (roleIndex % 4), 0));
    const updatedAt = toIso(dateAt(now, -(5 + (roleIndex % 12)), 9 + (roleIndex % 6), 15));
    const id = `USR-2026-${String(userIndex++).padStart(5, "0")}`;
    const matricule = 2755000 + roleIndex * 37;

    return {
      id,
      email: `${matricule}@collegelacite.ca`,
      firstName,
      lastName,
      initials,
      avatarUrl: null,
      phone: `+1 (613) 555-${String(101 + roleIndex * 7).padStart(4, "0")}`,
      role,
      createdAt,
      updatedAt,
    };
  };

  for (let index = 0; index < SEED_CONFIG.driverCount; index += 1) {
    const common = createCommonUser(index, "driver");
    users.push({
      ...common,
      canBeDriver: true,
      profileVerified: true,
      isActive: true,
      driverProfile: {
        validationStatus: "approved",
        reputationPoints: 640 + index * 55,
        averageRating: Number((4.6 + ((index + 1) % 3) * 0.1).toFixed(1)),
        totalTripsAsDriver: 28 + index * 17,
        co2SavedKg: Number((128.5 + index * 41.3).toFixed(1)),
        cancellationRate: Number((0.02 + (index % 3) * 0.01).toFixed(2)),
        punctualityScore: 90 + (index % 5) * 2,
        noShowCount: index % 2,
      },
      passengerProfile: {
        averageRating: Number((4.7 + (index % 2) * 0.1).toFixed(1)),
        totalTripsAsPassenger: 6 + index * 3,
        co2SavedKg: Number((18.4 + index * 6.8).toFixed(1)),
        punctualityScore: 92 + (index % 4) * 2,
        noShowCount: 0,
      },
      preferences: {
        musicAccepted: index % 3 !== 1,
        petsAccepted: index % 4 === 2,
        smokingAccepted: false,
        conversationLevel: index % 3 === 0 ? "moderate" : index % 3 === 1 ? "quiet" : "chatty",
      },
      goScore: 680 + index * 75,
      badgeIds: index % 2 === 0 ? BADGE_SETS.driverStrong : BADGE_SETS.driverRegular,
      preferencesId: `PREF-2026-${String(index + 1).padStart(5, "0")}`,
    });
  }

  for (let index = 0; index < SEED_CONFIG.passengerCount; index += 1) {
    const common = createCommonUser(SEED_CONFIG.driverCount + index, "passenger");
    users.push({
      ...common,
      canBeDriver: index % 3 === 0,
      profileVerified: index % 5 !== 4,
      isActive: true,
      driverProfile: null,
      passengerProfile: {
        averageRating: Number((4.3 + (index % 4) * 0.2).toFixed(1)),
        totalTripsAsPassenger: 8 + index * 5,
        co2SavedKg: Number((24.2 + index * 11.7).toFixed(1)),
        punctualityScore: 82 + (index % 6) * 3,
        noShowCount: index % 4 === 0 ? 1 : 0,
      },
      preferences: {
        musicAccepted: index % 4 !== 1,
        petsAccepted: index % 3 === 0,
        smokingAccepted: false,
        conversationLevel: index % 3 === 0 ? "moderate" : index % 3 === 1 ? "quiet" : "chatty",
      },
      goScore: 420 + index * 42,
      badgeIds: index % 2 === 0 ? BADGE_SETS.passengerRegular : BADGE_SETS.passengerLight,
      preferencesId: `PREF-2026-${String(SEED_CONFIG.driverCount + index + 1).padStart(5, "0")}`,
    });
  }

  for (let index = 0; index < SEED_CONFIG.adminCount; index += 1) {
    const common = createCommonUser(SEED_CONFIG.driverCount + SEED_CONFIG.passengerCount + index, "admin");
    users.push({
      ...common,
      canBeDriver: true,
      profileVerified: false,
      isActive: true,
      driverProfile: null,
      passengerProfile: {
        averageRating: 4.5,
        totalTripsAsPassenger: 12 + index * 4,
        co2SavedKg: Number((38.5 + index * 5.2).toFixed(1)),
        punctualityScore: 80 + index * 2,
        noShowCount: 0,
      },
      preferences: {
        musicAccepted: true,
        petsAccepted: false,
        smokingAccepted: false,
        conversationLevel: "chatty",
      },
      goScore: 300 + index * 15,
      badgeIds: BADGE_SETS.passengerLight,
      preferencesId: null,
    });
  }

  return users;
}

function buildVehicles(drivers, now) {
  return drivers.map((driver, index) => {
    const family = VEHICLE_MAKES[index % VEHICLE_MAKES.length];
    const model = family.models[index % family.models.length];
    return {
      id: `VEH-2026-${String(index + 1).padStart(5, "0")}`,
      driverId: driver.id,
      make: family.make,
      model,
      year: 2019 + (index % 6),
      color: VEHICLE_COLORS[index % VEHICLE_COLORS.length],
      licensePlate: `${driver.lastName.slice(0, 4).toUpperCase()} ${2019 + (index % 6)}`,
      maxSeats: index % 3 === 0 ? 5 : 4,
      photoUrl: null,
      isActive: true,
      isValidated: true,
      createdAt: toIso(dateAt(now, -(200 - index * 8), 8, 10)),
      updatedAt: toIso(dateAt(now, -(10 - (index % 5)), 8, 10)),
    };
  });
}

function buildTripPlans(drivers) {
  const basePlans = [
    { dayOffset: -12, hour: 7, minute: 45, status: "completed", maxPassengers: 2, price: 6, route: [0, 1], reservationStatuses: ["completed", "completed"], recurrent: true },
    { dayOffset: -11, hour: 17, minute: 10, status: "completed", maxPassengers: 2, price: 7, route: [1, 0], reservationStatuses: ["completed"], recurrent: true },
    { dayOffset: -9, hour: 8, minute: 0, status: "completed", maxPassengers: 2, price: 5, route: [0, 6], reservationStatuses: ["completed"], recurrent: false },
    { dayOffset: -8, hour: 18, minute: 0, status: "cancelled", maxPassengers: 2, price: 8, route: [2, 5], reservationStatuses: ["cancelled"], recurrent: false },
    { dayOffset: -7, hour: 7, minute: 30, status: "completed", maxPassengers: 2, price: 6, route: [5, 0], reservationStatuses: ["completed", "completed"], recurrent: true },
    { dayOffset: -6, hour: 16, minute: 50, status: "completed", maxPassengers: 2, price: 7, route: [7, 2], reservationStatuses: ["completed"], recurrent: false },
    { dayOffset: -5, hour: 8, minute: 15, status: "completed", maxPassengers: 2, price: 5, route: [0, 9], reservationStatuses: ["completed"], recurrent: true },
    { dayOffset: -4, hour: 17, minute: 25, status: "completed", maxPassengers: 2, price: 7, route: [4, 0], reservationStatuses: ["completed", "completed"], recurrent: false },
    { dayOffset: -3, hour: 7, minute: 50, status: "completed", maxPassengers: 2, price: 6, route: [0, 7], reservationStatuses: ["completed"], recurrent: true },
    { dayOffset: -2, hour: 17, minute: 35, status: "completed", maxPassengers: 2, price: 7, route: [3, 5], reservationStatuses: ["completed"], recurrent: false },
    { dayOffset: -1, hour: 8, minute: 20, status: "completed", maxPassengers: 2, price: 5, route: [9, 0], reservationStatuses: ["completed"], recurrent: true },
    { dayOffset: 0, hour: 12, minute: 0, status: "in_progress", maxPassengers: 2, price: 6, route: [0, 1], reservationStatuses: ["in_progress"], recurrent: false },
    { dayOffset: 1, hour: 7, minute: 40, status: "published", maxPassengers: 3, price: 5, route: [0, 1], reservationStatuses: ["pending"], recurrent: true },
    { dayOffset: 1, hour: 17, minute: 20, status: "published", maxPassengers: 3, price: 8, route: [1, 0], reservationStatuses: [], recurrent: true },
    { dayOffset: 2, hour: 8, minute: 10, status: "confirmed", maxPassengers: 3, price: 5, route: [0, 6], reservationStatuses: ["confirmed"], recurrent: true },
    { dayOffset: 2, hour: 17, minute: 45, status: "full", maxPassengers: 2, price: 7, route: [6, 0], reservationStatuses: ["confirmed", "confirmed"], recurrent: false },
    { dayOffset: 3, hour: 7, minute: 35, status: "published", maxPassengers: 3, price: 5, route: [0, 7], reservationStatuses: ["pending", "refused"], recurrent: true },
    { dayOffset: 3, hour: 18, minute: 10, status: "published", maxPassengers: 3, price: 8, route: [2, 4], reservationStatuses: [], recurrent: false },
    { dayOffset: 4, hour: 8, minute: 5, status: "confirmed", maxPassengers: 3, price: 6, route: [0, 9], reservationStatuses: ["confirmed", "confirmed"], recurrent: true },
    { dayOffset: 5, hour: 17, minute: 5, status: "published", maxPassengers: 3, price: 7, route: [9, 0], reservationStatuses: ["pending"], recurrent: false },
    { dayOffset: 6, hour: 7, minute: 55, status: "full", maxPassengers: 2, price: 6, route: [0, 1], reservationStatuses: ["confirmed", "confirmed"], recurrent: true },
    { dayOffset: 7, hour: 17, minute: 30, status: "published", maxPassengers: 3, price: 8, route: [7, 6], reservationStatuses: [], recurrent: false },
    { dayOffset: 9, hour: 8, minute: 25, status: "cancelled", maxPassengers: 2, price: 6, route: [4, 0], reservationStatuses: ["cancelled"], recurrent: false },
    { dayOffset: 10, hour: 17, minute: 40, status: "published", maxPassengers: 3, price: 7, route: [3, 8], reservationStatuses: ["pending"], recurrent: false },
  ];

  return Array.from({ length: SEED_CONFIG.tripCount }, (_, index) => {
    const template = basePlans[index % basePlans.length];
    const cycle = Math.floor(index / basePlans.length);
    return {
      ...template,
      id: `TRJ-2026-${String(index + 1).padStart(5, "0")}`,
      driver: drivers[index % drivers.length],
      dayOffset: template.dayOffset + cycle * 14,
    };
  });
}

function seed() {
  const now = new Date();
  const badges = readJson("badges.json");
  const users = buildUsers(now);
  const drivers = users.filter((user) => user.role === "driver");
  const vehicles = buildVehicles(drivers, now);

  const vehicleByDriver = new Map(vehicles.map((vehicle) => [vehicle.driverId, vehicle]));
  const passengers = users.filter((user) => user.passengerProfile && user.role !== "admin");

  if (drivers.length < 2) {
    throw new Error("Le seed a besoin d'au moins deux conducteurs avec vehicule.");
  }

  const tripPlans = buildTripPlans(drivers);
  const tripMap = new Map();

  const trips = tripPlans.map((plan, index) => {
    const from = LOCATIONS[plan.route[0]];
    const to = LOCATIONS[plan.route[1]];
    const waypointLocation = index % 4 === 0 ? pickWaypointLocation(plan.route, index) : null;
    const waypoints = waypointLocation ? [createWaypoint(waypointLocation)] : [];
    const pathPoints = [from, ...(waypointLocation ? [waypointLocation] : []), to];
    const distanceKm = approxDistanceKm(pathPoints);
    const estimatedDurationMinutes = Math.max(20, Math.round(distanceKm * 2.3));
    const departureDate = toDateOnly(dateAt(now, plan.dayOffset, plan.hour, plan.minute));
    const departureTime = `${String(plan.hour).padStart(2, "0")}:${String(plan.minute).padStart(2, "0")}`;
    const trip = {
      id: plan.id,
      driverId: plan.driver.id,
      vehicleId: vehicleByDriver.get(plan.driver.id).id,
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
      waypoints,
      polyline: buildPolyline(from, to, waypointLocation ? [waypointLocation] : []),
      departureDate,
      departureTime,
      estimatedArrivalTime: timePlusMinutes(departureTime, estimatedDurationMinutes),
      maxPassengers: plan.maxPassengers,
      currentPassengers: 0,
      pricePerPassenger: plan.price,
      paymentMethod: index % 2 === 0 ? "interac" : "cash",
      status: plan.status,
      departureType: "planned",
      tripType: plan.recurrent ? "recurrent" : "unique",
      preferences: {
        baggageAllowed: true,
        petsAllowed: index % 5 === 0,
        smokingAllowed: false,
        musicAllowed: plan.driver.preferences?.musicAccepted ?? true,
        flexibleItinerary: index % 3 === 0,
        conversationLevel: plan.driver.preferences?.conversationLevel ?? "moderate",
        driverNote: index % 2 === 0
          ? "Merci d'etre pret 5 minutes avant le depart."
          : "Trajet calme privilegie et communication simple.",
      },
      recurrenceDays: plan.recurrent ? [1, 2, 3, 4, 5] : undefined,
      recurrenceEndDate: plan.recurrent ? toDateOnly(dateAt(now, 45, 8, 0)) : undefined,
      estimatedDistanceKm: distanceKm,
      estimatedDurationMinutes,
      co2SavedKg: Number((distanceKm * 0.42).toFixed(1)),
      createdAt: toIso(dateAt(now, plan.dayOffset - 10, 9, 0)),
      updatedAt: toIso(dateAt(now, plan.dayOffset - 1, 18, 0)),
      notes: index % 4 === 0 ? "Trajet seed coherent pour tests." : "",
    };

    tripMap.set(trip.id, trip);
    return trip;
  });

  const confirmedStatuses = new Set(["confirmed", "in_progress", "completed", "no_show"]);
  const reservations = [];
  let reservationIndex = 1;

  tripPlans.forEach((plan, tripIndex) => {
    const trip = tripMap.get(plan.id);
    const candidates = passengers.filter((user) => user.id !== trip.driverId);

    plan.reservationStatuses.forEach((status, reservationOffset) => {
      const passenger = candidates[reservationOffset % candidates.length];
      const createdAt = toIso(dateAt(now, plan.dayOffset - 2, 9 + reservationOffset, 15));
      const updatedAt = toIso(dateAt(now, plan.dayOffset - 1, 11 + reservationOffset, 5));
      const reservation = {
        id: `RSV-2026-${String(reservationIndex++).padStart(5, "0")}`,
        tripId: trip.id,
        passengerId: passenger.id,
        driverId: trip.driverId,
        status,
        pricePerSeat: trip.pricePerPassenger,
        totalAmount: trip.pricePerPassenger,
        requestedAt: createdAt,
        expiresAt: toIso(dateAt(now, plan.dayOffset + 1, 23, 0)),
        confirmedAt: confirmedStatuses.has(status) ? updatedAt : null,
        cancelledAt: status === "cancelled" ? updatedAt : null,
        completedAt: status === "completed" ? toIso(dateAt(now, plan.dayOffset, plan.hour + 1, plan.minute)) : null,
        passengerMessage: status === "pending"
          ? "Bonjour, je suis ponctuel et leger en bagages."
          : status === "confirmed"
            ? "Je confirme ma presence pour ce trajet."
            : "Merci pour le trajet.",
        refusalReason: status === "refused" ? "Le conducteur a retenu un autre profil pour ce trajet." : null,
        cancellationReason: status === "cancelled" ? "Annulee par le passager" : null,
        boardingConfirmedByDriver: status === "in_progress" || status === "completed",
        boardingConfirmedByPassenger: status === "in_progress" || status === "completed",
        compatibilityScore: 76 + ((tripIndex + reservationOffset) % 18),
        createdAt,
        updatedAt,
      };

      reservations.push(reservation);
    });
  });

  trips.forEach((trip) => {
    const confirmedPassengers = reservations
      .filter((reservation) => reservation.tripId === trip.id && confirmedStatuses.has(reservation.status))
      .map((reservation) => reservation.passengerId);
    trip.passengerIds = confirmedPassengers;
    trip.currentPassengers = confirmedPassengers.length;
  });

  const completedReservations = reservations.filter((reservation) => reservation.status === "completed");
  const reviews = completedReservations.slice(0, SEED_CONFIG.maxReviewReservationCount).flatMap((reservation, reviewIndex) => {
    const trip = tripMap.get(reservation.tripId);
    return [
      {
        id: `REV-2026-${String(reviewIndex * 2 + 1).padStart(5, "0")}`,
        tripId: reservation.tripId,
        reservationId: reservation.id,
        reviewerId: reservation.passengerId,
        revieweeId: reservation.driverId,
        revieweeRole: "driver",
        rating: 4.3 + ((reviewIndex + 1) % 3) * 0.2,
        comment: "Trajet fiable, propre et ponctuel.",
        tags: ["ponctuel", "respectueux", "securitaire"],
        createdAt: reservation.completedAt || reservation.updatedAt,
      },
      {
        id: `REV-2026-${String(reviewIndex * 2 + 2).padStart(5, "0")}`,
        tripId: reservation.tripId,
        reservationId: reservation.id,
        reviewerId: reservation.driverId,
        revieweeId: reservation.passengerId,
        revieweeRole: "passenger",
        rating: 4.4 + (reviewIndex % 2) * 0.3,
        comment: "Passager ponctuel et agreable a bord.",
        tags: ["ponctuel", "courtois", "fiable"],
        createdAt: reservation.completedAt || reservation.updatedAt,
      },
    ];
  });

  const drafts = drivers.flatMap((driver, driverIndex) => (
    Array.from({ length: SEED_CONFIG.draftsPerDriver }, (_, draftIndex) => {
      const from = LOCATIONS[(driverIndex * 3 + draftIndex) % LOCATIONS.length];
      const to = LOCATIONS[(driverIndex * 3 + draftIndex + 4) % LOCATIONS.length];
      return {
        id: `DRF-2026-${String(driverIndex * 3 + draftIndex + 1).padStart(5, "0")}`,
        driverId: driver.id,
        departureLocation: `${from.label}, ${from.fullAddress}`,
        arrivalLocation: `${to.label}, ${to.fullAddress}`,
        departureDate: toDateOnly(dateAt(now, 6 + draftIndex + driverIndex, 8 + draftIndex, 0)),
        departureTime: `${String(8 + draftIndex).padStart(2, "0")}:${draftIndex === 2 ? "30" : "00"}`,
        vehicleId: vehicleByDriver.get(driver.id).id,
        maxPassengers: 3,
        availableSeats: 2 + (draftIndex % 2),
        pricePerPassenger: 5 + draftIndex + driverIndex,
        paymentMethod: draftIndex % 2 === 0 ? "interac" : "cash",
        preferences: {
          baggageAllowed: true,
          petsAllowed: false,
          smokingAllowed: false,
          musicAllowed: driver.preferences?.musicAccepted ?? true,
          flexibleItinerary: draftIndex % 2 === 0,
        },
        departureCoords: [from.lat, from.lng],
        arrivalCoords: [to.lat, to.lng],
        polyline: buildPolyline(from, to),
        notes: "Brouillon seed coherent pour les tests.",
        createdAt: toIso(dateAt(now, -1, 14, driverIndex + draftIndex)),
        updatedAt: toIso(dateAt(now, 0, 9, driverIndex + draftIndex)),
      };
    })
  ));

  const pendingReservations = reservations.filter((reservation) => reservation.status === "pending");
  const notifications = [
    ...pendingReservations.map((reservation, index) => {
      const trip = tripMap.get(reservation.tripId);
      const passenger = users.find((user) => user.id === reservation.passengerId);
      return {
        id: `NTF-2026-${String(index + 1).padStart(5, "0")}`,
        userId: reservation.driverId,
        type: "reservation_received",
        title: "Nouvelle demande de reservation",
        message: `${passenger.firstName} ${passenger.lastName} souhaite rejoindre votre trajet ${trip.departure.label} -> ${trip.arrival.label}.`,
        isRead: index % 2 === 1,
        isImportant: true,
        link: `/driver/reservations/${reservation.driverId}`,
        relatedTripId: reservation.tripId,
        relatedReservationId: reservation.id,
        createdAt: reservation.createdAt,
      };
    }),
    ...reservations
      .filter((reservation) => reservation.status === "confirmed")
      .slice(0, SEED_CONFIG.maxConfirmedReservationNotifications)
      .map((reservation, index) => ({
        id: `NTF-2026-${String(pendingReservations.length + index + 1).padStart(5, "0")}`,
        userId: reservation.passengerId,
        type: "reservation_accepted",
        title: "Reservation confirmee",
        message: "Votre place est confirmee. Merci d'arriver quelques minutes avant le depart.",
        isRead: false,
        isImportant: true,
        link: `/passenger/reservations/${reservation.passengerId}`,
        relatedTripId: reservation.tripId,
        relatedReservationId: reservation.id,
        createdAt: reservation.updatedAt,
      })),
    ...reservations
      .filter((reservation) => reservation.status === "refused")
      .map((reservation, index) => ({
        id: `NTF-2026-${String(pendingReservations.length + SEED_CONFIG.maxConfirmedReservationNotifications + 1 + index).padStart(5, "0")}`,
        userId: reservation.passengerId,
        type: "reservation_refused",
        title: "Reservation refusee",
        message: reservation.refusalReason,
        isRead: true,
        isImportant: false,
        link: `/passenger/reservations/${reservation.passengerId}`,
        relatedTripId: reservation.tripId,
        relatedReservationId: reservation.id,
        createdAt: reservation.updatedAt,
      })),
    ...reviews.slice(0, SEED_CONFIG.maxReviewNotifications).map((review, index) => ({
      id: `NTF-2026-${String(pendingReservations.length + SEED_CONFIG.maxConfirmedReservationNotifications + 1 + reservations.filter((reservation) => reservation.status === "refused").length + index).padStart(5, "0")}`,
      userId: review.revieweeId,
      type: "new_review_received",
      title: "Nouvel avis recu",
      message: "Un nouvel avis a ete ajoute apres votre dernier trajet.",
      isRead: false,
      isImportant: false,
      link: `/${users.find((user) => user.id === review.revieweeId)?.role || "driver"}/${review.revieweeId}`,
      relatedTripId: review.tripId,
      relatedReservationId: review.reservationId,
      createdAt: review.createdAt,
    })),
    {
      id: "NTF-2026-99999",
      userId: drivers[0].id,
      type: "system",
      title: "Base de test regeneree",
      message: "Les donnees dynamiques ont ete regenerees avec plus de volume et des dependances coherentes.",
      isRead: true,
      isImportant: false,
      link: null,
      relatedTripId: null,
      relatedReservationId: null,
      createdAt: toIso(now),
    },
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const messages = reservations
    .filter((reservation) => ["pending", "confirmed", "in_progress", "completed"].includes(reservation.status))
    .slice(0, SEED_CONFIG.maxMessageReservationThreads)
    .flatMap((reservation, index) => {
      const trip = tripMap.get(reservation.tripId);
      return [
        {
          id: `MSG-2026-${String(index * 2 + 1).padStart(5, "0")}`,
          tripId: reservation.tripId,
          senderId: reservation.passengerId,
          recipientId: reservation.driverId,
          content: reservation.passengerMessage,
          type: "text",
          isRead: reservation.status !== "pending",
          readAt: reservation.status !== "pending" ? reservation.updatedAt : undefined,
          createdAt: reservation.createdAt,
        },
        {
          id: `MSG-2026-${String(index * 2 + 2).padStart(5, "0")}`,
          tripId: reservation.tripId,
          senderId: reservation.driverId,
          recipientId: reservation.passengerId,
          content: reservation.status === "in_progress"
            ? "Je suis en route. On se rejoint au point de rendez-vous."
            : `Merci, le trajet ${trip.departure.label} -> ${trip.arrival.label} est bien pris en charge.`,
          type: "text",
          isRead: reservation.status === "completed",
          readAt: reservation.status === "completed" ? reservation.updatedAt : undefined,
          createdAt: reservation.updatedAt,
        },
      ];
    });

  const penaltyTemplates = [
    {
      id: "PEN-2026-00001",
      userId: drivers[1].id,
      trajetId: trips.find((trip) => trip.status === "cancelled").id,
      type: "annulation_tardive",
      montant: 12.5,
      raison: "Annulation tardive d'un trajet confirme.",
      statut: "active",
      createdAt: toIso(dateAt(now, -1, 19, 0)),
      updatedAt: toIso(dateAt(now, -1, 19, 0)),
    },
    {
      id: "PEN-2026-00002",
      userId: drivers[0].id,
      trajetId: trips.find((trip) => trip.status === "completed").id,
      type: "retard_depart",
      montant: 4.5,
      raison: "Retard signale sur un trajet precedent.",
      statut: "prelevee",
      createdAt: toIso(dateAt(now, -6, 8, 0)),
      updatedAt: toIso(dateAt(now, -5, 9, 0)),
    },
    {
      id: "PEN-2026-00003",
      userId: drivers[0].id,
      trajetId: trips.find((trip) => trip.status === "published")?.id || trips[0].id,
      type: "non_confirmation",
      montant: 6,
      raison: "Confirmation tardive du statut du trajet.",
      statut: "contestee",
      createdAt: toIso(dateAt(now, 1, 10, 0)),
      updatedAt: toIso(dateAt(now, 1, 10, 30)),
    },
    {
      id: "PEN-2026-00004",
      userId: drivers[1].id,
      trajetId: trips.find((trip) => trip.status === "full")?.id || trips[1].id,
      type: "litige_service",
      montant: 8.5,
      raison: "Litige en verification suite a un signalement passager.",
      statut: "active",
      createdAt: toIso(dateAt(now, 2, 14, 0)),
      updatedAt: toIso(dateAt(now, 2, 14, 0)),
    },
  ];
  const penalites = penaltyTemplates.slice(0, Math.max(0, SEED_CONFIG.penaltyCount));

  const userPreferences = buildUserPreferences(users, now);
  const driverFinanceAccounts = buildDriverFinanceAccounts(drivers, reservations, penalites, now);
  const passengerFinanceAccounts = buildPassengerFinanceAccounts(passengers, reservations, tripMap, now);
  const bankAccounts = buildBankAccounts(users, driverFinanceAccounts, passengerFinanceAccounts, now);
  const userStats = buildUserStats(users, trips, reservations, reviews, badges, now);

  const indisponibilities = users
    .filter((user) => user.role !== "admin")
    .map((user, index) => ({
      id: user.id,
      dates: Array.from({ length: SEED_CONFIG.indisponibilityRangesPerUser }, (_, rangeIndex) => {
        const dayOffset = 12 + index + rangeIndex * 3;
        const startHour = 8 + ((index + rangeIndex) % 6);
        return {
          id: `${toDateOnly(dateAt(now, dayOffset, 0, 0))}-${String(startHour).padStart(2, "0")}:00`,
          startAt: `${toDateOnly(dateAt(now, dayOffset, 0, 0))}T${String(startHour).padStart(2, "0")}:00:00`,
          endAt: `${toDateOnly(dateAt(now, dayOffset, 0, 0))}T${String(startHour + 1).padStart(2, "0")}:15:00`,
        };
      }),
      createdAt: toIso(now),
      updatedAt: toIso(now),
    }));

  writeJson("trips.json", trips);
  writeJson("users.json", users);
  writeJson("vehicles.json", vehicles);
  writeJson("reservations.json", reservations);
  writeJson("notifications.json", notifications);
  writeJson("reviews.json", reviews);
  writeJson("drafts.json", drafts);
  writeJson("driver_finance_accounts.json", driverFinanceAccounts);
  writeJson("passenger_finance_accounts.json", passengerFinanceAccounts);
  writeJson("bank_accounts.json", bankAccounts);
  writeJson("user_preferences.json", userPreferences);
  writeJson("user_stats.json", userStats);
  writeJson("messages.json", messages);
  writeJson("penalites.json", penalites);
  writeJson("indisponibilities.json", indisponibilities);

  console.log("seed-test-db termine");
  console.log(`- ${users.length} utilisateurs regeneres`);
  console.log(`- ${vehicles.length} vehicules regeneres`);
  console.log(`- ${trips.length} trajets regeneres`);
  console.log(`- ${reservations.length} reservations regenerees`);
  console.log(`- ${notifications.length} notifications regenerees`);
  console.log(`- ${reviews.length} avis regeneres`);
  console.log(`- ${drafts.length} brouillons regeneres`);
  console.log(`- ${messages.length} messages regeneres`);
  console.log(`- ${penalites.length} penalites regenerees`);
  console.log(`- ${driverFinanceAccounts.length} comptes conducteur regeneres`);
  console.log(`- ${passengerFinanceAccounts.length} comptes passager regeneres`);
  console.log(`- ${bankAccounts.length} comptes bancaires regeneres`);
  console.log(`- ${userPreferences.length} preferences utilisateur regenerees`);
  console.log(`- ${userStats.length} statistiques utilisateur regenerees`);
  console.log(`- ${indisponibilities.length} indisponibilites regenerees`);
}

seed();
