"use client";

import { useMemo } from "react";
import { useAppState } from "@/core/state/app_state";
import { buildNotificationsListDetailConfig } from "@/core/services/list-detail-config.service";

export function useNotificationsConfig() {
  const { lang } = useAppState();
  return useMemo(() => buildNotificationsListDetailConfig(lang), [lang]);
}
