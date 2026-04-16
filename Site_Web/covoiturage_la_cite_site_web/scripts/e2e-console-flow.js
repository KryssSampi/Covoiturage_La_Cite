#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");

const BASE_URL = "http://127.0.0.1:3000";
const DB_DIR = path.join(__dirname, "..", "tests", "db");
const DRIVER_SEARCH_URL = "https://router.project-osrm.org/route/v1/driving";

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DB_DIR, file), "utf8"));
}

function logSection(title) {
  console.log(`\n=== ${title} ===`);
}

function logJson(label, value) {
  console.log(`${label}:`);
  console.log(JSON.stringify(value, null, 2));
}

async function requestJson(label, url, options = {}) {
  console.log(`\n[REQ] ${label}`);
  console.log(`${options.method || "GET"} ${url}`);
  if (options.body) {
    console.log("body:");
    console.log(options.body);
  }

  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  console.log(`[RES] ${label} -> ${response.status}`);
  console.log(typeof data === "string" ? data : JSON.stringify(data, null, 2));
  return { response, data };
}

function pickActors() {
  const users = readJson("users.json");
  const vehicles = readJson("vehicles.json");

  const driver = users.find((user) => user.role === "driver" && vehicles.some((vehicle) => vehicle.driverId === user.id));
  const passenger = users.find((user) => user.role === "passenger");
  const vehicle = vehicles.find((item) => item.driverId === driver?.id);

  if (!driver || !passenger || !vehicle) {
    throw new Error("Impossible de trouver un driver, un passager et un vehicule coherents dans la DB.");
  }

  return { driver, passenger, vehicle };
}

async function searchCircuit() {
  const departure = { label: "Campus La Cite", lng: -75.6442, lat: 45.4215 };
  const arrival = { label: "Place d'Orleans", lng: -75.5117, lat: 45.4777 };
  const url = `${DRIVER_SEARCH_URL}/${departure.lng},${departure.lat};${arrival.lng},${arrival.lat}?overview=full&geometries=geojson&alternatives=true`;

  logSection("1. Recherche de circuit");
  console.log(`[REQ] GET ${url}`);

  try {
    const response = await fetch(url);
    const text = await response.text();
    const data = JSON.parse(text);
    console.log(`[RES] circuit -> ${response.status}`);
    console.log(JSON.stringify({
      routes: data.routes?.length ?? 0,
      firstDistance: data.routes?.[0]?.distance ?? null,
      firstDuration: data.routes?.[0]?.duration ?? null,
    }, null, 2));

    if (!response.ok || !Array.isArray(data.routes) || data.routes.length === 0) {
      throw new Error("OSRM n'a retourne aucun circuit exploitable.");
    }

    const firstRoute = data.routes[0];
    return {
      ok: true,
      departure,
      arrival,
      polyline: firstRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      estimatedDistanceKm: Number((firstRoute.distance / 1000).toFixed(1)),
      estimatedDurationMinutes: Math.round(firstRoute.duration / 60),
      raw: data,
    };
  } catch (error) {
    console.log(`[RES] circuit -> ECHEC`);
    console.log(String(error instanceof Error ? error.message : error));
    return {
      ok: false,
      departure,
      arrival,
      polyline: [
        [departure.lat, departure.lng],
        [arrival.lat, arrival.lng],
      ],
      estimatedDistanceKm: 16.6,
      estimatedDurationMinutes: 28,
      defect: "La recherche de circuit depend d'OSRM externe et echoue dans cet environnement reseau.",
    };
  }
}

function buildTripPayload(driver, vehicle, circuit) {
  const future = new Date();
  future.setDate(future.getDate() + 2);
  const departureDate = future.toISOString().slice(0, 10);

  return {
    driverId: driver.id,
    vehicleId: vehicle.id,
    departure: {
      label: circuit.departure.label,
      fullAddress: "801 promenade de l'Aviation, Ottawa, ON",
      coordinates: { lat: circuit.departure.lat, lng: circuit.departure.lng },
    },
    arrival: {
      label: circuit.arrival.label,
      fullAddress: "110 Place d'Orleans Dr, Ottawa, ON",
      coordinates: { lat: circuit.arrival.lat, lng: circuit.arrival.lng },
    },
    waypoints: [],
    polyline: circuit.polyline,
    departureDate,
    departureTime: "08:30",
    maxPassengers: 2,
    currentPassengers: 0,
    passengerIds: [],
    pricePerPassenger: 9,
    paymentMethod: "interac",
    status: "published",
    departureType: "planned",
    tripType: "unique",
    preferences: {
      baggageAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      musicAllowed: true,
      flexibleItinerary: false,
      conversationLevel: "moderate",
      driverNote: "Test E2E console",
    },
    recurrenceDays: undefined,
    recurrenceEndDate: undefined,
    estimatedDistanceKm: circuit.estimatedDistanceKm,
    estimatedDurationMinutes: circuit.estimatedDurationMinutes,
    notes: "Trip cree depuis le test A-Z console",
  };
}

async function main() {
  const { driver, passenger, vehicle } = pickActors();

  logSection("Acteurs");
  logJson("driver", { id: driver.id, name: `${driver.firstName} ${driver.lastName}`, vehicleId: vehicle.id });
  logJson("passenger", { id: passenger.id, name: `${passenger.firstName} ${passenger.lastName}` });

  const circuit = await searchCircuit();

  logSection("2. Creation du trajet");
  const tripPayload = buildTripPayload(driver, vehicle, circuit);
  const createdTrip = await requestJson(
    "create-trip",
    `${BASE_URL}/api/trips`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tripPayload),
    },
  );

  if (!createdTrip.response.ok || !createdTrip.data?.id) {
    console.log("\nArret du scenario: creation de trajet impossible.");
    process.exit(1);
  }

  logSection("3. Recherche passager de ce trajet");
  const searchPayload = {
    passengerId: passenger.id,
    departureCoords: [circuit.departure.lng, circuit.departure.lat],
    arrivalCoords: [circuit.arrival.lng, circuit.arrival.lat],
    departureRadiusMeters: 1000,
    arrivalRadiusMeters: 1000,
    minSeatsAvailable: 1,
    sortKey: "matching_desc",
  };
  const searchResult = await requestJson(
    "passenger-search",
    `${BASE_URL}/api/passenger/search`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchPayload),
    },
  );

  const foundTrip = Array.isArray(searchResult.data?.trips)
    ? searchResult.data.trips.find((trip) => trip.id === createdTrip.data.id)
    : null;

  console.log("\n[resultat recherche cible]");
  console.log(JSON.stringify(foundTrip ?? null, null, 2));

  logSection("4. Demande de reservation");
  const reservationPayload = {
    tripId: createdTrip.data.id,
    passengerId: passenger.id,
    passengerMessage: "Reservation test console A-Z",
  };
  const reservationResult = await requestJson(
    "create-reservation",
    `${BASE_URL}/api/reservations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservationPayload),
    },
  );

  if (!reservationResult.response.ok || !reservationResult.data?.id) {
    console.log("\nArret du scenario: reservation impossible.");
    process.exit(1);
  }

  logSection("5. Acceptation de reservation");
  const acceptResult = await requestJson(
    "accept-reservation",
    `${BASE_URL}/api/reservations/${reservationResult.data.id}/accept`,
    { method: "POST", headers: { "x-caller-id": driver.id } },
  );

  logSection("6. Verification finale");
  const tripAfter = await requestJson("trip-after", `${BASE_URL}/api/trips?driverId=${encodeURIComponent(driver.id)}&status=published`);
  const reservationsAfter = await requestJson("reservations-after", `${BASE_URL}/api/reservations?passengerId=${encodeURIComponent(passenger.id)}`);

  const defects = [];
  if (!circuit.ok) {
    defects.push(circuit.defect);
  }
  if (!foundTrip) {
    defects.push("Le trajet cree n'apparait pas dans la recherche passager avec les memes coordonnees.");
  }
  if (reservationResult.response.ok && acceptResult.response.ok) {
    const confirmedReservation = Array.isArray(reservationsAfter.data)
      ? reservationsAfter.data.find((item) => item.id === reservationResult.data.id)
      : null;
    if (!confirmedReservation || confirmedReservation.status !== "confirmed") {
      defects.push("La reservation n'est pas ressortie comme confirmee apres acceptation.");
    }
    const updatedTrip = Array.isArray(tripAfter.data)
      ? tripAfter.data.find((item) => item.id === createdTrip.data.id)
      : null;
    if (!updatedTrip) {
      defects.push("Le trajet accepte n'est plus visible dans GET /api/trips?driverId=...&status=published, probablement a cause d'un changement de statut.");
    }
  }

  logSection("Defauts remarques");
  if (defects.length === 0) {
    console.log("Aucun defaut bloquant detecte sur cette sequence precise.");
  } else {
    defects.forEach((defect, index) => console.log(`${index + 1}. ${defect}`));
  }
}

main().catch((error) => {
  console.error("\nECHEC GLOBAL");
  console.error(error);
  process.exit(1);
});
