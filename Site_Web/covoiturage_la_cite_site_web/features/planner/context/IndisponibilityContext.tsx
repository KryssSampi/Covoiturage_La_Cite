"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { IndisponibilityDateRange } from "@/core/models/IndisponibilityModel";
import {
  createRecurringDateRanges,
  createSlotDateRange,
  doDateRangesOverlap,
  sortAndDeduplicateIndisponibilityDates,
} from "@/core/utils/indisponibility.utils";

const DEFAULT_WEEKDAY = "monday";

export interface IndisponibilityContextType {
  disponibilitySetterIsActive: boolean;
  setDisponibilitySetterIsActive: (value: boolean) => void;
  indisponibilities: IndisponibilityDateRange[];
  addIndisponibility: (weekday: string, start: string, end: string) => void;
  removeIndisponibility: (target: IndisponibilityDateRange) => void;
  markSlotUnavailable: (day: Date, hour: number, minute: number) => void;
  isSlotUnavailable: (day: Date, hour: number, minute: number) => boolean;
  toggleSlotUnavailability: (day: Date, hour: number, minute: number) => void;
  formWeekday: string;
  setFormWeekday: (value: string) => void;
  formStart: string;
  setFormStart: (value: string) => void;
  formEnd: string;
  setFormEnd: (value: string) => void;
  submitForm: () => void;
  resetForm: () => void;
}

const IndisponibilityContext = createContext<IndisponibilityContextType | undefined>(undefined);

export function IndisponibilityProvider({
  children,
  initialDates = [],
  onSaveIndisponibilities,
}: {
  children: ReactNode;
  initialDates?: IndisponibilityDateRange[];
  onSaveIndisponibilities?: (dates: IndisponibilityDateRange[]) => Promise<void>;
}) {
  const [disponibilitySetterIsActive, setDisponibilitySetterIsActive] = useState(false);
  const [indisponibilities, setIndisponibilities] = useState<IndisponibilityDateRange[]>([]);
  const [formWeekday, setFormWeekday] = useState(DEFAULT_WEEKDAY);
  const [formStart, setFormStart] = useState("08:00");
  const [formEnd, setFormEnd] = useState("09:00");

  useEffect(() => {
    setIndisponibilities(sortAndDeduplicateIndisponibilityDates(initialDates));
  }, [initialDates]);

  const persistDates = useCallback(async (nextDates: IndisponibilityDateRange[]) => {
    if (!onSaveIndisponibilities) return;
    await onSaveIndisponibilities(nextDates);
  }, [onSaveIndisponibilities]);

  const updateDates = useCallback((updater: (prev: IndisponibilityDateRange[]) => IndisponibilityDateRange[]) => {
    setIndisponibilities((prev) => {
      const next = sortAndDeduplicateIndisponibilityDates(updater(prev));
      void persistDates(next);
      return next;
    });
  }, [persistDates]);

  const addIndisponibility = useCallback((weekday: string, start: string, end: string) => {
    const generated = createRecurringDateRanges(weekday, start, end);
    if (generated.length === 0) return;

    updateDates((prev) => [...prev, ...generated]);
  }, [updateDates]);

  const removeIndisponibility = useCallback((target: IndisponibilityDateRange) => {
    updateDates((prev) => prev.filter((item) => {
      if (target.weekday && target.start && target.end) {
        return !(
          item.weekday === target.weekday &&
          item.start === target.start &&
          item.end === target.end
        );
      }

      return !(item.startAt === target.startAt && item.endAt === target.endAt);
    }));
  }, [updateDates]);

  const markSlotUnavailable = useCallback((day: Date, hour: number, minute: number) => {
    const slot = createSlotDateRange(day, hour, minute);
    updateDates((prev) => [
      ...prev,
      {
        id: `${slot.startAt}-${slot.endAt}`,
        startAt: slot.startAt,
        endAt: slot.endAt,
      },
    ]);
  }, [updateDates]);

  const isSlotUnavailable = useCallback((day: Date, hour: number, minute: number) => {
    const slot = createSlotDateRange(day, hour, minute);
    return indisponibilities.some((item) => doDateRangesOverlap(item, slot));
  }, [indisponibilities]);

  const toggleSlotUnavailability = useCallback((day: Date, hour: number, minute: number) => {
    const slot = createSlotDateRange(day, hour, minute);

    updateDates((prev) => {
      const hasOverlap = prev.some((item) => doDateRangesOverlap(item, slot));
      if (hasOverlap) {
        return prev.filter((item) => !doDateRangesOverlap(item, slot));
      }

      return [
        ...prev,
        {
          id: `${slot.startAt}-${slot.endAt}`,
          startAt: slot.startAt,
          endAt: slot.endAt,
        },
      ];
    });
  }, [updateDates]);

  const submitForm = useCallback(() => {
    if (!formStart || !formEnd || formStart >= formEnd) return;
    addIndisponibility(formWeekday, formStart, formEnd);
    setFormWeekday(DEFAULT_WEEKDAY);
    setFormStart("08:00");
    setFormEnd("09:00");
  }, [addIndisponibility, formEnd, formStart, formWeekday]);

  const resetForm = useCallback(() => {
    setFormWeekday(DEFAULT_WEEKDAY);
    setFormStart("08:00");
    setFormEnd("09:00");
  }, []);

  const value = useMemo<IndisponibilityContextType>(() => ({
    disponibilitySetterIsActive,
    setDisponibilitySetterIsActive,
    indisponibilities,
    addIndisponibility,
    removeIndisponibility,
    markSlotUnavailable,
    isSlotUnavailable,
    toggleSlotUnavailability,
    formWeekday,
    setFormWeekday,
    formStart,
    setFormStart,
    formEnd,
    setFormEnd,
    submitForm,
    resetForm,
  }), [
    disponibilitySetterIsActive,
    indisponibilities,
    addIndisponibility,
    removeIndisponibility,
    markSlotUnavailable,
    isSlotUnavailable,
    toggleSlotUnavailability,
    formWeekday,
    formStart,
    formEnd,
    submitForm,
    resetForm,
  ]);

  return (
    <IndisponibilityContext.Provider value={value}>
      {children}
    </IndisponibilityContext.Provider>
  );
}

export function useIndisponibility(): IndisponibilityContextType {
  const ctx = useContext(IndisponibilityContext);
  if (!ctx) {
    throw new Error("useIndisponibility doit etre utilise a l'interieur d'un IndisponibilityProvider");
  }
  return ctx;
}
