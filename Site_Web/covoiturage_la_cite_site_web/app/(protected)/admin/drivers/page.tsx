"use client";

import { useEffect, useState } from "react";
import { getPendingDriversAction, approveDriverAction, rejectDriverAction, PendingDriver } from "@/features/admin/services/admin.drivers.actions";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<PendingDriver[]>([]);

  useEffect(() => {
    getPendingDriversAction().then(setDrivers);
  }, []);

  return (
    <>
      <h1>Conducteurs en attente de validation</h1>

      {drivers.map(d => (
        <div key={d.id}>
          {d.email}

          <button onClick={async () => {
            await approveDriverAction(d.id);
            setDrivers(await getPendingDriversAction());
          }}>
            Approuver
          </button>

          <button onClick={async () => {
            await rejectDriverAction(d.id, "Documents invalides");
            setDrivers(await getPendingDriversAction());
          }}>
            Refuser
          </button>
        </div>
      ))}
    </>
  );
}
