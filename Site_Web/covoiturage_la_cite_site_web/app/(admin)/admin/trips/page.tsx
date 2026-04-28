"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { getAdminTripsAction } from "@/features/admin/services/admin.actions";
import {
  AdminPageHeader,
  AdminTabs,
  AdminTable,
  AdminSearchInput,
  AdminSelect,
  Badge,
  ErrorDisplay,
} from "@/features/admin/components/AdminShared";

/* SimulationPanel is heavy (GPS autoplay) — load client-side only */
const SimulationPanel = dynamic(
  () => import("@/features/admin/components/SimulationPanel"),
  { ssr: false, loading: () => <div className="py-8 text-center text-sm text-slate-400">Chargement du panneau de simulation…</div> }
);

const TABS = ["Liste des trajets", "Simulation d'événements"] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, "green" | "blue" | "amber" | "red" | "slate"> = {
  published:   "blue",
  confirmed:   "green",
  in_progress: "amber",
  completed:   "green",
  cancelled:   "red",
  draft:       "slate",
};

const STATUS_LABELS: Record<string, string> = {
  published:   "Publié",
  confirmed:   "Confirmé",
  in_progress: "En cours",
  completed:   "Terminé",
  cancelled:   "Annulé",
  draft:       "Brouillon",
};

const STATUS_OPTIONS = [
  { value: "all",         label: "Tous les statuts" },
  { value: "published",   label: "Publiés" },
  { value: "confirmed",   label: "Confirmés" },
  { value: "in_progress", label: "En cours" },
  { value: "completed",   label: "Terminés" },
  { value: "cancelled",   label: "Annulés" },
];

interface AdminTrip {
  id: string;
  driverId: string;
  driverName?: string;
  status: string;
  departureLabel?: string;
  arrivalLabel?: string;
  departureDate?: string;
  departureTime?: string;
  pricePerPassenger?: number;
  currentPassengers?: number;
  maxPassengers?: number;
  reservations?: unknown[];
}

export default function AdminTripsPage() {
  const [tab, setTab]         = useState<Tab>("Liste des trajets");
  const [trips, setTrips]     = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getAdminTripsAction();
      setTrips(data as AdminTrip[]);
    } catch (e) {
      setError((e as Error).message ?? "Impossible de charger les trajets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = trips.filter((t) => {
    const matchSearch =
      !search ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.driverName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.departureLabel ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.arrivalLabel ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" || t.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Gestion des trajets"
        subtitle={`${trips.length} trajet${trips.length !== 1 ? "s" : ""} au total`}
        action={
          <button
            onClick={load}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 transition-colors"
          >
            ↺ Actualiser
          </button>
        }
      />

      {error && <ErrorDisplay message={error} onRetry={load} />}

      <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as Tab)} />

      {tab === "Liste des trajets" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <AdminSearchInput
                value={search}
                onChange={setSearch}
                placeholder="Rechercher par ID, conducteur, départ ou arrivée…"
              />
            </div>
            <AdminSelect
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
            />
          </div>

          <AdminTable
            headers={["Trajet", "Conducteur", "Date", "Places", "Prix", "Rés.", "Statut"]}
            loading={loading}
            empty={!loading && filtered.length === 0}
            emptyText="Aucun trajet correspondant."
          >
            {filtered.map((trip) => (
              <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <p className="text-sm font-medium text-slate-700">
                    {trip.departureLabel ?? "—"} → {trip.arrivalLabel ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{trip.id}</p>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {trip.driverName ?? trip.driverId.slice(0, 8) + "…"}
                </td>
                <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                  {trip.departureDate ?? "—"}
                  {trip.departureTime && <span className="ml-1 text-slate-400">{trip.departureTime}</span>}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 text-center">
                  {trip.currentPassengers ?? 0}/{trip.maxPassengers ?? "—"}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {trip.pricePerPassenger != null
                    ? `${trip.pricePerPassenger.toFixed(2)} $`
                    : "—"}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 text-center">
                  {Array.isArray(trip.reservations) ? trip.reservations.length : "—"}
                </td>
                <td className="py-3 px-4">
                  <Badge
                    label={STATUS_LABELS[trip.status] ?? trip.status}
                    color={STATUS_COLORS[trip.status] ?? "slate"}
                  />
                </td>
              </tr>
            ))}
          </AdminTable>

          {!loading && filtered.length > 0 && (
            <p className="text-xs text-slate-400 text-right">
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              {filtered.length !== trips.length && ` sur ${trips.length}`}
            </p>
          )}
        </>
      )}

      {tab === "Simulation d'événements" && <SimulationPanel />}
    </div>
  );
}
