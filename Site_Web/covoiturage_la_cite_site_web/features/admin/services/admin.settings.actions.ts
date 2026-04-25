"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface PlatformSettings {
  id: string;
  smtpHost: string;
  smtpPort: number;
  corsOrigins: string[];
  jwtExpiration: number;
  maxLoginAttempts: number;
  rateLimitPerMinute: number;
  platformName: string;
  maintenanceMode: boolean;
}

export interface PlatformConfig {
  name: string;
  version: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maxUploadSize: number;
}

export async function getSettingsAction(): Promise<PlatformSettings> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/settings", {}, token);
}

export async function updateSettingsAction(settings: Partial<PlatformSettings>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch(
    "/api/admin/settings",
    {
      method: "PUT",
      body: JSON.stringify(settings),
    },
    token
  );
}

export async function toggleMaintenanceModeAction(enabled: boolean) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch(
    "/api/admin/settings/maintenance",
    {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    },
    token
  );
}

