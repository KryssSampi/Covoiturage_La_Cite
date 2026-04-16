/* eslint-disable @typescript-eslint/no-require-imports */\n\n#!/usr/bin/env node

const {
  readJson,
  writeJson,
  toIso,
  buildPolyline,
  buildUserPreferences,
  buildDriverFinanceAccounts,
  buildPassengerFinanceAccounts,
  buildBankAccounts,
  buildUserStats,
} = require("./test-db-utils");

const VALID_RESERVATION_STATUSES = new Set([
  "pending",
  "confirmed",
  "refused",
  "cancelled",
  "in_progress",
  "completed",
  "no_show",
]);

const VALID_TRIP_STATUSES = new Set([
  "draft",
  "published",
  "full",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
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

const VALID_MESSAGE_TYPES = new Set(["text", "system"]);
const VALID_PENALTY_STATUSES = new Set(["active", "prelevee", "contestee", "remboursee"]);

function unique(array) {
  return [...new Set(array)];
}

function main() {
  const now = new Date();
  const users = readJson("users.json");
  const vehicles = readJson("vehicles.json");
  const badges = readJson("badges.json");
  const trips = readJson("trips.json");
  const reservations = readJson("reservations.json");
  const notifications = readJson("notifications.json");
  const reviews = readJson("reviews.json");
  const drafts = readJson("drafts.json");
  const indisponibilities = readJson("indisponibilities.json");
  const penalites = readJson("penalites.json");
  const messages = readJson("messages.json");

  const userMap = new Map(users.map((user) => [user.id, user]));
  const vehicleMap = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  const tripMap = new Map(trips.map((trip) => [trip.id, trip]));
  const fixes = [];

  const cleanedDrafts = drafts
    .filter((draft) => {
      const keep = userMap.has(draft.driverId) && vehicleMap.has(draft.vehicleId);
      if (!keep) fixes.push(`draft supprime: ${draft.id || "sans-id"}`);
      return keep;
    })
    .map((draft, index) => {
      const vehicle = vehicleMap.get(draft.vehicleId);
      const maxPassengers = Math.max(1, Math.min(draft.maxPassengers || vehicle.maxSeats - 1, vehicle.maxSeats - 1));
      const availableSeats = Math.max(1, Math.min(draft.availableSeats || maxPassengers, maxPassengers));
      return {
        ...draft,
        id: draft.id || `DRF-2026-AUTO-${String(index + 1).padStart(4, "0")}`,
        maxPassengers,
        availableSeats,
        updatedAt: draft.updatedAt || draft.createdAt || toIso(now),
      };
    });

  const cleanedReservations = reservations
    .filter((reservation) => {
      const trip = tripMap.get(reservation.tripId);
      const keep = trip && userMap.has(reservation.passengerId) && userMap.has(trip.driverId);
      if (!keep) fixes.push(`reservation supprimee: ${reservation.id}`);
      return keep;
    })
    .map((reservation) => {
      const trip = tripMap.get(reservation.tripId);
      const status = VALID_RESERVATION_STATUSES.has(reservation.status) ? reservation.status : "cancelled";
      if (status !== reservation.status) {
        fixes.push(`reservation ${reservation.id}: statut ${reservation.status} -> ${status}`);
      }
      return {
        ...reservation,
        driverId: trip.driverId,
        status,
        pricePerSeat: typeof reservation.pricePerSeat === "number" ? reservation.pricePerSeat : trip.pricePerPassenger,
        totalAmount: typeof reservation.totalAmount === "number"
          ? reservation.totalAmount
          : (typeof reservation.pricePerSeat === "number" ? reservation.pricePerSeat : trip.pricePerPassenger),
        requestedAt: reservation.requestedAt || reservation.createdAt || toIso(now),
        expiresAt: reservation.expiresAt || reservation.updatedAt || toIso(now),
        updatedAt: reservation.updatedAt || reservation.createdAt || toIso(now),
        createdAt: reservation.createdAt || reservation.requestedAt || toIso(now),
        boardingConfirmedByDriver: ["in_progress", "completed"].includes(status),
        boardingConfirmedByPassenger: ["in_progress", "completed"].includes(status),
      };
    })
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  const confirmedStatuses = new Set(["confirmed", "in_progress", "completed", "no_show"]);
  const reservationsByTrip = new Map();
  cleanedReservations.forEach((reservation) => {
    if (!reservationsByTrip.has(reservation.tripId)) reservationsByTrip.set(reservation.tripId, []);
    reservationsByTrip.get(reservation.tripId).push(reservation);
  });

  const cleanedTrips = trips
    .filter((trip) => {
      const keep = userMap.has(trip.driverId) && vehicleMap.has(trip.vehicleId);
      if (!keep) fixes.push(`trip supprime: ${trip.id}`);
      return keep;
    })
    .map((trip) => {
      const next = { ...trip };
      const vehicle = vehicleMap.get(next.vehicleId);
      const tripReservations = reservationsByTrip.get(next.id) || [];
      const confirmedPassengers = unique(
        tripReservations
          .filter((reservation) => confirmedStatuses.has(reservation.status))
          .map((reservation) => reservation.passengerId),
      );

      next.status = VALID_TRIP_STATUSES.has(next.status) ? next.status : "published";
      next.passengerIds = confirmedPassengers;
      next.maxPassengers = Math.max(1, Math.min(next.maxPassengers || 1, (vehicle.maxSeats || 2) - 1));
      next.currentPassengers = Math.min(confirmedPassengers.length, next.maxPassengers);
      next.paymentMethod = ["cash", "interac"].includes(next.paymentMethod) ? next.paymentMethod : "cash";
      next.updatedAt = next.updatedAt || next.createdAt || toIso(now);
      next.createdAt = next.createdAt || next.updatedAt || toIso(now);
      next.polyline = Array.isArray(next.polyline) && next.polyline.length >= 2
        ? next.polyline
        : buildPolyline(
            next.departure.coordinates,
            next.arrival.coordinates,
            (next.waypoints || []).map((waypoint) => waypoint.location.coordinates),
          );
      next.waypoints = Array.isArray(next.waypoints) ? next.waypoints : [];
      next.estimatedDistanceKm = typeof next.estimatedDistanceKm === "number" ? next.estimatedDistanceKm : 0;
      next.estimatedDurationMinutes = typeof next.estimatedDurationMinutes === "number" ? next.estimatedDurationMinutes : 30;
      return next;
    });

  const cleanedTripMap = new Map(cleanedTrips.map((trip) => [trip.id, trip]));

  const cleanedNotifications = notifications
    .filter((notification) => {
      const keep = userMap.has(notification.userId);
      if (!keep) fixes.push(`notification supprimee: ${notification.id}`);
      return keep;
    })
    .map((notification) => ({
      ...notification,
      type: VALID_NOTIFICATION_TYPES.has(notification.type) ? notification.type : "system",
      relatedTripId: notification.relatedTripId && cleanedTripMap.has(notification.relatedTripId) ? notification.relatedTripId : null,
      relatedReservationId: notification.relatedReservationId && cleanedReservations.find((reservation) => reservation.id === notification.relatedReservationId)
        ? notification.relatedReservationId
        : null,
    }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const cleanedReviews = reviews.filter((review) => {
    const keep =
      cleanedTripMap.has(review.tripId) &&
      cleanedReservations.find((reservation) => reservation.id === review.reservationId) &&
      userMap.has(review.reviewerId) &&
      userMap.has(review.revieweeId);
    if (!keep) fixes.push(`review supprimee: ${review.id}`);
    return keep;
  });

  const cleanedMessages = messages
    .filter((message) => {
      const keep =
        cleanedTripMap.has(message.tripId) &&
        userMap.has(message.senderId) &&
        (!message.recipientId || userMap.has(message.recipientId));
      if (!keep) fixes.push(`message supprime: ${message.id}`);
      return keep;
    })
    .map((message) => ({
      ...message,
      type: VALID_MESSAGE_TYPES.has(message.type) ? message.type : "text",
      isRead: Boolean(message.isRead),
      createdAt: message.createdAt || toIso(now),
    }))
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  const cleanedPenalites = penalites
    .filter((penalty) => {
      const keep = userMap.has(penalty.userId) && (!penalty.trajetId || cleanedTripMap.has(penalty.trajetId));
      if (!keep) fixes.push(`penalite supprimee: ${penalty.id}`);
      return keep;
    })
    .map((penalty, index) => ({
      ...penalty,
      id: penalty.id || `PEN-2026-CLEAN-${String(index + 1).padStart(4, "0")}`,
      statut: VALID_PENALTY_STATUSES.has(penalty.statut) ? penalty.statut : "active",
      updatedAt: penalty.updatedAt || penalty.createdAt || toIso(now),
      createdAt: penalty.createdAt || penalty.updatedAt || toIso(now),
    }));

  const cleanedIndisponibilities = indisponibilities
    .filter((entry) => {
      const keep = userMap.has(entry.id);
      if (!keep) fixes.push(`indisponibilite supprimee: ${entry.id}`);
      return keep;
    })
    .map((entry) => ({
      ...entry,
      dates: Array.isArray(entry.dates)
        ? entry.dates.filter((range) => range.startAt && range.endAt)
        : [],
      updatedAt: entry.updatedAt || entry.createdAt || toIso(now),
      createdAt: entry.createdAt || entry.updatedAt || toIso(now),
    }));

  const drivers = users.filter((user) => user.role === "driver" && vehicles.find((vehicle) => vehicle.driverId === user.id));
  const passengers = users.filter((user) => user.passengerProfile && user.role !== "admin");
  const userPreferences = buildUserPreferences(users, now);
  const driverFinanceAccounts = buildDriverFinanceAccounts(drivers, cleanedReservations, cleanedPenalites, now);
  const passengerFinanceAccounts = buildPassengerFinanceAccounts(passengers, cleanedReservations, cleanedTripMap, now);
  const bankAccounts = buildBankAccounts(users, driverFinanceAccounts, passengerFinanceAccounts, now);
  const userStats = buildUserStats(users, cleanedTrips, cleanedReservations, cleanedReviews, badges, now);

  writeJson("trips.json", cleanedTrips);
  writeJson("reservations.json", cleanedReservations);
  writeJson("notifications.json", cleanedNotifications);
  writeJson("reviews.json", cleanedReviews);
  writeJson("drafts.json", cleanedDrafts);
  writeJson("indisponibilities.json", cleanedIndisponibilities);
  writeJson("messages.json", cleanedMessages);
  writeJson("penalites.json", cleanedPenalites);
  writeJson("user_preferences.json", userPreferences);
  writeJson("driver_finance_accounts.json", driverFinanceAccounts);
  writeJson("passenger_finance_accounts.json", passengerFinanceAccounts);
  writeJson("bank_accounts.json", bankAccounts);
  writeJson("user_stats.json", userStats);

  console.log("clean-test-db termine");
  console.log(`- ${fixes.length} correction(s) appliquee(s)`);
  fixes.slice(0, 25).forEach((fix) => console.log(`  * ${fix}`));
  if (fixes.length > 25) {
    console.log(`  * ... ${fixes.length - 25} autre(s) correction(s)`);
  }
  console.log(`- trips: ${cleanedTrips.length}`);
  console.log(`- reservations: ${cleanedReservations.length}`);
  console.log(`- notifications: ${cleanedNotifications.length}`);
  console.log(`- reviews: ${cleanedReviews.length}`);
  console.log(`- drafts: ${cleanedDrafts.length}`);
  console.log(`- messages: ${cleanedMessages.length}`);
  console.log(`- penalites: ${cleanedPenalites.length}`);
  console.log(`- user_preferences: ${userPreferences.length}`);
  console.log(`- user_stats: ${userStats.length}`);
}

main();
