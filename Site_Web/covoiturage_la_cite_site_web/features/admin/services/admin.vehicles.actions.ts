"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface Vehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  seats: number;
  documents: {
    insurance: boolean;
    registration: boolean;
    inspection: boolean;
  };
  isApproved: boolean;
  lastInspection?: string;
}

export async function getVehiclesAction(): Promise<Vehicle[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/vehicles", {}, token);
}

export async function approveVehicleAction(vehicleId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch(
    `/api/admin/vehicles/${vehicleId}/approve`,
    { method: "PUT" },
    token
  );
}

export async function rejectVehicleAction(vehicleId: string, reason: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch(
    `/api/admin/vehicles/${vehicleId}/reject`,
    {
      method: "PUT",
      body: JSON.stringify({ reason }),
    },
    token
  );
}

export async function getVehicleDocumentsAction(vehicleId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch(`/api/admin/vehicles/${vehicleId}/documents`, {}, token);
}
