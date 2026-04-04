'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import type { TripModel } from '@/core/models/TripModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type { NotificationModel } from '@/core/models/NotificationModel';
import type { VehicleModel } from '@/core/models/VehicleModel';
import type { UserModel } from '@/core/models/UserModel';
import type { ReviewModel } from '@/core/models/ReviewModel';
import type { IndisponibilityModel } from '@/core/models/IndisponibilityModel';
import { useAppState } from '@/core/state/app_state';

// ─── Types du contexte ────────────────────────────────────────────────────────

interface DbContextType {
  // État de chargement global
  isLoading: boolean;
  error: string | null;

  // Données
  trips: TripModel[];
  reservations: ReservationModel[];
  notifications: NotificationModel[];
  vehicles: VehicleModel[];
  /** Tous les utilisateurs de la base de données statique */
  users: UserModel[];
  /** Tous les avis de la base de données statique */
  reviews: ReviewModel[];
  indisponibilities: IndisponibilityModel[];

  // Actions de rechargement
  refreshTrips: () => Promise<void>;
  refreshReservations: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  refreshIndisponibilities: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Données filtrées pour l'utilisateur courant
  myTrips: TripModel[];
  myReservations: ReservationModel[];
  myNotifications: NotificationModel[];
  myVehicles: VehicleModel[];
  /** Avis reçus par l'utilisateur courant (revieweeId) */
  myReviews: ReviewModel[];
  myIndisponibility: IndisponibilityModel | null;
  unreadNotificationsCount: number;
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const DbContext = createContext<DbContextType | null>(null);

export function useDb(): DbContextType {
  const ctx = useContext(DbContext);
  if (!ctx) throw new Error('useDb doit être utilisé dans un <DbProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DbProvider({ children }: { children: React.ReactNode }) {
  const appState = useAppState();
  const currentUser = appState.userConnected;

  // ──────────────────────────────────────────────────────────────────────────
  // NOTE : L'ancien système self-service (/api/db/*) est désactivé (503).
  // Les données de ce contexte ne sont plus alimentées.
  // Les pages migrent progressivement vers les API Server Core
  // (ex. /api/dashboard/*, /api/notifications, /api/finances, etc.).
  // En attendant la suppression complète de DbProvider, on renvoie des
  // tableaux vides pour éviter la tempête de 503 et l'overflow de rendu.
  // ──────────────────────────────────────────────────────────────────────────

  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [trips] = useState<TripModel[]>([]);
  const [reservations] = useState<ReservationModel[]>([]);
  const [notifications] = useState<NotificationModel[]>([]);
  const [vehicles] = useState<VehicleModel[]>([]);
  const [users] = useState<UserModel[]>([]);
  const [reviews] = useState<ReviewModel[]>([]);
  const [indisponibilities] = useState<IndisponibilityModel[]>([]);

  const noop = useCallback(async () => {}, []);
  const refreshTrips = noop;
  const refreshReservations = noop;
  const refreshNotifications = noop;
  const refreshReviews = noop;
  const refreshIndisponibilities = noop;
  const refreshAll = noop;

  // Données filtrées pour l'utilisateur courant
  const userId = currentUser?.id ?? null;

  const myTrips = userId
    ? trips.filter(
        (t) => t.driverId === userId || t.passengerIds.includes(userId)
      )
    : [];

  const myReservations = userId
    ? reservations.filter(
        (r) => r.passengerId === userId || r.driverId === userId
      )
    : [];

  const myNotifications = userId
    ? notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const myVehicles = userId
    ? vehicles.filter((v) => v.driverId === userId)
    : [];

  const myReviews = userId
    ? reviews.filter((r) => r.revieweeId === userId)
    : [];

  const myIndisponibility = userId
    ? indisponibilities.find((item) => item.id === userId) ?? null
    : null;

  const unreadNotificationsCount = myNotifications.filter((n) => !n.isRead).length;

  return (
    <DbContext.Provider
      value={{
        isLoading,
        error,
        trips,
        reservations,
        notifications,
        vehicles,
        users,
        reviews,
        indisponibilities,
        refreshTrips,
        refreshReservations,
        refreshNotifications,
        refreshReviews,
        refreshIndisponibilities,
        refreshAll,
        myTrips,
        myReservations,
        myNotifications,
        myVehicles,
        myReviews,
        myIndisponibility,
        unreadNotificationsCount,
      }}
    >
      {children}
    </DbContext.Provider>
  );
}
