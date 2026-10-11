import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type Phase = 'inhale' | 'hold' | 'exhale';

export type PhaseSpec = {
  phase: Phase;
  /** Seconds this phase lasts. */
  seconds: number;
  label: string;
  /** Short verb shown next to the orb. */
  hint: string;
};

/** 4-4-6 — the pattern promoted on the reference's "Oddech" screen. */
export const PATTERN: PhaseSpec[] = [
  { phase: 'inhale', seconds: 4, label: 'Wdech', hint: 'nosem, spokojnie' },
  { phase: 'hold', seconds: 4, label: 'Zatrzymaj', hint: 'bez napięcia' },
  { phase: 'exhale', seconds: 6, label: 'Wydech', hint: 'ustami, powoli' },
];

export const PATTERN_SECONDS = PATTERN.reduce((sum, p) => sum + p.seconds, 0); // 14
/** Target session length, rounded up to whole cycles. */
export const SESSION_SECONDS = Math.ceil(180 / PATTERN_SECONDS) * PATTERN_SECONDS; // 182
export const SESSION_CYCLES = SESSION_SECONDS / PATTERN_SECONDS; // 13

/** Cumulative start offset of each phase inside a cycle. */
const OFFSETS: number[] = PATTERN.reduce<number[]>((acc, spec, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + PATTERN[i - 1].seconds);
  return acc;
}, []);

type PhaseState = {
  phase: Phase;
  spec: PhaseSpec;
  index: number;
  /** Seconds elapsed inside the current phase. */
  elapsed: number;
  /** 0..1 across the current phase. */
  progress: number;
};

/** Where we are inside the cycle, derived from a seconds offset. */
export function phaseAt(elapsedInCycle: number, subSecond = 0): PhaseState {
  const t = Math.max(0, elapsedInCycle + subSecond);
  for (let i = 0; i < PATTERN.length; i += 1) {
    const start = OFFSETS[i];
    const end = start + PATTERN[i].seconds;
    if (t < end) {
      const elapsed = t - start;
      return { phase: PATTERN[i].phase, spec: PATTERN[i], index: i, elapsed, progress: elapsed / PATTERN[i].seconds };
    }
  }
  const last = PATTERN.length - 1;
  return {
    phase: PATTERN[last].phase,
    spec: PATTERN[last],
    index: last,
    elapsed: PATTERN[last].seconds,
    progress: 1,
  };
}

type Snapshot = {
  running: boolean;
  /** Total seconds elapsed inside the current cycle (0..PATTERN_SECONDS). */
  cycleSeconds: number;
  /** Cycles completed. */
  cycles: number;
  complete: boolean;
};

const INITIAL: Snapshot = { running: false, cycleSeconds: 0, cycles: 0, complete: false };

/**
 * Drives a guided breathing session. A module-level accumulator keeps phase
 * math exact (no floating point drift) while the component re-renders on a
 * short interval for smooth animation.
 */
export function useBreathing() {
  const [snap, setSnap] = useState<Snapshot>(INITIAL);
  const [subSecond, setSubSecond] = useState(0);
  const secondsRef = useRef(0);

  // Coarse clock: one tick per second, deciding phase transitions.
  useEffect(() => {
    if (!snap.running) return;
    const id = setInterval(() => {
      setSnap((prev) => {
        if (!prev.running) return prev;
        secondsRef.current += 1;
        let { cycles, complete } = prev;
        let cycleSeconds = prev.cycleSeconds + 1;

        if (cycleSeconds >= PATTERN_SECONDS) {
          cycles += 1;
          if (cycles >= SESSION_CYCLES) {
            complete = true;
            cycleSeconds = PATTERN_SECONDS;
          } else {
            cycleSeconds = 0;
          }
        }
        return {
          running: complete ? false : prev.running,
          cycleSeconds,
          cycles,
          complete,
        };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [snap.running]);

  // Fine clock: drives the orb animation smoothly.
  useEffect(() => {
    if (!snap.running) {
      setSubSecond(0);
      return;
    }
    const started = Date.now();
    const id = setInterval(() => {
      setSubSecond(((Date.now() - started) % 1000) / 1000);
    }, 60);
    return () => clearInterval(id);
  }, [snap.running, snap.cycleSeconds]);

  const current = phaseAt(snap.cycleSeconds, subSecond);
  const totalElapsed = snap.cycles * PATTERN_SECONDS + Math.min(snap.cycleSeconds, PATTERN_SECONDS);

  const start = useCallback(() => {
    secondsRef.current = 0;
    setSnap({ running: true, cycleSeconds: 0, cycles: 0, complete: false });
  }, []);
  const pause = useCallback(() => setSnap((prev) => ({ ...prev, running: false })), []);
  const resume = useCallback(
    () => setSnap((prev) => (prev.complete ? { ...INITIAL, running: true } : { ...prev, running: true })),
    [],
  );
  const toggle = useCallback(() => {
    setSnap((prev) => (prev.running ? { ...prev, running: false } : { ...prev, running: true }));
  }, []);

  return useMemo(
    () => ({
      running: snap.running,
      complete: snap.complete,
      /** True before the very first breath of this visit. */
      idle: !snap.running && snap.cycles === 0 && snap.cycleSeconds === 0 && !snap.complete,
      cycleSeconds: snap.cycleSeconds,
      cycles: snap.cycles,
      /** 1-based cycle number currently in progress. */
      cycle: Math.min(snap.cycles + 1, SESSION_CYCLES),
      totalCycles: SESSION_CYCLES,
      totalSeconds: SESSION_SECONDS,
      /** Seconds left in the whole session. */
      remaining: Math.max(0, SESSION_SECONDS - totalElapsed),
      /** 0..1 across the whole session. */
      sessionProgress: Math.min(1, totalElapsed / SESSION_SECONDS),
      phase: current.phase,
      /** Short verb for the current phase, e.g. "Wdech". */
      label: current.spec.label,
      hint: current.spec.hint,
      /** 0..1 across the current phase — feed this to the orb animation. */
      phaseProgress: current.progress,
      /** Whole seconds left in the current phase, e.g. 4, 3, 2, 1. */
      secondsLeftInPhase: Math.max(1, Math.ceil(current.spec.seconds - current.elapsed - 1e-6)),
      start,
      pause,
      resume,
      toggle,
    }),
    [
      snap.running,
      snap.complete,
      snap.cycles,
      snap.cycleSeconds,
      current.phase,
      current.spec.label,
      current.spec.hint,
      current.spec.seconds,
      current.progress,
      current.elapsed,
      start,
      pause,
      resume,
      toggle,
    ],
  );
}

export type BreathingSession = ReturnType<typeof useBreathing>;

/** Human summary of the pattern, e.g. "4 · 4 · 6". */
export const PATTERN_LABEL = PATTERN.map((p) => p.seconds).join(' · ');
