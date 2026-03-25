import { addMonths, getDay, getDaysInMonth, isSameDay, startOfMonth } from "date-fns";

import { DRIVER_STATUS_COLORS, PASSENGER_STATUS_COLORS } from "@/features/planner/constants/calendar.constants";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";
import {
  MonthCell,
  PublishedTripStatus,
  ReservationStatus,
  Role,
  type StatusColors,
} from "@/features/planner/types/calendar.types";
import { normalizeRide } from "@/features/planner/utils/ride.normalizer";

export function getStatusColor(status: string, role: string): StatusColors {
  return role === Role.DRIVER
    ? DRIVER_STATUS_COLORS[status] ?? DRIVER_STATUS_COLORS[PublishedTripStatus.Published]
    : PASSENGER_STATUS_COLORS[status] ?? PASSENGER_STATUS_COLORS[ReservationStatus.Pending];
}

export function getSaturationColor(ratio: number): string {
  const h = Math.round(142 - ratio * 142);
  const s = 55 + ratio * 20;
  const l = 88 - ratio * 10;
  return `hsla(${h},${s}%,${l}%, 0.4)`;
}

export function getRidesForDate(
  rides: (PublishedTrip | Reservation)[],
  date: Date,
): (PublishedTrip | Reservation)[] {
  return rides.filter((ride) => isSameDay(normalizeRide(ride).start, date));
}

export function computeDaySaturation(rides: (PublishedTrip | Reservation)[], date: Date): number {
  const dayRides = getRidesForDate(rides, date);
  if (!dayRides.length) return 0;

  const usefulMinutes = 17 * 60;
  const occupied = dayRides.reduce((acc, ride) => acc + (ride.duration ?? 30), 0);
  return Math.min(1, occupied / usefulMinutes);
}

export function buildMonthCells(pivot: Date): MonthCell[] {
  const year = pivot.getFullYear();
  const month = pivot.getMonth();
  const total = getDaysInMonth(pivot);
  const firstCol = getDay(startOfMonth(pivot));

  const cells: MonthCell[] = [];

  const prevTotal = getDaysInMonth(addMonths(pivot, -1));
  for (let i = firstCol - 1; i >= 0; i -= 1) {
    cells.push({ day: prevTotal - i, month: month - 1, year, current: false });
  }

  for (let day = 1; day <= total; day += 1) {
    cells.push({ day, month, year, current: true });
  }

  const rem = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= rem; day += 1) {
    cells.push({ day, month: month + 1, year, current: false });
  }

  return cells;
}

export function hasRideInSlot(
  rides: (PublishedTrip | Reservation)[],
  day: Date,
  hour: number,
  minute: number,
): boolean {
  const slotStart = new Date(day);
  slotStart.setHours(hour, minute, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

  return rides.some((ride) => {
    const normalized = normalizeRide(ride);
    return (
      isSameDay(normalized.start, day) &&
      normalized.start < slotEnd &&
      normalized.end > slotStart
    );
  });
}
