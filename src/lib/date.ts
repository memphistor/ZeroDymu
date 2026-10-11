/**
 * Date helpers. Everything is local-time based and keyed by `YYYY-MM-DD`, so
 * logs never shift because of timezones or DST.
 */

const WEEKDAYS = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'] as const;
const MONTHS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
] as const;
const WEEKDAY_NAMES = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
] as const;

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** Local day key, e.g. `2026-10-11`. */
export function dayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse a day key into a local Date at midnight. */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Shift a day key by whole days. */
export function shiftKey(key: string, days: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Inclusive list of the last `count` day keys, oldest first. */
export function lastDays(count: number, today: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) keys.push(dayKey(addDays(today, -i)));
  return keys;
}


/** Two-letter weekday for chart axis labels. */
export function weekdayShort(key: string): (typeof WEEKDAYS)[number] {
  return WEEKDAYS[fromKey(key).getDay()];
}

/** `Niedziela, 11 października`. */
export function formatLongDate(date: Date = new Date()): string {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** `11 października`. */
export function formatShortDate(key: string): string {
  const d = fromKey(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "2 h 14 min" / "14 min" / "teraz" — for "ostatni papieros". */
export function formatElapsed(from: number, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - from) / 60_000));
  if (minutes < 1) return 'teraz';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 dzień' : `${days} dni`;
}

/** Seconds -> `2:41`. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(safe / 60)}:${pad(safe % 60)}`;
}

/**
 * Polish pluralisation: pick(3, ['papieros','papierosy','papierosów']).
 * 1 → one, 2-4 (excluding 12-14) → few, everything else (including 0) → many.
 */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs === 1) return forms[0];
  if (last >= 2 && last <= 4 && !(abs >= 12 && abs <= 14)) return forms[1];
  return forms[2];
}

export const pluralDays = (n: number) => plural(n, ['dzień', 'dni', 'dni']);
export const pluralCigarettes = (n: number) => plural(n, ['papieros', 'papierosy', 'papierosów']);
export const pluralCycles = (n: number) => plural(n, ['cykl', 'cykle', 'cykli']);
export const pluralSessions = (n: number) => plural(n, ['sesja', 'sesje', 'sesji']);

/** Verb agreement: 1 → "został", otherwise "zostały". */
export const pluralLeft = (n: number) => (Math.abs(n) % 100 === 1 ? 'został' : 'zostały');
