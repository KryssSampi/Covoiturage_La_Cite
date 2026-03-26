const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "..", "tests", "db");

const LOCATIONS = [
  { label: "Campus La Cite", fullAddress: "801 promenade de l'Aviation, Ottawa, ON", lat: 45.4215, lng: -75.6442, instructions: "Devant l'entree principale" },
  { label: "Place d'Orleans", fullAddress: "110 Place d'Orleans Dr, Ottawa, ON", lat: 45.4777, lng: -75.5117, instructions: "Entree principale du centre commercial" },
  { label: "ByWard Market", fullAddress: "55 ByWard Market Sq, Ottawa, ON", lat: 45.4278, lng: -75.6944, instructions: "Coin York et William" },
  { label: "Kanata Centrum", fullAddress: "130 Earl Grey Dr, Kanata, ON", lat: 45.3099, lng: -75.9136, instructions: "Pres du stationnement principal" },
  { label: "Barrhaven Centre", fullAddress: "3651 Strandherd Dr, Ottawa, ON", lat: 45.2745, lng: -75.7368, instructions: "Stationnement cote sud" },
  { label: "South Keys", fullAddress: "2210 Bank St, Ottawa, ON", lat: 45.3648, lng: -75.6706, instructions: "Devant l'entree LRT" },
  { label: "Rideau Centre", fullAddress: "50 Rideau St, Ottawa, ON", lat: 45.4253, lng: -75.6901, instructions: "Porte principale Rideau" },
  { label: "Gatineau Centre-Ville", fullAddress: "170 rue de l'Hotel-de-Ville, Gatineau, QC", lat: 45.4768, lng: -75.702, instructions: "Devant l'hotel de ville" },
  { label: "Montreal Centre", fullAddress: "1000 rue Sainte-Catherine O, Montreal, QC", lat: 45.5017, lng: -73.5673, instructions: "Entree principale" },
  { label: "Orleans Park and Ride", fullAddress: "1675 Tenth Line Rd, Orleans, ON", lat: 45.4543, lng: -75.4845, instructions: "Zone de covoiturage" },
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

function toIso(date) {
  return `${toDateOnly(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.000Z`;
}

function dateAt(baseDate, dayOffset, hour, minute) {
  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date;
}

function timePlusMinutes(time, minutesToAdd) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(2026, 0, 1, hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + minutesToAdd);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function approxDistanceKm(points) {
  if (!Array.isArray(points) || points.length < 2) return 0;
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const next = points[index];
    const latKm = Math.abs(next.lat - prev.lat) * 111;
    const lngKm = Math.abs(next.lng - prev.lng) * 78;
    total += latKm + lngKm;
  }
  return Number(total.toFixed(1));
}

function buildPolyline(from, to, waypoints = [], stepsPerSegment = 5) {
  const points = [from, ...waypoints, to];
  const polyline = [];

  for (let segment = 0; segment < points.length - 1; segment += 1) {
    const start = points[segment];
    const end = points[segment + 1];

    for (let step = 0; step <= stepsPerSegment; step += 1) {
      if (segment > 0 && step === 0) continue;
      const ratio = step / stepsPerSegment;
      polyline.push([
        Number((start.lat + (end.lat - start.lat) * ratio).toFixed(4)),
        Number((start.lng + (end.lng - start.lng) * ratio).toFixed(4)),
      ]);
    }
  }

  return polyline;
}

function monthLabel(date) {
  const labels = ["Jan", "Fev", "Mars", "Avr", "Mai", "Juin", "Juil", "Aout", "Sept", "Oct", "Nov", "Dec"];
  return labels[date.getMonth()];
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

function buildUserPreferences(users, now) {
  return users
    .filter((user) => user.preferencesId)
    .map((user, index) => {
      const isDriver = user.role === "driver";
      const musicAccepted = user.preferences?.musicAccepted ?? true;
      const petsAccepted = user.preferences?.petsAccepted ?? false;
      const smokingAccepted = user.preferences?.smokingAccepted ?? false;
      const conversationLevel = user.preferences?.conversationLevel ?? "moderate";

      return {
        id: user.preferencesId,
        userId: user.id,
        conversationLevel,
        musicAccepted,
        musicGenre: musicAccepted ? (index % 3 === 0 ? "pop" : index % 3 === 1 ? "rap" : "indifferent") : "indifferent",
        smokesRegularly: false,
        smokingAccepted,
        hasPets: user.id.endsWith("2"),
        petsAccepted,
        typicalBaggageLevel: isDriver ? "light" : index % 2 === 0 ? "light" : "heavy",
        acceptedPaymentMethods: isDriver ? ["interac", "cash"] : index % 2 === 0 ? ["cash", "interac"] : ["cash"],
        preferredPaymentMethod: isDriver ? "interac" : "cash",
        languagePreference: user.id.endsWith("2") ? "fr" : "bilingual",
        defaultDepartureRadiusMeters: isDriver ? 700 : 1000,
        defaultArrivalRadiusMeters: isDriver ? 700 : 1000,
        defaultTimeToleranceMinutes: isDriver ? 20 : 45,
        defaultMaxPrice: isDriver ? null : 18,
        requireVerifiedDriver: false,
        minDriverGoScore: 0,
        minDriverRating: 3.5,
        minPassengerGoScore: isDriver ? 80 : 0,
        baggagePolicy: isDriver ? "light" : "heavy",
        requirePassengerMessage: isDriver && index % 2 === 0,
        notifyNewMatchingTrips: !isDriver,
        notifyReservationUpdates: true,
        notifyMessages: true,
        notifyGoBoard: index % 2 === 0,
        showPhoneNumber: false,
        showLastName: true,
        allowAffinityTracking: true,
        createdAt: user.createdAt || toIso(now),
        updatedAt: user.updatedAt || toIso(now),
      };
    });
}

function buildDriverFinanceAccounts(drivers, reservations, penalties, now) {
  const completedStatuses = new Set(["completed"]);
  const transitStatuses = new Set(["in_progress"]);

  return drivers.map((driver) => {
    const driverReservations = reservations.filter((reservation) => reservation.driverId === driver.id);
    const completed = driverReservations.filter((reservation) => completedStatuses.has(reservation.status));
    const inTransit = driverReservations.filter((reservation) => transitStatuses.has(reservation.status));
    const activePenalties = penalties.filter((penalty) => penalty.userId === driver.id && ["active", "contestee"].includes(penalty.statut));
    const chargedPenalties = penalties.filter((penalty) => penalty.userId === driver.id && penalty.statut === "prelevee");
    const commission = 0.15;

    const revenueTransactions = completed.map((reservation, index) => ({
      id: `DTXN-${driver.id}-${index + 1}`,
      type: "revenu_trajet",
      montant: Number((reservation.totalAmount * (1 - commission)).toFixed(2)),
      description: `Trajet ${reservation.tripId} confirme`,
      trajetId: reservation.tripId,
      statut: "confirme",
      createdAt: reservation.completedAt || reservation.updatedAt || reservation.createdAt,
    }));

    const transitTransactions = inTransit.map((reservation, index) => ({
      id: `DTXN-${driver.id}-TRANSIT-${index + 1}`,
      type: "revenu_trajet",
      montant: Number((reservation.totalAmount * (1 - commission)).toFixed(2)),
      description: `Trajet ${reservation.tripId} en transit`,
      trajetId: reservation.tripId,
      statut: "en_transit",
      createdAt: reservation.updatedAt || reservation.createdAt,
    }));

    const penaltyTransactions = chargedPenalties.map((penalty, index) => ({
      id: `DTXN-${driver.id}-PEN-${index + 1}`,
      type: "penalite",
      montant: Number(penalty.montant.toFixed(2)),
      description: penalty.raison,
      trajetId: penalty.trajetId,
      statut: "penalite",
      createdAt: penalty.createdAt,
    }));

    const soldeDisponible = Number((
      revenueTransactions.reduce((sum, txn) => sum + txn.montant, 0) -
      penaltyTransactions.reduce((sum, txn) => sum + txn.montant, 0)
    ).toFixed(2));
    const soldeEnTransit = Number(transitTransactions.reduce((sum, txn) => sum + txn.montant, 0).toFixed(2));
    const soldePenalites = Number(activePenalties.reduce((sum, penalty) => sum + penalty.montant, 0).toFixed(2));

    return {
      id: `DFA-${driver.id}`,
      driverId: driver.id,
      soldeDisponible,
      soldeEnTransit,
      soldePenalites,
      tauxPrelevement: 0.1,
      commission,
      transactions: [...revenueTransactions, ...transitTransactions, ...penaltyTransactions].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
      updatedAt: toIso(now),
    };
  });
}

function buildPassengerFinanceAccounts(passengers, reservations, tripMap, now) {
  const completedReservations = reservations.filter((reservation) => reservation.status === "completed");
  const transitReservations = reservations.filter((reservation) => ["pending", "confirmed", "in_progress"].includes(reservation.status));

  return passengers.map((passenger) => {
    const ownCompleted = completedReservations.filter((reservation) => reservation.passengerId === passenger.id);
    const ownTransit = transitReservations.filter((reservation) => reservation.passengerId === passenger.id);

    const transactions = [];
    let transactionIndex = 1;

    ownCompleted.forEach((reservation) => {
      const trip = tripMap.get(reservation.tripId);
      const economy = Number(((trip?.estimatedDistanceKm || 0) * 0.55).toFixed(2));
      transactions.push({
        id: `PTXN-${passenger.id}-${transactionIndex++}`,
        type: "paiement_trajet",
        montant: reservation.totalAmount,
        description: `Trajet ${reservation.tripId} - paiement capture`,
        trajetId: reservation.tripId,
        statut: "confirme",
        createdAt: reservation.completedAt || reservation.updatedAt || reservation.createdAt,
      });
      transactions.push({
        id: `PTXN-${passenger.id}-${transactionIndex++}`,
        type: "economie_trajet",
        montant: economy,
        description: `Economie estimee - ${reservation.tripId} vs transport individuel`,
        trajetId: reservation.tripId,
        statut: "confirme",
        createdAt: reservation.completedAt || reservation.updatedAt || reservation.createdAt,
      });
    });

    ownTransit.forEach((reservation) => {
      transactions.push({
        id: `PTXN-${passenger.id}-${transactionIndex++}`,
        type: "holding",
        montant: reservation.totalAmount,
        description: `Reservation ${reservation.id} - mise en attente`,
        trajetId: reservation.tripId,
        statut: "en_transit",
        createdAt: reservation.updatedAt || reservation.createdAt,
      });
    });

    return {
      id: `PFA-${passenger.id}`,
      passengerId: passenger.id,
      economiesEstimees: Number(transactions.filter((txn) => txn.type === "economie_trajet").reduce((sum, txn) => sum + txn.montant, 0).toFixed(2)),
      fondsEnTransit: Number(transactions.filter((txn) => txn.statut === "en_transit").reduce((sum, txn) => sum + txn.montant, 0).toFixed(2)),
      totalDepense: Number(transactions.filter((txn) => txn.type === "paiement_trajet").reduce((sum, txn) => sum + txn.montant, 0).toFixed(2)),
      nbTrajetsCompletes: ownCompleted.length,
      transactions: transactions.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
      updatedAt: toIso(now),
    };
  });
}

function buildBankAccounts(users, driverFinanceAccounts, passengerFinanceAccounts, now) {
  const bankNames = ["Banque TD", "Banque RBC", "Desjardins", "Banque Scotia"];
  const humanUsers = users.filter((user) => user.role !== "admin");

  const accounts = humanUsers.map((user, index) => {
    const driverFinance = driverFinanceAccounts.find((account) => account.driverId === user.id);
    const passengerFinance = passengerFinanceAccounts.find((account) => account.passengerId === user.id);
    const baseDeposit = 250 + index * 175;
    const bonusDeposit = Number((((driverFinance?.soldeDisponible || 0) + (passengerFinance?.economiesEstimees || 0)) * 0.35).toFixed(2));
    const withdrawal = index % 2 === 0 ? 45 + index * 7.5 : 0;
    const transactions = [
      {
        id: `BTXN-${user.id}-1`,
        type: "depot",
        montant: Number(baseDeposit.toFixed(2)),
        description: "Depot initial de test",
        statut: "complete",
        createdAt: user.createdAt || toIso(now),
      },
      {
        id: `BTXN-${user.id}-2`,
        type: "depot",
        montant: Number(bonusDeposit.toFixed(2)),
        description: "Ajustement seed donnees dynamiques",
        statut: "complete",
        createdAt: toIso(now),
      },
    ];

    if (withdrawal > 0) {
      transactions.push({
        id: `BTXN-${user.id}-3`,
        type: "retrait",
        montant: Number(withdrawal.toFixed(2)),
        description: `Retrait vers ${bankNames[index % bankNames.length]}`,
        statut: "complete",
        createdAt: toIso(now),
      });
    }

    const soldeDisponible = Number((
      transactions
        .filter((transaction) => transaction.type === "depot" || transaction.type === "transit_entrant")
        .reduce((sum, transaction) => sum + transaction.montant, 0) -
      transactions
        .filter((transaction) => transaction.type === "retrait" || transaction.type === "transit_sortant")
        .reduce((sum, transaction) => sum + transaction.montant, 0)
    ).toFixed(2));

    return {
      id: `BANK-${user.id}`,
      userId: user.id,
      ibanMasque: `***-***-${String(1000 + index * 137).slice(-4)}`,
      nomBanque: bankNames[index % bankNames.length],
      soldeDisponible,
      montantEnTransit: 0,
      transactions,
      updatedAt: toIso(now),
    };
  });

  const platformTransactions = driverFinanceAccounts.flatMap((account) =>
    account.transactions
      .filter((transaction) => transaction.type === "revenu_trajet")
      .map((transaction, index) => ({
        id: `BTXN-APP-${account.driverId}-${index + 1}`,
        type: transaction.statut === "en_transit" ? "transit_entrant" : "depot",
        montant: Number((transaction.montant * account.commission / (1 - account.commission)).toFixed(2)),
        description: `Commission ${transaction.trajetId || "trajet"}`,
        statut: transaction.statut === "en_transit" ? "en_transit" : "complete",
        createdAt: transaction.createdAt,
      })),
  );

  accounts.push({
    id: "BANK-APP-LA-CITE",
    userId: "ADMIN-SYSTEM",
    ibanMasque: "***-***-0000",
    nomBanque: "Compte Plateforme Cite-Voiturage",
    soldeDisponible: Number(platformTransactions.filter((txn) => txn.statut === "complete").reduce((sum, txn) => sum + txn.montant, 0).toFixed(2)),
    montantEnTransit: Number(platformTransactions.filter((txn) => txn.statut === "en_transit").reduce((sum, txn) => sum + txn.montant, 0).toFixed(2)),
    transactions: platformTransactions.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    updatedAt: toIso(now),
  });

  return accounts;
}

function buildBadgeRefs(user, statSummary, badges) {
  const obtained = [];
  const locked = [];

  badges
    .slice()
    .sort((left, right) => (left.ordre || 0) - (right.ordre || 0))
    .forEach((badge, index) => {
      const qualifies =
        (badge.id === "badge-confirme" && statSummary.nbTrajets >= 6) ||
        (badge.id === "badge-regulier" && statSummary.nbTrajets >= 21) ||
        (badge.id === "badge-expert" && statSummary.nbTrajets >= 51) ||
        (badge.id === "badge-ponctuel" && statSummary.ponctualite >= 95) ||
        (badge.id === "badge-fiable" && user.goScore >= 800) ||
        (badge.id === "badge-eco-debutant" && statSummary.co2TotalKg >= 50) ||
        (badge.id === "badge-eco-conscient" && statSummary.co2TotalKg >= 500) ||
        (badge.id === "badge-etudiant-cite" && String(user.email || "").includes("collegelacite.ca")) ||
        (badge.id === "badge-social" && statSummary.passagersUniques >= 10);

      if (qualifies) {
        obtained.push({
          badgeId: badge.id,
          dateObtention: `${["Jan", "Fev", "Mars", "Avr", "Mai", "Juin"][index % 6]}. 2026`,
          locked: false,
        });
      } else {
        const remaining =
          badge.id === "badge-confirme" ? `${Math.max(0, 6 - statSummary.nbTrajets)} restants` :
          badge.id === "badge-regulier" ? `${Math.max(0, 21 - statSummary.nbTrajets)} restants` :
          badge.id === "badge-expert" ? `${Math.max(0, 51 - statSummary.nbTrajets)} restants` :
          badge.id === "badge-ponctuel" ? `${Math.max(0, 95 - statSummary.ponctualite)} pts restants` :
          badge.id === "badge-fiable" ? `${Math.max(0, 800 - user.goScore)} pts restants` :
          badge.id === "badge-eco-debutant" ? `${Math.max(0, Math.ceil(50 - statSummary.co2TotalKg))} restants` :
          badge.id === "badge-eco-conscient" ? `${Math.max(0, Math.ceil(500 - statSummary.co2TotalKg))} restants` :
          badge.id === "badge-social" ? `${Math.max(0, 10 - statSummary.passagersUniques)} restants` :
          "En cours";

        locked.push({
          badgeId: badge.id,
          locked: true,
          restant: remaining,
        });
      }
    });

  return [...obtained, ...locked.slice(0, 2)];
}

function buildUserStats(users, trips, reservations, reviews, badges, now) {
  const tripMap = new Map(trips.map((trip) => [trip.id, trip]));
  const completedReservations = reservations.filter((reservation) => reservation.status === "completed");
  const periodConfig = {
    "7j": 7,
    mois: 30,
    "3mois": 90,
    "6mois": 180,
    tout: null,
  };

  function getStartDate(days) {
    if (days == null) return null;
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  }

  function filterTripsByPeriod(relevantTrips, key) {
    const startDate = getStartDate(periodConfig[key]);
    if (!startDate) return relevantTrips;
    return relevantTrips.filter((trip) => tripStart(trip) >= startDate);
  }

  function filterReviewsByPeriod(relevantReviews, key) {
    const startDate = getStartDate(periodConfig[key]);
    if (!startDate) return relevantReviews;
    return relevantReviews.filter((review) => new Date(review.createdAt) >= startDate);
  }

  return users.map((user, index) => {
    const drivenTrips = trips.filter((trip) => trip.driverId === user.id);
    const passengerReservations = reservations.filter((reservation) => reservation.passengerId === user.id);
    const completedDrivenTrips = drivenTrips.filter((trip) => trip.status === "completed");
    const completedPassengerTrips = passengerReservations
      .filter((reservation) => reservation.status === "completed")
      .map((reservation) => tripMap.get(reservation.tripId))
      .filter(Boolean);

    const relevantCompletedTrips = [...completedDrivenTrips, ...completedPassengerTrips];
    const reviewsReceived = reviews.filter((review) => review.revieweeId === user.id);
    const averageRating = reviewsReceived.length > 0
      ? Number((reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / reviewsReceived.length).toFixed(1))
      : Number((user.driverProfile?.averageRating || user.passengerProfile?.averageRating || 0).toFixed(1));

    const co2TotalKg = Number(relevantCompletedTrips.reduce((sum, trip) => sum + (trip.co2SavedKg || 0), 0).toFixed(1));
    const totalKm = Number(relevantCompletedTrips.reduce((sum, trip) => sum + (trip.estimatedDistanceKm || 0), 0).toFixed(1));
    const passagersUniques = unique(
      completedDrivenTrips.flatMap((trip) => trip.passengerIds || []),
    ).length;
    const gainNet = Number(
      completedReservations
        .filter((reservation) => reservation.driverId === user.id)
        .reduce((sum, reservation) => sum + reservation.totalAmount * 0.85, 0)
        .toFixed(2),
    );

    const statSummary = {
      nbTrajets: relevantCompletedTrips.length,
      co2TotalKg,
      noteMoyenne: averageRating,
      goScore: user.goScore || 0,
      ponctualite: user.driverProfile?.punctualityScore || user.passengerProfile?.punctualityScore || 0,
      passagersUniques,
      gainNet,
    };

    const tripsByMonthMap = new Map();
    relevantCompletedTrips.forEach((trip) => {
      const date = tripStart(trip);
      const label = monthLabel(date);
      tripsByMonthMap.set(label, Number(((tripsByMonthMap.get(label) || 0) + (trip.co2SavedKg || 0)).toFixed(1)));
    });

    const co2ParMois = Array.from({ length: 6 }).map((_, offset) => {
      const date = new Date(now);
      date.setMonth(now.getMonth() - (5 - offset));
      const label = monthLabel(date);
      return {
        mois: label,
        kg: tripsByMonthMap.get(label) || 0,
        isFutur: offset > 3,
      };
    });

    const scatterCO2Distance = relevantCompletedTrips.slice(0, 12).map((trip) => ({
      distanceKm: trip.estimatedDistanceKm || 0,
      co2Kg: Number((trip.co2SavedKg || 0).toFixed(1)),
      categorie: (trip.estimatedDistanceKm || 0) < 15 ? "courte" : (trip.estimatedDistanceKm || 0) < 30 ? "moyenne" : "longue",
    }));

    const notesParSemaine = [];
    const reviewsByWeek = new Map();
    reviewsReceived.forEach((review) => {
      const reviewDate = new Date(review.createdAt);
      const weekLabel = `S${Math.ceil(reviewDate.getDate() / 7)} ${monthLabel(reviewDate).toLowerCase()}`;
      const bucket = reviewsByWeek.get(weekLabel) || [];
      bucket.push(review.rating);
      reviewsByWeek.set(weekLabel, bucket);
    });
    Array.from(reviewsByWeek.entries())
      .slice(-5)
      .forEach(([weekLabel, ratings]) => {
        const ordered = ratings.slice().sort((left, right) => left - right);
        const middle = ordered.length % 2 === 1
          ? ordered[(ordered.length - 1) / 2]
          : Number(((ordered[ordered.length / 2 - 1] + ordered[ordered.length / 2]) / 2).toFixed(1));
        notesParSemaine.push({ semaine: weekLabel, notes: ratings, mediane: middle });
      });

    const distributionNotes = {
      etoile1: reviewsReceived.filter((review) => review.rating < 1.5).length,
      etoile2: reviewsReceived.filter((review) => review.rating >= 1.5 && review.rating < 2.5).length,
      etoile3: reviewsReceived.filter((review) => review.rating >= 2.5 && review.rating < 3.5).length,
      etoile4: reviewsReceived.filter((review) => review.rating >= 3.5 && review.rating < 4.5).length,
      etoile5: reviewsReceived.filter((review) => review.rating >= 4.5).length,
      totalAvis: reviewsReceived.length,
      roleLabel: user.role === "driver" ? "Conducteur" : "Passager",
    };

    const derniersTrajetsSummary = relevantCompletedTrips
      .slice()
      .sort((left, right) => tripStart(right).getTime() - tripStart(left).getTime())
      .slice(0, 5)
      .map((trip) => ({
        id: trip.id,
        depart: trip.departure.label,
        arrivee: trip.arrival.label,
        date: `${trip.departureDate} ${trip.departureTime}`,
        nbPassagers: trip.currentPassengers,
        distanceKm: trip.estimatedDistanceKm || 0,
        gainNet: user.id === trip.driverId ? Number(((trip.pricePerPassenger || 0) * trip.currentPassengers * 0.85).toFixed(2)) : 0,
        co2EconomiseKg: trip.co2SavedKg || 0,
        noteRecue: reviewsReceived[0]?.rating,
        statut: trip.status === "cancelled" ? "annule" : "complete",
      }));

    const impactEco = {
      co2TotalKg,
      kmTotaux: Number(totalKm.toFixed(1)),
      carburantLitres: Number((totalKm * 0.17).toFixed(1)),
      arbresEquivalents: Math.max(1, Math.round(co2TotalKg / 20)),
      voituresEvitees: Math.max(0, Math.round(co2TotalKg / 8)),
      economiesDollars: Number((co2TotalKg * 0.74).toFixed(1)),
    };

    const kpisParPeriode = {};
    const co2ParMoisParPeriode = {};
    const notesParSemaineParPeriode = {};
    const scatterParPeriode = {};
    const impactEcoParPeriode = {};
    const trajetsParPeriode = {};

    Object.keys(periodConfig).forEach((periodKey) => {
      const periodTrips = filterTripsByPeriod(relevantCompletedTrips, periodKey);
      const periodReviews = filterReviewsByPeriod(reviewsReceived, periodKey);
      const totalPeriodKm = periodTrips.reduce((sum, trip) => sum + (trip.estimatedDistanceKm || 0), 0);
      const totalPeriodCo2 = periodTrips.reduce((sum, trip) => sum + (trip.co2SavedKg || 0), 0);

      kpisParPeriode[periodKey] = {
        nbTrajets: periodTrips.length,
        co2TotalKg: Number(totalPeriodCo2.toFixed(1)),
        noteMoyenne: periodReviews.length > 0
          ? Number((periodReviews.reduce((sum, review) => sum + review.rating, 0) / periodReviews.length).toFixed(1))
          : statSummary.noteMoyenne,
        goScore: statSummary.goScore,
      };

      co2ParMoisParPeriode[periodKey] = co2ParMois.filter((month) => month.kg > 0 || periodKey === "tout");
      notesParSemaineParPeriode[periodKey] = notesParSemaine;
      scatterParPeriode[periodKey] = periodTrips.slice(0, 10).map((trip) => ({
        distanceKm: trip.estimatedDistanceKm || 0,
        co2Kg: Number((trip.co2SavedKg || 0).toFixed(1)),
        categorie: (trip.estimatedDistanceKm || 0) < 15 ? "courte" : (trip.estimatedDistanceKm || 0) < 30 ? "moyenne" : "longue",
      }));
      impactEcoParPeriode[periodKey] = {
        co2TotalKg: Number(totalPeriodCo2.toFixed(1)),
        kmTotaux: Number(totalPeriodKm.toFixed(1)),
        carburantLitres: Number((totalPeriodKm * 0.17).toFixed(1)),
        arbresEquivalents: Math.max(0, Math.round(totalPeriodCo2 / 20)),
        voituresEvitees: Math.max(0, Math.round(totalPeriodCo2 / 8)),
        economiesDollars: Number((totalPeriodCo2 * 0.74).toFixed(1)),
      };
      trajetsParPeriode[periodKey] = derniersTrajetsSummary;
    });

    return {
      id: `stat-${user.id}`,
      userId: user.id,
      updatedAt: toIso(now),
      kpis: statSummary,
      statsTrajets: {
        conducteur: completedDrivenTrips.length,
        passager: completedPassengerTrips.length,
        totalKm: Number(totalKm.toFixed(1)),
        dureeMoyenneMin: relevantCompletedTrips.length > 0
          ? Math.round(relevantCompletedTrips.reduce((sum, trip) => sum + (trip.estimatedDurationMinutes || 0), 0) / relevantCompletedTrips.length)
          : 0,
        annulations: trips.filter((trip) => trip.driverId === user.id && trip.status === "cancelled").length +
          passengerReservations.filter((reservation) => reservation.status === "cancelled").length,
        ponctualite: statSummary.ponctualite,
        passagersUniques,
        gainNet,
      },
      co2ParMois,
      scatterCO2Distance,
      notesParSemaine,
      distributionNotes,
      badgeRefs: buildBadgeRefs(user, statSummary, badges),
      derniersTrajetsSummary,
      impactEco,
      kpisParPeriode,
      co2ParMoisParPeriode,
      notesParSemaineParPeriode,
      scatterParPeriode,
      impactEcoParPeriode,
      trajetsParPeriode,
    };
  });
}

module.exports = {
  DB_DIR,
  LOCATIONS,
  readJson,
  writeJson,
  pad,
  toDateOnly,
  toIso,
  dateAt,
  timePlusMinutes,
  approxDistanceKm,
  buildPolyline,
  monthLabel,
  tripStart,
  tripEnd,
  unique,
  buildUserPreferences,
  buildDriverFinanceAccounts,
  buildPassengerFinanceAccounts,
  buildBankAccounts,
  buildUserStats,
};
