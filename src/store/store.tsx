import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState as RNAppState } from 'react-native';

import { addDays, dayKey } from '../lib/date';
import type { AppState as PersistedState, DayLog } from './types';
import { STORE_VERSION, createInitialState } from './seed';

const STORAGE_KEY = 'zerodymu:state:v1';

type PersistStatus = 'loading' | 'ready' | 'error';

export type StoreValue = {
  state: PersistedState;
  status: PersistStatus;
  todayKey: string;
  today: DayLog;
  /** Smoke one cigarette now. */
  logCigarette: () => void;
  /** Undo the most recent cigarette of today. */
  undoLastCigarette: () => void;
  /** Record that a craving happened. */
  logCraving: () => void;
  /** Record a completed breathing session. */
  logBreath: () => void;
  patchSettings: (patch: Partial<PersistedState['settings']>) => void;
  setHaptics: (enabled: boolean) => void;
  setSound: (enabled: boolean) => void;
  resetAll: () => void;
  clearHistory: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const blank = (date: string): DayLog => ({
  date,
  count: 0,
  at: [],
  cravings: [],
  breaths: 0,
});

function write(
  logs: Record<string, DayLog>,
  date: string,
  patch: Partial<DayLog>,
): Record<string, DayLog> {
  const current = logs[date] ?? blank(date);
  return { ...logs, [date]: { ...current, ...patch, date } };
}

/** Keeps storage bounded: everything older than 400 days is dropped. */
function prune(logs: Record<string, DayLog>, today = new Date()): Record<string, DayLog> {
  const cutoff = dayKey(addDays(today, -400));
  const next: Record<string, DayLog> = {};
  let removed = false;
  for (const [key, log] of Object.entries(logs)) {
    if (key >= cutoff) next[key] = log;
    else removed = true;
  }
  return removed ? next : logs;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => createInitialState());
  const [status, setStatus] = useState<PersistStatus>('loading');
  const [todayKey, setTodayKey] = useState(() => dayKey());
  const hydrated = useRef(false);

  // Hydrate once from disk.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw) as PersistedState;
          if (parsed?.version === STORE_VERSION && parsed.settings && parsed.logs) {
            setState({
              ...parsed,
              // Fill in any settings added since the data was written.
              settings: { ...createInitialState().settings, ...parsed.settings },
              logs: prune(parsed.logs),
            });
          }
        }
      } catch {
        if (!cancelled) setStatus('error');
      } finally {
        if (!cancelled) {
          hydrated.current = true;
          setStatus((prev) => (prev === 'error' ? prev : 'ready'));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every change, but never before hydration finishes.
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => setStatus('error'));
  }, [state]);

  // Drop history older than the retention window once a day is enough.
  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        const logs = prune(prev.logs);
        return logs === prev.logs ? prev : { ...prev, logs };
      });
    }, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Roll the day over at midnight and when the app returns to the foreground.
  useEffect(() => {
    const sync = () => setTodayKey(dayKey());
    const interval = setInterval(sync, 30_000);
    const sub = RNAppState.addEventListener('change', (next) => {
      if (next === 'active') sync();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  const logCigarette = useCallback(() => {
    const key = dayKey();
    setTodayKey(key);
    setState((prev) => {
      const current = prev.logs[key] ?? blank(key);
      const at = [...current.at, Date.now()];
      return { ...prev, logs: write(prev.logs, key, { count: at.length, at }) };
    });
  }, []);

  const undoLastCigarette = useCallback(() => {
    const key = dayKey();
    setState((prev) => {
      const current = prev.logs[key];
      if (!current?.at.length) return prev;
      const at = current.at.slice(0, -1);
      return { ...prev, logs: write(prev.logs, key, { count: at.length, at }) };
    });
  }, []);

  const logCraving = useCallback(() => {
    const key = dayKey();
    setState((prev) => {
      const current = prev.logs[key] ?? blank(key);
      return { ...prev, logs: write(prev.logs, key, { cravings: [...current.cravings, Date.now()] }) };
    });
  }, []);

  const logBreath = useCallback(() => {
    const key = dayKey();
    setState((prev) => {
      const current = prev.logs[key] ?? blank(key);
      return { ...prev, logs: write(prev.logs, key, { breaths: current.breaths + 1 }) };
    });
  }, []);

  const patchSettings = useCallback((patch: Partial<PersistedState['settings']>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const setHaptics = useCallback(
    (enabled: boolean) => setState((prev) => ({ ...prev, hapticsEnabled: enabled })),
    [],
  );

  const setSound = useCallback(
    (enabled: boolean) => setState((prev) => ({ ...prev, soundEnabled: enabled })),
    [],
  );

  const resetAll = useCallback(() => setState(createInitialState()), []);

  const clearHistory = useCallback(() => setState((prev) => ({ ...prev, logs: {} })), []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      status,
      todayKey,
      today: state.logs[todayKey] ?? blank(todayKey),
      logCigarette,
      undoLastCigarette,
      logCraving,
      logBreath,
      patchSettings,
      setHaptics,
      setSound,
      resetAll,
      clearHistory,
    }),
    [
      state,
      status,
      todayKey,
      logCigarette,
      undoLastCigarette,
      logCraving,
      logBreath,
      patchSettings,
      setHaptics,
      setSound,
      resetAll,
      clearHistory,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
