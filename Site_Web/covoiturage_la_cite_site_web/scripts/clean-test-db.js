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

function toIso(date) {
  return `${toDateOnly(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.000Z`;
}

function tripStart(trip) {
  return new Date(`${trip.departureDate}T${trip.departureTime}:00`);
}

function tripEnd(trip) {
  const end = new Date(`${trip.departureDate}T${trip.estimatedArrivalTime || trip.departureTime}:00`);
  if (end <= tripStart(trip)) {
    end.setMinutes(end.getMinutes() + 45);
  }
  return end;
}

function unique(array) {
  return [...new Set(array)];
}

function mapReservationStatus(status) {
  if (status === "rejected") return "refused";
  return VALID_RESERVATION_STATUSES.has(status) ? status : "cancelled";
}

function mapNotificationType(type) {
  if (type === "reservation_cancelled_auto") return "reservation_cancelled";
  return VALID_NOTIFICATION_TYPES.has(type) ? type : "system";
}

function compareByCreatedAt(a, b) {
  return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
}

function recalcFinance(driverId, reservations) {
  const commission = 0.15;
  const completed = reservations.filter((reservation) => reservation.driverId === driverId && reservation.status === "completed");
  const inTransit = reservations.filter((reservation) => reservation.driverId === driverId && reservation.status === "in_progress");
  return {
    soldeDisponible: Number(completed.reduce((sum, reservation) => sum + reservation.totalAmount * (1 - commission), 0).toFixed(2)),
    soldeEnTransit: Number(inTransit.reduce((sum, reservation) => sum + reservation.totalAmount * (1 - commission), 0).toFixed(2)),
    transactions: [
      ...completed.map((reservation, index) => ({
        id: `DTXN-${driverId}-${index + 1}`,
        type: "revenu_trajet",
        montant: Number((reservation.totalAmount * (1 - commission)).toFixed(2)),
        description: `Trajet ${reservation.tripId} confirme`,
        trajetId: reservation.tripId,
        statut: "confirme",
        createdAt: reservation.completedAt || reservation.updatedAt || reservation.createdAt,
      })),
      ...inTransit.map((reservation, index) => ({
        id: `DTXN-${driverId}-TRANSIT-${index + 1}`,
        type: "revenu_trajet",
        montant: Number((reservation.totalAmount * (1 - commission)).toFixed(2)),
        description: `Trajet ${reservation.tripId} en transit`,
        trajetId: reservation.tripId,
        statut: "en_transit",
        createdAt: reservation.updatedAt || reservation.createdAt,
      })),
    ],
  };
}

function main() {
  const now = new Date();
  const today = toDateOnly(now);

  const users = readJson("users.json");
  const trips = readJson("trips.json");
  const reservations = readJson("reservations.json");
  const notifications = readJson("notifications.json");
  const reviews = readJson("reviews.json");
  const vehicles = readJson("vehicles.json");
  const drafts = readJson("drafts.json");
  const driverFinanceAccounts = readJson("driver_finance_accounts.json");
  const indisponibilities = readJson("indisponibilities.json");
  const bankAccounts = readJson("bank_accounts.json");
  const messages = readJson("messages.json");
  const penalites = readJson("penalites.json");
  const favoritePlaces = readJson("lieux_favoris.json");
  const affinites = readJson("affinites.json");
  const astuces = readJson("astuces.json");
  const goTasks = readJson("gotasks.json");

  const userMap = new Map(users.map((item) => [item.id, item]));
  const tripMap = new Map(trips.map((item) => [item.id, item]));
  const vehicleMap = new Map(vehicles.map((item) => [item.id, item]));
  const driverIds = new Set(users.filter((user) => user.role === "driver").map((user) => user.id));

  const fixes = [];

  const cleanedDrafts = drafts.filter((draft) => {
    const keep = userMap.has(draft.driverId) && vehicleMap.has(draft.vehicleId);
    if (!keep) fixes.push(`draft ${draft.id} supprime (driver/vehicle invalide)`);
    return keep;
  }).map((draft) => ({
    ...draft,
    availableSeats: Math.max(0, Math.min(draft.availableSeats ?? draft.maxPassengers - 1, (draft.maxPassengers ?? 1) - 1)),
    updatedAt: draft.updatedAt || draft.createdAt || toIso(now),
  }));

  const normalizedReservations = reservations
    .filter((reservation) => {
      const trip = tripMap.get(reservation.tripId);
      const keep =
        userMap.has(reservation.passengerId) &&
        trip &&
        userMap.has(trip.driverId);
      if (!keep) fixes.push(`reservation ${reservation.id} supprimee (reference invalide)`);
      return keep;
    })
    .map((reservation) => {
      const trip = tripMap.get(reservation.tripId);
      const next = { ...reservation };
      const mappedStatus = mapReservationStatus(next.status);
      if (mappedStatus !== next.status) {
        fixes.push(`reservation ${next.id}: statut ${next.status} -> ${mappedStatus}`);
        next.status = mappedStatus;
      }
      if (next.driverId !== trip.driverId) {
        fixes.push(`reservation ${next.id}: driverId ${next.driverId} -> ${trip.driverId}`);
        next.driverId = trip.driverId;
      }
      next.pricePerSeat = typeof next.pricePerSeat === "number" ? next.pricePerSeat : trip.pricePerPassenger;
      next.totalAmount = typeof next.totalAmount === "number" ? next.totalAmount : next.pricePerSeat;
      next.updatedAt = next.updatedAt || next.createdAt || toIso(now);
      return next;
    })
    .sort(compareByCreatedAt);

  const reservationsByTrip = new Map();
  normalizedReservations.forEach((reservation) => {
    if (!reservationsByTrip.has(reservation.tripId)) reservationsByTrip.set(reservation.tripId, []);
    reservationsByTrip.get(reservation.tripId).push(reservation);
  });

  const cleanedTrips = trips
    .filter((trip) => {
      const keep = userMap.has(trip.driverId) && vehicleMap.has(trip.vehicleId);
      if (!keep) fixes.push(`trip ${trip.id} supprime (driver/vehicle invalide)`);
      return keep;
    })
    .map((trip) => {
      const next = { ...trip };
      if (!VALID_TRIP_STATUSES.has(next.status)) {
        fixes.push(`trip ${next.id}: statut ${next.status} -> published`);
        next.status = "published";
      }

      const relatedReservations = reservationsByTrip.get(next.id) || [];
      const confirmedReservations = relatedReservations.filter((reservation) =>
        ["confirmed", "in_progress", "completed", "no_show"].includes(reservation.status),
      );
      const pendingReservations = relatedReservations.filter((reservation) => reservation.status === "pending");

      next.passengerIds = unique(confirmedReservations.map((reservation) => reservation.passengerId));
      next.currentPassengers = next.passengerIds.length;

      const start = tripStart(next);
      const end = tripEnd(next);

      if (end < now) {
        if (next.currentPassengers > 0 || relatedReservations.some((reservation) => ["in_progress", "completed"].includes(reservation.status))) {
          if (next.status !== "completed") {
            fixes.push(`trip ${next.id}: ${next.status} -> completed (trajet passe)`);
            next.status = "completed";
          }
        } else if (!["cancelled", "completed", "no_show"].includes(next.status)) {
          fixes.push(`trip ${next.id}: ${next.status} -> cancelled (trajet passe sans passager)`);
          next.status = "cancelled";
        }
      } else if (start <= now && end >= now) {
        if (next.currentPassengers > 0) {
          if (next.status !== "in_progress") {
            fixes.push(`trip ${next.id}: ${next.status} -> in_progress`);
            next.status = "in_progress";
          }
        } else if (pendingReservations.length > 0) {
          if (next.status !== "published") {
            fixes.push(`trip ${next.id}: ${next.status} -> published`);
            next.status = "published";
          }
        }
      } else if (next.currentPassengers >= next.maxPassengers) {
        if (next.status !== "full") {
          fixes.push(`trip ${next.id}: ${next.status} -> full`);
          next.status = "full";
        }
      } else if (["completed", "cancelled", "in_progress"].includes(next.status) && start >= now) {
        fixes.push(`trip ${next.id}: ${next.status} -> published (trajet futur)`);
        next.status = "published";
      } else if (!["published", "full", "confirmed", "draft"].includes(next.status)) {
        next.status = "published";
      }

      next.updatedAt = next.updatedAt || next.createdAt || toIso(now);
      return next;
    });

  const cleanedTripMap = new Map(cleanedTrips.map((trip) => [trip.id, trip]));

  const cleanedReservations = normalizedReservations.map((reservation) => {
    const next = { ...reservation };
    const trip = cleanedTripMap.get(next.tripId);
    const tripStatus = trip.status;

    if (tripStatus === "completed" && ["pending", "confirmed", "in_progress"].includes(next.status)) {
      fixes.push(`reservation ${next.id}: ${next.status} -> completed (trajet complete)`);
      next.status = "completed";
      next.completedAt = next.completedAt || toIso(new Date(tripEnd(trip)));
      next.confirmedAt = next.confirmedAt || next.createdAt || toIso(now);
      next.boardingConfirmedByDriver = true;
      next.boardingConfirmedByPassenger = true;
    } else if (tripStatus === "cancelled" && ["pending", "confirmed", "in_progress"].includes(next.status)) {
      fixes.push(`reservation ${next.id}: ${next.status} -> cancelled (trajet annule)`);
      next.status = "cancelled";
      next.cancelledAt = next.cancelledAt || toIso(now);
      next.cancellationReason = next.cancellationReason || "Trajet annule";
    } else if (tripStatus === "in_progress" && next.status === "confirmed") {
      fixes.push(`reservation ${next.id}: confirmed -> in_progress`);
      next.status = "in_progress";
      next.boardingConfirmedByDriver = true;
      next.boardingConfirmedByPassenger = true;
    }

    if (next.status === "pending" && new Date(next.expiresAt) < now) {
      fixes.push(`reservation ${next.id}: pending -> refused (expiree)`);
      next.status = "refused";
      next.refusalReason = next.refusalReason || "Demande expiree";
    }

    if (next.status === "completed" && !next.completedAt) {
      next.completedAt = toIso(new Date(Math.max(tripEnd(trip).getTime(), now.getTime())));
    }
    if (next.status === "cancelled" && !next.cancelledAt) {
      next.cancelledAt = next.updatedAt || toIso(now);
    }
    if (next.status === "refused" && !next.refusalReason) {
      next.refusalReason = "Refusee par le conducteur";
    }
    if (!["in_progress", "completed"].includes(next.status)) {
      next.boardingConfirmedByDriver = false;
      next.boardingConfirmedByPassenger = false;
    }
    return next;
  });

  const cleanedNotifications = notifications
    .filter((notification) => {
      const keep = userMap.has(notification.userId);
      if (!keep) fixes.push(`notification ${notification.id} supprimee (userId invalide)`);
      return keep;
    })
    .map((notification) => {
      const next = { ...notification };
      const mappedType = mapNotificationType(next.type);
      if (mappedType !== next.type) {
        fixes.push(`notification ${next.id}: type ${next.type} -> ${mappedType}`);
        next.type = mappedType;
      }
      if (next.relatedTripId && !cleanedTripMap.has(next.relatedTripId)) {
        fixes.push(`notification ${next.id}: relatedTripId retire (${next.relatedTripId})`);
        next.relatedTripId = null;
      }
      if (next.relatedReservationId && !cleanedReservations.find((reservation) => reservation.id === next.relatedReservationId)) {
        fixes.push(`notification ${next.id}: relatedReservationId retire (${next.relatedReservationId})`);
        next.relatedReservationId = null;
      }
      return next;
    });

  const cleanedReviews = reviews.filter((review) => {
    const keep =
      cleanedTripMap.has(review.tripId) &&
      cleanedReservations.find((reservation) => reservation.id === review.reservationId) &&
      userMap.has(review.reviewerId) &&
      userMap.has(review.revieweeId);
    if (!keep) fixes.push(`review ${review.id} supprimee (reference invalide)`);
    return keep;
  });

  const cleanedFinance = driverFinanceAccounts
    .filter((account) => driverIds.has(account.driverId))
    .map((account) => {
      const recomputed = recalcFinance(account.driverId, cleanedReservations);
      return {
        ...account,
        soldeDisponible: recomputed.soldeDisponible,
        soldeEnTransit: recomputed.soldeEnTransit,
        transactions: recomputed.transactions,
        updatedAt: toIso(now),
      };
    });

  const cleanedIndisponibilities = indisponibilities
    .filter((entry) => userMap.has(entry.id))
    .map((entry) => ({
      ...entry,
      dates: Array.isArray(entry.dates) ? entry.dates.filter((range) => range.startAt && range.endAt) : [],
      updatedAt: entry.updatedAt || entry.createdAt || toIso(now),
    }));

  writeJson("trips.json", cleanedTrips);
  writeJson("reservations.json", cleanedReservations);
  writeJson("notifications.json", cleanedNotifications);
  writeJson("reviews.json", cleanedReviews);
  writeJson("drafts.json", cleanedDrafts);
  writeJson("driver_finance_accounts.json", cleanedFinance);
  writeJson("indisponibilities.json", cleanedIndisponibilities);
  writeJson("users.json", users);
  writeJson("vehicles.json", vehicles);
  writeJson("bank_accounts.json", bankAccounts);
  writeJson("messages.json", messages);
  writeJson("penalites.json", penalites);
  writeJson("lieux_favoris.json", favoritePlaces);
  writeJson("affinites.json", affinites);
  writeJson("astuces.json", astuces);
  writeJson("gotasks.json", goTasks);

  console.log("clean-test-db termine");
  console.log(`- ${fixes.length} correction(s) appliquee(s)`);
  fixes.slice(0, 20).forEach((fix) => console.log(`  * ${fix}`));
  if (fixes.length > 20) {
    console.log(`  * ... ${fixes.length - 20} autre(s) correction(s)`);
  }
  console.log(`- date de reference: ${today}`);
}

main();
