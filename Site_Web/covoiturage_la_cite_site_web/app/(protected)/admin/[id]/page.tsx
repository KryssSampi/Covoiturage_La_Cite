"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppState } from "@/core/state/app_state";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import UsersList, { type AdminUserRow } from "@/features/admin/components/UsersList";
import SimulationPanel from "@/features/admin/components/SimulationPanel";

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

  useEffect(() => {
    if (!user || user.role.toString().toLowerCase() !== "admin") return;
    if (user.id !== routeId) return;
    void loadUsers();
  }, [loadUsers, routeId, user]);

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
            {user.firstName} {user.lastName}
          </span>
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Utilisateurs inscrits
        </h2>
        <UsersList users={users} loading={usersLoading} error={usersError} />
      </section>

      <SimulationPanel />

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
