import { DEFAULT_SETTINGS } from '../lib/stats';
import type { AppState, DayLog, Settings } from './types';

export const STORE_VERSION = 1;

/**
 * Demo history so a fresh install looks like the design reference instead of an
 * empty chart. Flip to `false` to ship with a clean slate + onboarding.
 */
export const SEED_DEMO_HISTORY = true;

/** Plan day 12. One cigarette fewer per day, so the plan allows 8 today. */
const SEED_PLAN_DAYS = 12;

/**
 * Actual cigarettes per plan day, oldest first (the last entry is today).
 * A believable taper: the user stays just ahead of the plan, which produces
 * the reference's headline numbers (≈ 8 today's limit, 5 smoked, ≈ 7,2 average).
 */
const SEED_COUNTS = [11, 11, 10, 10, 9, 9, 9, 8, 7, 6, 6, 5];

/** The last cigarette happened 2 h 14 min before first launch. */
const SEED_LAST_CIGARETTE_AGO_MS = (2 * 60 + 14) * 60_000;

export function emptyLog(date: string): DayLog {
  return { date, count: 0, at: [], cravings: [], breaths: 0 };
}

export function seedSettings(today: Date): Settings {
  const start = new Date(today);
  start.setDate(start.getDate() - (SEED_PLAN_DAYS - 1));
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    ...DEFAULT_SETTINGS,
    startDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
  };
}

/** Spread `count` timestamps across the waking hours (08:00 – 23:00). */
function spread(day: Date, count: number): number[] {
  const at: number[] = [];
  const hourSpan = 15;
  for (let i = 0; i < count; i += 1) {
    const offsetHours = (i * hourSpan) / Math.max(1, count);
    const stamp = new Date(day);
    stamp.setHours(8 + Math.floor(offsetHours), Math.round((offsetHours % 1) * 60), 0, 0);
    at.push(stamp.getTime());
  }
  return at;
}

export function seedLogs(today: Date): Record<string, DayLog> {
  const logs: Record<string, DayLog> = {};
  SEED_COUNTS.forEach((count, index) => {
    const day = new Date(today);
    day.setDate(day.getDate() - (SEED_COUNTS.length - 1 - index));
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    const isToday = index === SEED_COUNTS.length - 1;

    let at = spread(day, count);
    if (isToday) {
      // Today is partly lived: only cigarettes already smoked count.
      const last = today.getTime() - SEED_LAST_CIGARETTE_AGO_MS;
      at = spread(day, count).filter((t) => t <= last);
      at.push(last);
    }

    logs[date] = {
      date,
      count: at.length,
      at,
      cravings: isToday ? [today.getTime() - 40 * 60_000] : [],
      breaths: isToday ? 1 : 0,
    };
  });
  return logs;
}

export function createInitialState(now: Date = new Date()): AppState {
  return {
    version: STORE_VERSION,
    settings: seedSettings(now),
    logs: SEED_DEMO_HISTORY ? seedLogs(now) : {},
    hapticsEnabled: true,
    soundEnabled: true,
  };
}

/** Clean install: day 1 of the plan, no history. */
export function createFreshState(now: Date = new Date()): AppState {
  return {
    version: STORE_VERSION,
    settings: seedSettings(now),
    logs: {},
    hapticsEnabled: true,
    soundEnabled: true,
  };
}
