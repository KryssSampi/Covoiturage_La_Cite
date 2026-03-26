"use client";

import { useMemo } from "react";
import { useAppState } from "@/core/state/app_state";
import { buildNouveautesListDetailConfig } from "@/core/services/list-detail-config.service";

export function useNouveautesConfig() {
  const { lang } = useAppState();
  return useMemo(() => buildNouveautesListDetailConfig(lang), [lang]);
}
