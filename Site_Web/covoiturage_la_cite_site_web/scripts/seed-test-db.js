/* eslint-disable @typescript-eslint/no-require-imports */\n\n#!/usr/bin/env node

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
} = require("./test-db-utils.js");

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
  userActivitySessionsPerUser: 3,       // sessions d'historique par utilisateur (UserActivityModel)
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

function buildUserActivities(users, now) {
  return users
    .filter((user) => user.role !== "admin")
    .map((user, index) => {
      const sessionCount = SEED_CONFIG.userActivitySessionsPerUser;
      const connectionHistory = Array.from({ length: sessionCount }, (_, sessionIndex) => {
        const dayOffset = -(sessionIndex * 2 + (index % 3));
        const hour = 7 + ((index + sessionIndex) % 10);
        const connectedAt = toIso(dateAt(now, dayOffset, hour, 10 + (index % 40)));
        const disconnectedAt = sessionIndex > 0
          ? toIso(dateAt(now, dayOffset, hour + 1 + (sessionIndex % 3), 5))
          : undefined;
        return {
          type: "web",
          connectedAt,
          disconnectedAt,
          userAgent: "Mozilla/5.0 (seed)",
          role: user.role,
        };
      });

      // Le premier utilisateur non-admin est considere comme connecte (pour les tests SSE)
      const isConnected = index === 0;

      return {
        id: `ACT-2026-${String(index + 1).padStart(5, "0")}`,
        userId: user.id,
        accountCreatedAt: user.createdAt,
        lastSeenAt: isConnected ? toIso(now) : connectionHistory[0].connectedAt,
        isCurrentlyConnectedOnWeb: isConnected,
        isCurrentlyConnectedOnMobile: false,
        connectionHistory,
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
      passengerPrice: Math.round(plan.price * 1.15 * 100) / 100,
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

  const pendingReservations   = reservations.filter((r) => r.status === "pending");
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed").slice(0, SEED_CONFIG.maxConfirmedReservationNotifications);
  const refusedReservations   = reservations.filter((r) => r.status === "refused");
  const cancelledReservations = reservations.filter((r) => r.status === "cancelled");
  const cancelledTrips        = trips.filter((t) => t.status === "cancelled");
  const upcomingTrips         = trips.filter((t) =>
    ["published", "confirmed", "full"].includes(t.status) &&
    t.departureDate >= toDateOnly(dateAt(now, 0, 0, 0)) &&
    t.departureDate <= toDateOnly(dateAt(now, 2, 0, 0)),
  );
  const recentPublishedTrips  = trips
    .filter((t) => ["published", "confirmed", "full"].includes(t.status))
    .slice(0, 8);

  let notifCounter = 1;
  const nextNtfId = () => `NTF-2026-${String(notifCounter++).padStart(5, "0")}`;

  const notifications = [];

  // ── 1. reservation_received — conducteur reçoit chaque demande en attente ──
  pendingReservations.forEach((reservation) => {
    const trip      = tripMap.get(reservation.tripId);
    const passenger = users.find((u) => u.id === reservation.passengerId);
    const driver    = users.find((u) => u.id === reservation.driverId);
    notifications.push({
      id: nextNtfId(),
      userId: reservation.driverId,
      type: "reservation_received",
      title: "Nouvelle demande de reservation",
      message: `${passenger.firstName} ${passenger.lastName} souhaite rejoindre votre trajet ${trip.departure.label} -> ${trip.arrival.label} le ${trip.departureDate} a ${trip.departureTime}. Consultez son profil et acceptez ou refusez la demande avant expiration.`,
      isRead: false,
      isImportant: true,
      link: `/driver/${reservation.driverId}?tab=reservations&reservationId=${reservation.id}`,
      linkLabel: "Gerer la demande",
      relatedTripId: trip.id,
      relatedReservationId: reservation.id,
      tripDetails: {
        tripId: trip.id,
        departure: trip.departure.label,
        arrival: trip.arrival.label,
        date: trip.departureDate,
        time: trip.departureTime,
        price: trip.pricePerPassenger,
        availableSeats: trip.maxPassengers - trip.currentPassengers,
        estimatedDurationMinutes: trip.estimatedDurationMinutes,
      },
      reservationDetails: {
        reservationId: reservation.id,
        passengerName: `${passenger.firstName} ${passenger.lastName}`,
        passengerRating: passenger.passengerProfile?.averageRating ?? 4.5,
        passengerTripCount: passenger.passengerProfile?.totalTripsAsPassenger ?? 0,
        driverName: driver ? `${driver.firstName} ${driver.lastName}` : undefined,
      },
      createdAt: reservation.createdAt,
    });
  });

  // ── 2. reservation_sent — passager reçoit accusé de réception ──────────────
  pendingReservations.forEach((reservation) => {
    const trip      = tripMap.get(reservation.tripId);
    const driver    = users.find((u) => u.id === reservation.driverId);
    const passenger = users.find((u) => u.id === reservation.passengerId);
    notifications.push({
      id: nextNtfId(),
      userId: reservation.passengerId,
      type: "reservation_sent",
      title: "Demande envoyee avec succes",
      message: `Votre demande pour le trajet ${trip.departure.label} -> ${trip.arrival.label} le ${trip.departureDate} a ${trip.departureTime} a bien ete envoyee a ${driver ? driver.firstName + " " + driver.lastName : "le conducteur"}. Vous recevrez une notification des qu'elle sera traitee.`,
      isRead: true,
      isImportant: false,
      link: `/passenger/${reservation.passengerId}?tab=reservations&reservationId=${reservation.id}`,
      linkLabel: "Suivre ma demande",
      relatedTripId: trip.id,
      relatedReservationId: reservation.id,
      tripDetails: {
        tripId: trip.id,
        departure: trip.departure.label,
        arrival: trip.arrival.label,
        date: trip.departureDate,
        time: trip.departureTime,
        price: trip.passengerPrice,
        estimatedDurationMinutes: trip.estimatedDurationMinutes,
      },
      reservationDetails: {
        reservationId: reservation.id,
        driverName: driver ? `${driver.firstName} ${driver.lastName}` : undefined,
        passengerName: passenger ? `${passenger.firstName} ${passenger.lastName}` : undefined,
      },
      createdAt: reservation.createdAt,
    });
  });

  // ── 3. reservation_accepted — passager apprend l'acceptation ───────────────
  confirmedReservations.forEach((reservation) => {
    const trip      = tripMap.get(reservation.tripId);
    const driver    = users.find((u) => u.id === reservation.driverId);
    const passenger = users.find((u) => u.id === reservation.passengerId);
    notifications.push({
      id: nextNtfId(),
      userId: reservation.passengerId,
      type: "reservation_accepted",
      title: "Reservation confirmee !",
      message: `${driver ? driver.firstName + " " + driver.lastName : "Le conducteur"} a accepte votre demande pour le trajet ${trip.departure.label} -> ${trip.arrival.label} le ${trip.departureDate} a ${trip.departureTime}. Votre place est reservee — soyez ponctuel·le ! Prix : ${trip.passengerPrice} $.`,
      isRead: false,
      isImportant: true,
      link: `/passenger/planner/${reservation.passengerId}?tripId=${trip.id}`,
      linkLabel: "Voir mon trajet",
      relatedTripId: trip.id,
      relatedReservationId: reservation.id,
      tripDetails: {
        tripId: trip.id,
        departure: trip.departure.label,
        arrival: trip.arrival.label,
        date: trip.departureDate,
        time: trip.departureTime,
        price: trip.passengerPrice,
        availableSeats: trip.maxPassengers - trip.currentPassengers,
        estimatedDurationMinutes: trip.estimatedDurationMinutes,
      },
      reservationDetails: {
        reservationId: reservation.id,
        driverName: driver ? `${driver.firstName} ${driver.lastName}` : undefined,
        passengerName: passenger ? `${passenger.firstName} ${passenger.lastName}` : undefined,
      },
      createdAt: reservation.updatedAt,
    });
  });

  // ── 4. reservation_refused — passager apprend le refus ────────────────────
  refusedReservations.forEach((reservation) => {
    const trip   = tripMap.get(reservation.tripId);
    const driver = users.find((u) => u.id === reservation.driverId);
    notifications.push({
      id: nextNtfId(),
      userId: reservation.passengerId,
      type: "reservation_refused",
      title: "Demande non retenue",
      message: `Votre demande pour le trajet ${trip.departure.label} -> ${trip.arrival.label} le ${trip.departureDate} a ${trip.departureTime} n'a pas ete retenue par ${driver ? driver.firstName + " " + driver.lastName : "le conducteur"}. Motif : ${reservation.refusalReason || "Non specifie"}. D'autres trajets similaires sont disponibles.`,
      isRead: true,
      isImportant: false,
      link: `/passenger/search/${reservation.passengerId}`,
      linkLabel: "Trouver un autre trajet",
      relatedTripId: trip.id,
      relatedReservationId: reservation.id,
      tripDetails: {
        tripId: trip.id,
        departure: trip.departure.label,
        arrival: trip.arrival.label,
        date: trip.departureDate,
        time: trip.departureTime,
        price: trip.passengerPrice,
      },
      reservationDetails: {
        reservationId: reservation.id,
        driverName: driver ? `${driver.firstName} ${driver.lastName}` : undefined,
      },
      createdAt: reservation.updatedAt,
    });
  });

  // ── 5. reservation_cancelled — conducteur apprend l'annulation passager ────
  cancelledReservations.slice(0, 5).forEach((reservation) => {
    const trip      = tripMap.get(reservation.tripId);
    const passenger = users.find((u) => u.id === reservation.passengerId);
    const driver    = users.find((u) => u.id === reservation.driverId);
    notifications.push({
      id: nextNtfId(),
      userId: reservation.driverId,
      type: "reservation_cancelled",
      title: "Reservation annulee par le passager",
      message: `${passenger ? passenger.firstName + " " + passenger.lastName : "Un passager"} a annule sa reservation pour votre trajet ${trip.departure.label} -> ${trip.arrival.label} le ${trip.departureDate} a ${trip.departureTime}. Une place s'est liberee automatiquement.`,
      isRead: true,
      isImportant: false,
      link: `/driver/${reservation.driverId}?tab=trips&tripId=${trip.id}`,
      linkLabel: "Voir le trajet",
      relatedTripId: trip.id,
      relatedReservationId: reservation.id,
      tripDetails: {
        tripId: trip.id,
        departure: trip.departure.label,
        arrival: trip.arrival.label,
        date: trip.departureDate,
        time: trip.departureTime,
        price: trip.pricePerPassenger,
        availableSeats: trip.maxPassengers - trip.currentPassengers + 1,
      },
      reservationDetails: {
        reservationId: reservation.id,
        passengerName: passenger ? `${passenger.firstName} ${passenger.lastName}` : undefined,
        driverName: driver ? `${driver.firstName} ${driver.lastName}` : undefined,
      },
      createdAt: reservation.cancelledAt || reservation.updatedAt,
    });
  });

  // ── 6. trip_created — conducteur confirme la publication ──────────────────
  recentPublishedTrips.forEach((trip) => {
    notifications.push({
      id: nextNtfId(),
      userId: trip.driverId,
      type: "trip_created",
      title: "Trajet publie avec succes !",
      message: `Votre trajet ${trip.departure.label} -> ${trip.arrival.label} le ${trip.departureDate} a ${trip.departureTime} est maintenant visible par les passagers. Prix affiche : ${trip.passengerPrice} $ — ${trip.maxPassengers} place${trip.maxPassengers > 1 ? "s" : ""} disponible${trip.maxPassengers > 1 ? "s" : ""}.`,
      isRead: true,
      isImportant: false,
      link: `/driver/${trip.driverId}?tab=trips&tripId=${trip.id}`,
      linkLabel: "Voir mon trajet",
      relatedTripId: trip.id,
      relatedReservationId: null,
      tripDetails: {
        tripId: trip.id,
        departure: trip.departure.label,
        arrival: trip.arrival.label,
        date: trip.departureDate,
        time: trip.departureTime,
        price: trip.pricePerPassenger,
        availableSeats: trip.maxPassengers,
        estimatedDurationMinutes: trip.estimatedDurationMinutes,
      },
      createdAt: trip.createdAt,
    });
  });

  // ── 7. trip_starting_soon — conducteur + passagers (J-1) ──────────────────
  upcomingTrips.slice(0, 6).forEach((trip) => {
    const driver = users.find((u) => u.id === trip.driverId);
    notifications.push({
      id: nextNtfId(),
      userId: trip.driverId,
      type: "trip_starting_soon",
      title: "Votre trajet demarre bientot",
      message: `Rappel : votre trajet ${trip.departure.label} -> ${trip.arrival.label} est prevu le ${trip.departureDate} a ${trip.departureTime}. ${trip.currentPassengers} passager${trip.currentPassengers > 1 ? "s" : ""} attend${trip.currentPassengers > 1 ? "ent" : ""} votre depart — verifiez l'etat du trajet.`,
      isRead: false,
      isImportant: true,
      link: `/driver/${trip.driverId}?tab=trips&tripId=${trip.id}`,
      linkLabel: "Voir le trajet",
      relatedTripId: trip.id,
      relatedReservationId: null,
      tripDetails: {
        tripId: trip.id,
        departure: trip.departure.label,
        arrival: trip.arrival.label,
        date: trip.departureDate,
        time: trip.departureTime,
        price: trip.pricePerPassenger,
        availableSeats: trip.maxPassengers - trip.currentPassengers,
        estimatedDurationMinutes: trip.estimatedDurationMinutes,
      },
      createdAt: toIso(dateAt(now, -1, 18, 0)),
    });

    const confirmedPassengerIds = reservations
      .filter((r) => r.tripId === trip.id && ["confirmed", "in_progress"].includes(r.status))
      .map((r) => r.passengerId);

    confirmedPassengerIds.forEach((passengerId) => {
      notifications.push({
        id: nextNtfId(),
        userId: passengerId,
        type: "trip_starting_soon",
        title: "Votre trajet demarre bientot",
        message: `Rappel : votre trajet ${trip.departure.label} -> ${trip.arrival.label} est prevu le ${trip.departureDate} a ${trip.departureTime} avec ${driver ? driver.firstName + " " + driver.lastName : "votre conducteur"}. Soyez au point de depart quelques minutes avant l'heure.`,
        isRead: false,
        isImportant: true,
        link: `/passenger/planner/${passengerId}?tripId=${trip.id}`,
        linkLabel: "Voir mon trajet",
        relatedTripId: trip.id,
        relatedReservationId: null,
        tripDetails: {
          tripId: trip.id,
          departure: trip.departure.label,
          arrival: trip.arrival.label,
          date: trip.departureDate,
          time: trip.departureTime,
          price: trip.passengerPrice,
          estimatedDurationMinutes: trip.estimatedDurationMinutes,
        },
        createdAt: toIso(dateAt(now, -1, 18, 0)),
      });
    });
  });

  // ── 8. trip_cancelled — passagers des trajets annules ─────────────────────
  cancelledTrips.slice(0, 3).forEach((trip) => {
    const driver               = users.find((u) => u.id === trip.driverId);
    const affectedReservations = reservations.filter((r) => r.tripId === trip.id && r.status === "cancelled");
    affectedReservations.forEach((reservation) => {
      notifications.push({
        id: nextNtfId(),
        userId: reservation.passengerId,
        type: "trip_cancelled",
        title: "Trajet annule par le conducteur",
        message: `Le trajet ${trip.departure.label} -> ${trip.arrival.label} prevu le ${trip.departureDate} a ${trip.departureTime} a ete annule par ${driver ? driver.firstName + " " + driver.lastName : "le conducteur"}. Des trajets alternatifs sont disponibles sur la plateforme.`,
        isRead: true,
        isImportant: true,
        link: `/passenger/search/${reservation.passengerId}`,
        linkLabel: "Trouver un trajet alternatif",
        relatedTripId: trip.id,
        relatedReservationId: reservation.id,
        tripDetails: {
          tripId: trip.id,
          departure: trip.departure.label,
          arrival: trip.arrival.label,
          date: trip.departureDate,
          time: trip.departureTime,
          price: trip.passengerPrice,
        },
        createdAt: reservation.cancelledAt || reservation.updatedAt,
      });
    });
  });

  // ── 9. new_review_received — utilisateur reçoit un avis ───────────────────
  reviews.slice(0, SEED_CONFIG.maxReviewNotifications).forEach((review) => {
    const reviewer = users.find((u) => u.id === review.reviewerId);
    const reviewee = users.find((u) => u.id === review.revieweeId);
    const qualityLabel = review.rating >= 4.7 ? "excellent" : review.rating >= 4.0 ? "tres positif" : "positif";
    notifications.push({
      id: nextNtfId(),
      userId: review.revieweeId,
      type: "new_review_received",
      title: `Nouvel avis ${qualityLabel} recu`,
      message: `${reviewer ? reviewer.firstName + " " + reviewer.lastName : "Un utilisateur"} vous a attribue ${review.rating}/5 — « ${review.comment.slice(0, 80)}${review.comment.length > 80 ? "..." : ""} ». Votre reputation continue de progresser !`,
      isRead: false,
      isImportant: false,
      link: `/${reviewee?.role || "driver"}/${review.revieweeId}?tab=reviews&reviewId=${review.id}`,
      linkLabel: "Voir l'avis",
      relatedTripId: review.tripId,
      relatedReservationId: review.reservationId,
      reviewDetails: {
        reviewId: review.id,
        reviewerName: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : "Utilisateur",
        rating: review.rating,
        comment: review.comment.slice(0, 120),
      },
      createdAt: review.createdAt,
    });
  });

  // ── 10. cancellation_penalty — conducteur sanctionne ──────────────────────
  penalites.forEach((penalty) => {
    const trip = trips.find((t) => t.id === penalty.trajetId);
    notifications.push({
      id: nextNtfId(),
      userId: penalty.userId,
      type: "cancellation_penalty",
      title: "Penalite appliquee a votre compte",
      message: `Une penalite de ${penalty.montant} $ a ete appliquee suite a : ${penalty.raison}${trip ? ` (trajet ${trip.departure.label} -> ${trip.arrival.label})` : ""}. Statut : ${penalty.statut}. Consultez votre historique financier pour contester ou regler.`,
      isRead: penalty.statut !== "active",
      isImportant: true,
      link: `/driver/${penalty.userId}?tab=finances`,
      linkLabel: "Voir mes finances",
      relatedTripId: penalty.trajetId,
      relatedReservationId: null,
      createdAt: penalty.createdAt,
    });
  });

  // ── 11. security_alert — demonstration ────────────────────────────────────
  notifications.push({
    id: nextNtfId(),
    userId: drivers[0].id,
    type: "security_alert",
    title: "Nouvelle connexion detectee",
    message: "Une connexion a votre compte a ete effectuee depuis un nouvel appareil (Mozilla/5.0 — Ottawa, ON). Si ce n'etait pas vous, changez immediatement votre mot de passe et contactez le support.",
    isRead: false,
    isImportant: true,
    link: null,
    linkLabel: null,
    relatedTripId: null,
    relatedReservationId: null,
    securityDetails: {
      deviceInfo: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      location: "Ottawa, ON, Canada",
      connectedAt: toIso(dateAt(now, -1, 3, 15)),
    },
    createdAt: toIso(dateAt(now, -1, 3, 15)),
  });

  // ── 12. system — notification de seed ─────────────────────────────────────
  notifications.push({
    id: "NTF-2026-99999",
    userId: drivers[0].id,
    type: "system",
    title: "Base de test regeneree",
    message: "Les donnees ont ete regenerees avec un volume augmente, des dependances coherentes et des notifications enrichies pour tous les types.",
    isRead: true,
    isImportant: false,
    link: null,
    linkLabel: null,
    relatedTripId: null,
    relatedReservationId: null,
    createdAt: toIso(now),
  });

  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  const userPreferences = buildUserPreferences(users, now);
  const driverFinanceAccounts = buildDriverFinanceAccounts(drivers, reservations, penalites, now);
  const passengerFinanceAccounts = buildPassengerFinanceAccounts(passengers, reservations, tripMap, now);
  const bankAccounts = buildBankAccounts(users, driverFinanceAccounts, passengerFinanceAccounts, now);
  const userStats = buildUserStats(users, trips, reservations, reviews, badges, now);
  const userActivities = buildUserActivities(users, now);

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
  writeJson("user_activity.json", userActivities);

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
  console.log(`- ${userActivities.length} activites utilisateur regenerees`);
}

seed();
