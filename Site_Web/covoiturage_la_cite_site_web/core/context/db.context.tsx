'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TripService } from '@/core/services/trip.service';
import { ReservationService } from '@/core/services/reservation.service';
import { NotificationService } from '@/core/services/notification.service';
import { VehicleService } from '@/core/services/vehicle.service';
import { UserService } from '@/core/services/user.service';
import { ReviewService } from '@/core/services/review.service';
import type { TripModel } from '@/core/models/TripModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type { NotificationModel } from '@/core/models/NotificationModel';
import type { VehicleModel } from '@/core/models/VehicleModel';
import type { UserModel } from '@/core/models/UserModel';
import type { ReviewModel } from '@/core/models/ReviewModel';
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

  // Actions de rechargement
  refreshTrips: () => Promise<void>;
  refreshReservations: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Données filtrées pour l'utilisateur courant
  myTrips: TripModel[];
  myReservations: ReservationModel[];
  myNotifications: NotificationModel[];
  myVehicles: VehicleModel[];
  /** Avis reçus par l'utilisateur courant (revieweeId) */
  myReviews: ReviewModel[];
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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripModel[]>([]);
  const [reservations, setReservations] = useState<ReservationModel[]>([]);
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [reviews, setReviews] = useState<ReviewModel[]>([]);

  const refreshTrips = useCallback(async () => {
    const data = await TripService.getAll();
    setTrips(data);
  }, []);

  const refreshReservations = useCallback(async () => {
    const data = await ReservationService.getAll();
    setReservations(data);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const data = await NotificationService.getAll();
    setNotifications(data);
  }, []);

  const refreshVehicles = useCallback(async () => {
    const data = await VehicleService.getAll();
    setVehicles(data);
  }, []);

  const refreshUsers = useCallback(async () => {
    const data = await UserService.getAll();
    setUsers(data);
  }, []);

  const refreshReviews = useCallback(async () => {
    const data = await ReviewService.getAll();
    setReviews(data);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        refreshTrips(),
        refreshReservations(),
        refreshNotifications(),
        refreshVehicles(),
        refreshUsers(),
        refreshReviews(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [refreshTrips, refreshReservations, refreshNotifications, refreshVehicles, refreshUsers, refreshReviews]);

  // Chargement initial
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

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
        refreshTrips,
        refreshReservations,
        refreshNotifications,
        refreshReviews,
        refreshAll,
        myTrips,
        myReservations,
        myNotifications,
        myVehicles,
        myReviews,
        unreadNotificationsCount,
      }}
    >
      {children}
    </DbContext.Provider>
  );
}
