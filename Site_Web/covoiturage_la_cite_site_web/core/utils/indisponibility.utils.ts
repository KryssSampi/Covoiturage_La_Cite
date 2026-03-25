import type { DraftTrip } from "@/features/brouillons/types";
import type { TripModel } from "@/core/models/TripModel";
import type { IndisponibilityDateRange, IndisponibilityModel } from "@/core/models/IndisponibilityModel";

const DEFAULT_DURATION_MINUTES = 60;

export interface DateRangeLike {
  startAt: string;
  endAt: string;
}

export interface SchedulableLike {
  departureDate?: string;
  departureTime?: string;
  estimatedDurationMinutes?: number;
  duration?: number;
}

export function sortAndDeduplicateIndisponibilityDates(
  dates: IndisponibilityDateRange[],
): IndisponibilityDateRange[] {
  const seen = new Set<string>();

  return [...dates]
    .filter((date) => {
      if (!isValidDateRange(date)) return false;
      const key = `${date.startAt}|${date.endAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function isValidDateRange(range: DateRangeLike | null | undefined): range is DateRangeLike {
  if (!range?.startAt || !range?.endAt) return false;

  const start = new Date(range.startAt).getTime();
  const end = new Date(range.endAt).getTime();

  return Number.isFinite(start) && Number.isFinite(end) && start < end;
}

export function doDateRangesOverlap(a: DateRangeLike, b: DateRangeLike): boolean {
  if (!isValidDateRange(a) || !isValidDateRange(b)) return false;
  return new Date(a.startAt).getTime() < new Date(b.endAt).getTime()
    && new Date(b.startAt).getTime() < new Date(a.endAt).getTime();
}

export function buildDateRange(
  date: string | undefined,
  time: string | undefined,
  durationMinutes = DEFAULT_DURATION_MINUTES,
): DateRangeLike | null {
  if (!date || !time) return null;

  const start = new Date(`${date}T${time}:00`);
  if (Number.isNaN(start.getTime())) return null;

  const safeDuration = Number.isFinite(durationMinutes) && durationMinutes > 0
    ? durationMinutes
    : DEFAULT_DURATION_MINUTES;

  const end = new Date(start.getTime() + safeDuration * 60_000);
  return {
    startAt: toLocalDateTimeString(start),
    endAt: toLocalDateTimeString(end),
  };
}

export function buildTripModelDateRange(trip: TripModel): DateRangeLike | null {
  return buildDateRange(
    trip.departureDate,
    trip.departureTime,
    trip.estimatedDurationMinutes ?? DEFAULT_DURATION_MINUTES,
  );
}

export function buildDraftDateRange(draft: DraftTrip): DateRangeLike | null {
  return buildDateRange(
    draft.departureDate,
    draft.departureTime,
    DEFAULT_DURATION_MINUTES,
  );
}

export function buildDashboardTripDateRange(
  trip: { date: string; time: string; duration?: number },
): DateRangeLike | null {
  return buildDateRange(
    trip.date,
    trip.time,
    trip.duration ?? DEFAULT_DURATION_MINUTES,
  );
}

export function buildSchedulableDateRange(item: SchedulableLike): DateRangeLike | null {
  return buildDateRange(
    item.departureDate,
    item.departureTime,
    item.estimatedDurationMinutes ?? item.duration ?? DEFAULT_DURATION_MINUTES,
  );
}

export function isDateRangeBlockedByIndisponibility(
  range: DateRangeLike | null,
  indisponibility: IndisponibilityModel | null | undefined,
): boolean {
  if (!range || !indisponibility?.dates?.length) return false;
  return indisponibility.dates.some((date) => doDateRangesOverlap(range, date));
}

export function isTripBlockedByIndisponibility(
  trip: TripModel,
  indisponibility: IndisponibilityModel | null | undefined,
): boolean {
  return isDateRangeBlockedByIndisponibility(buildTripModelDateRange(trip), indisponibility);
}

export function isDraftBlockedByIndisponibility(
  draft: DraftTrip,
  indisponibility: IndisponibilityModel | null | undefined,
): boolean {
  return isDateRangeBlockedByIndisponibility(buildDraftDateRange(draft), indisponibility);
}

export function isDashboardTripBlockedByIndisponibility(
  trip: { date: string; time: string; duration?: number },
  indisponibility: IndisponibilityModel | null | undefined,
): boolean {
  return isDateRangeBlockedByIndisponibility(buildDashboardTripDateRange(trip), indisponibility);
}

export function createSlotDateRange(day: Date, hour: number, minute: number): DateRangeLike {
  const start = new Date(day);
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start.getTime() + 30 * 60_000);

  return {
    startAt: toLocalDateTimeString(start),
    endAt: toLocalDateTimeString(end),
  };
}

export function createRecurringDateRanges(
  weekday: string,
  start: string,
  end: string,
  horizonDays = 365,
): IndisponibilityDateRange[] {
  const weekdayIndex = weekdayToIndex(weekday);
  if (weekdayIndex === null) return [];

  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ranges: IndisponibilityDateRange[] = [];

  for (let offset = 0; offset <= horizonDays; offset += 1) {
    const current = new Date(base);
    current.setDate(base.getDate() + offset);
    if (current.getDay() !== weekdayIndex) continue;

    const range = createDateRangeForDay(current, start, end);
    if (!range) continue;

    ranges.push({
      id: `${range.startAt}-${range.endAt}`,
      startAt: range.startAt,
      endAt: range.endAt,
      weekday,
      start,
      end,
    });
  }

  return ranges;
}

export function createDateRangeForDay(
  day: Date,
  start: string,
  end: string,
): DateRangeLike | null {
  const startDate = parseDayAndTime(day, start);
  const endDate = parseDayAndTime(day, end);

  if (!startDate || !endDate) return null;
  if (endDate.getTime() <= startDate.getTime()) return null;

  return {
    startAt: toLocalDateTimeString(startDate),
    endAt: toLocalDateTimeString(endDate),
  };
}

function parseDayAndTime(day: Date, time: string): Date | null {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;

  const parsed = new Date(day);
  parsed.setHours(hours, minutes, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function weekdayToIndex(weekday: string): number | null {
  switch (weekday.toLowerCase()) {
    case "sunday":
      return 0;
    case "monday":
      return 1;
    case "tuesday":
      return 2;
    case "wednesday":
      return 3;
    case "thursday":
      return 4;
    case "friday":
      return 5;
    case "saturday":
      return 6;
    default:
      return null;
  }
}

function toLocalDateTimeString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
