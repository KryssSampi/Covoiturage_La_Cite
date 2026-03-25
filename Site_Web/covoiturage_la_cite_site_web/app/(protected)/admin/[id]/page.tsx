"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppState } from "@/core/state/app_state";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import UsersList, { type AdminUserRow } from "@/features/admin/components/UsersList";
import AdminTripsPanel from "@/features/admin/components/AdminTripsPanel";
import type { AdminTrip, SimulateResult, SimulationEvent } from "@/features/admin/types/adminTrips";

export default function AdminDashboardPage() {
  const appState = useAppState();
  const router = useRouter();
  const params = useParams();
  const { setActiveLoader } = useLoader();
  const user = appState.userConnected;
  const routeId = typeof params.id === "string" ? params.id : params.id?.[0];

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<SimulateResult | null>(null);
  const [simBusy, setSimBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setActiveLoader(true);
      router.replace("/");
    } else if (user.id !== routeId || user.role.toString().toLowerCase() !== "admin") {
      setActiveLoader(true);
      router.replace(`/${user.role.toString().toLowerCase()}/${user.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [routeId, router, setActiveLoader, user]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const payload = await res.json();
      setUsers(payload.users ?? []);
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : "Erreur de chargement");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadTrips = useCallback(async () => {
    setTripsLoading(true);
    setTripsError(null);
    try {
      const res = await fetch("/api/admin/trips");
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      setTrips(await res.json());
    } catch (error) {
      setTripsError(error instanceof Error ? error.message : "Erreur de chargement");
    } finally {
      setTripsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role.toString().toLowerCase() !== "admin") return;
    if (user.id !== routeId) return;
    void Promise.all([loadUsers(), loadTrips()]);
  }, [loadTrips, loadUsers, routeId, user]);

  const handleSimulate = useCallback(async (tripId: string, event: SimulationEvent) => {
    setSimBusy(true);
    setSimResult(null);
    try {
      const res = await fetch("/api/admin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, event }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSimResult({ success: false, event, tripId, message: data.error ?? "Erreur", affectedReservations: 0 });
      } else {
        setSimResult(data);
        await loadTrips();
      }
    } catch (error) {
      setSimResult({
        success: false,
        event,
        tripId,
        message: error instanceof Error ? error.message : "Erreur",
        affectedReservations: 0,
      });
    } finally {
      setSimBusy(false);
    }
  }, [loadTrips]);

  if (!user || user.id !== routeId || user.role.toString().toLowerCase() !== "admin") {
    return null;
  }

  return (
    <div className="p-8 w-full min-h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Tableau de bord - Administrateur
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Connecte en tant que{" "}
          <span className="font-medium">
            {user.prenom} {user.nom}
          </span>{" "}
          - {user.email}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Utilisateurs inscrits
        </h2>
        <UsersList users={users} loading={usersLoading} error={usersError} />
      </section>

      <AdminTripsPanel
        trips={trips}
        loading={tripsLoading}
        error={tripsError}
        onRefresh={loadTrips}
        simResult={simResult}
        simBusy={simBusy}
        onSimulate={handleSimulate}
      />

      <div className="mt-8">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={() => appState.logout()}
        >
          Se deconnecter
        </button>
      </div>
    </div>
  );
}
