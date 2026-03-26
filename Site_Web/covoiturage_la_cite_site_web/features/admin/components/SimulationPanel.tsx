"use client";

import React from "react";
import AdminTripsPanel from "./AdminTripsPanel";
import { useAdminTrips } from "@/features/admin/hooks/useAdminTrips";

export default function SimulationPanel() {
  const {
    trips,
    loading,
    error,
    loadTrips,
    simResult,
    simBusy,
    triggerSimulation,
  } = useAdminTrips();

  return (
    <AdminTripsPanel
      trips={trips}
      loading={loading}
      error={error}
      onRefresh={loadTrips}
      simResult={simResult}
      simBusy={simBusy}
      onSimulate={triggerSimulation}
    />
  );
}
