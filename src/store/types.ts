export type DayLog = {
  /** `YYYY-MM-DD`, local time. */
  date: string;
  /** How many cigarettes were actually smoked that day. */
  count: number;
  /** Timestamps (ms) of individual cigarettes. */
  at: number[];
  /** Cravings that led the user into the breathing exercise. */
  cravings: number[];
  /** Breathing sessions completed that day. */
  breaths: number;
};

export type Settings = {
  /** Cigarettes per day before the plan started. */
  baseline: number;
  /** `YYYY-MM-DD` of day 1. */
  startDate: string;
  /** Reduce one cigarette every N days. */
  stepDays: number;
  /** Never plan fewer than this. */
  floor: number;
  /** Price of a pack, in PLN. */
  packPrice: number;
  /** Cigarettes per pack. */
  packSize: number;
};

export type AppState = {
  /** Store schema version, used for future migrations. */
  version: number;
  settings: Settings;
  logs: Record<string, DayLog>;
  /** Whether haptic feedback is enabled. */
  hapticsEnabled: boolean;
  /** Whether the breathing screen plays an audible cue. */
  soundEnabled: boolean;
};
