"use client";

import { useMemo } from "react";
import { useAppState } from "@/core/state/app_state";
import { buildReviewsListDetailConfig } from "@/core/services/list-detail-config.service";

export function useReviewsConfig() {
  const { lang } = useAppState();
  return useMemo(() => buildReviewsListDetailConfig(lang), [lang]);
}
