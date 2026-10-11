import type { DayLog, Settings } from '../store/types';

/** Reduce one cigarette every N days. */
export const STEP_DAYS = 1;

/** Never plan fewer than this many cigarettes per day (taper, never cold turkey). */
export const MIN_LIMIT = 1;

export const DEFAULT_SETTINGS: Omit<Settings, 'startDate'> = {
  baseline: 19,
  stepDays: STEP_DAYS,
  floor: MIN_LIMIT,
  /** A pack in Warsaw, early 2026. */
  packPrice: 21,
  packSize: 20,
};

/** Local day key without pulling in the date helpers (keeps this module leaf-level). */
function key(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 0 on the first day of the plan; negative before it, positive after. */
export function dayIndex(startDate: string, dateKey: string): number {
  const a = new Date(`${startDate}T00:00:00`);
  const b = new Date(`${dateKey}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function shiftKey(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + days);
  return key(d);
}

/**
 * The plan: one cigarette fewer every `stepDays` days, never below `floor`.
 * Derived from the start date, so the plan is predictable and never drifts.
 */
export function dailyLimit(settings: Settings, dateKey: string): number {
  const index = dayIndex(settings.startDate, dateKey);
  if (index <= 0) return settings.baseline;
  const steps = Math.floor(index / Math.max(1, settings.stepDays));
  return Math.max(settings.floor, settings.baseline - steps);
}

export function pricePerCigarette(settings: Settings): number {
  return settings.packPrice / Math.max(1, settings.packSize);
}

export type DayPoint = {
  key: string;
  count: number;
  limit: number;
  isToday: boolean;
  isFuture: boolean;
};

export type Summary = {
  /** Plan day, 1-based. */
  day: number;
  today: DayPoint;
  /** Oldest first, length = the requested window. */
  window: DayPoint[];
  /** Average over the chart window, today included. */
  windowAverage: number;
  /** Total cigarettes inside the window. */
  windowTotal: number;
  /** Same, but based on what was actually smoked across the whole plan. 0..1 */
  actualReduction: number;
  /** Cigarettes never smoked because of the plan (vs. baseline every day). */
  savedCigarettes: number;
  savedPln: number;
  limitTomorrow: number;
  /** Days in a row at or under the plan. */
  streak: number;
};

/**
 * Aggregates raw logs into everything the screens need.
 * `window` is how many recent days the chart shows.
 */
export function summarise(
  settings: Settings,
  logs: Record<string, DayLog>,
  todayKey: string,
  window = 7,
): Summary {
  const todayIndex = Math.max(0, dayIndex(settings.startDate, todayKey));

  const points: DayPoint[] = [];
  for (let i = window - 1; i >= 0; i -= 1) {
    const dateKey = shiftKey(todayKey, -i);
    const index = dayIndex(settings.startDate, dateKey);
    points.push({
      key: dateKey,
      count: logs[dateKey]?.count ?? 0,
      limit: dailyLimit(settings, dateKey),
      isToday: dateKey === todayKey,
      isFuture: index > todayIndex,
    });
  }

  const today = points[points.length - 1];
  const windowTotal = points.reduce((sum, p) => sum + p.count, 0);
  const windowAverage = windowTotal / points.length;

  // Honest totals across the whole plan, not just the chart window.
  const elapsedDays = todayIndex + 1;
  let smoked = 0;
  for (const log of Object.values(logs)) {
    if (dayIndex(settings.startDate, log.date) >= 0 && log.date <= todayKey) smoked += log.count;
  }
  const savedCigarettes = Math.max(0, settings.baseline * elapsedDays - smoked);

  let streak = 0;
  for (let i = 0; i <= todayIndex; i += 1) {
    const dateKey = shiftKey(todayKey, -i);
    const count = logs[dateKey]?.count ?? 0;
    if (count > dailyLimit(settings, dateKey)) break;
    streak += 1;
  }

  return {
    day: elapsedDays,
    today,
    window: points,
    windowAverage,
    windowTotal,
    actualReduction:
      settings.baseline > 0 && elapsedDays > 0
        ? Math.min(1, Math.max(0, 1 - smoked / (settings.baseline * elapsedDays)))
        : 0,
    savedCigarettes,
    savedPln: savedCigarettes * pricePerCigarette(settings),
    limitTomorrow: dailyLimit(settings, shiftKey(todayKey, 1)),
    streak,
  };
}
