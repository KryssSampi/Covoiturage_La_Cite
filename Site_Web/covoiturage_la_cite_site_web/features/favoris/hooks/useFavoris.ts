/**
 * Hook de gestion des données Favoris.
 * Les lieux favoris et conducteurs/passagers favoris sont dérivés
 * des données persistées dans la base JSON (useDb).
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useDb } from "@/core/context/db.context";
import { useAppState } from "@/core/state/app_state";
import type { OngletFavoris, LieuFavori, UtilisateurFavori, AlerteTrajet } from "../types/favoris.types";

export function useFavoris() {
  const [ongletActif, setOngletActif] = useState<OngletFavoris>("lieux");
  const [overlayLieu, setOverlayLieu] = useState(false);
  const [overlayUser, setOverlayUser] = useState(false);

  const { userConnected } = useAppState();
  const { trips, reservations, users } = useDb();
  const userId = userConnected?.id ?? "";

  // ── Lieux de départ/arrivée utilisés par l'utilisateur ───────────────────
  const [lieux, setLieux] = useState<LieuFavori[]>([]);

  // ── Conducteurs que le passager a déjà croisés ────────────────────────────
  const conducteursFavoris = useMemo<UtilisateurFavori[]>(() => {
    // Trajets où l'utilisateur était passager
    const myPassengerReservations = reservations.filter(
      (r) => r.passengerId === userId && r.status === "completed",
    );
    const driverIds = [...new Set(myPassengerReservations.map((r) => r.driverId))];

    return driverIds.map((dId) => {
      const driver   = users.find((u) => u.id === dId);
      const together = myPassengerReservations.filter((r) => r.driverId === dId).length;
      return {
        id:                   dId,
        nomComplet:           driver ? `${driver.firstName} ${driver.lastName}` : "Conducteur",
        initiales:            driver?.initials ?? "?",
        role:                 "conducteur" as const,
        note:                 driver?.driverProfile?.averageRating ?? 0,
        nbTrajetsEnsemble:    together,
        nbTrajetsEnsembleMois: 0,
        badges:               driver?.badgeIds ?? [],
        niveau:               "Actif",
        estEnLigne:           false,
        alerteActive:         false,
        avatarGradient:       "from-emerald-400 to-teal-600",
      };
    }).filter(Boolean);
  }, [reservations, users, userId]);

  // ── Passagers que le conducteur a déjà transportés ───────────────────────
  const passagersFavoris = useMemo<UtilisateurFavori[]>(() => {
    const myDriverTrips = trips.filter(
      (t) => t.driverId === userId && t.status === "completed",
    );
    const passengerIds = [...new Set(myDriverTrips.flatMap((t) => t.passengerIds))];

    return passengerIds.map((pId) => {
      const passenger = users.find((u) => u.id === pId);
      const together  = myDriverTrips.filter((t) => t.passengerIds.includes(pId)).length;
      return {
        id:                   pId,
        nomComplet:           passenger ? `${passenger.firstName} ${passenger.lastName}` : "Passager",
        initiales:            passenger?.initials ?? "?",
        role:                 "passager" as const,
        note:                 passenger?.passengerProfile?.averageRating ?? 0,
        nbTrajetsEnsemble:    together,
        nbTrajetsEnsembleMois: 0,
        badges:               passenger?.badgeIds ?? [],
        niveau:               "Actif",
        estEnLigne:           false,
        alerteActive:         false,
        avatarGradient:       "from-blue-400 to-indigo-600",
      };
    }).filter(Boolean);
  }, [trips, users, userId]);

  const supprimerLieu = useCallback((id: string) => {
    setLieux((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return {
    ongletActif,
    setOngletActif,
    lieux,
    conducteursFavoris,
    passagersFavoris,
    alertes: [] as AlerteTrajet[],
    stats: {
      totalLieux:        lieux.length,
      totalTrajets:      conducteursFavoris.length + passagersFavoris.length,
      distanceMoyenneKm: 0,
      tempsMoyenMin:     0,
    },
    usersSearch: users.map((u) => ({
      id:        u.id,
      name:      `${u.firstName} ${u.lastName}`,
      role:      u.role,
      note:      String(u.driverProfile?.averageRating ?? u.passengerProfile?.averageRating ?? 0),
      badge:     u.badgeIds?.[0] ?? "",
      initiales: u.initials,
      gradient:  "from-blue-500 to-indigo-600",
    })),
    overlayLieu,
    setOverlayLieu,
    overlayUser,
    setOverlayUser,
    supprimerLieu,
  };
}
