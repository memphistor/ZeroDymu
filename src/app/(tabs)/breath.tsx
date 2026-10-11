import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BreathingOrb } from '../../components/BreathingOrb';
import { Card } from '../../components/Card';
import { PauseIcon, PlayIcon, SoundIcon } from '../../components/Icons';
import { Eyebrow, T } from '../../components/Typography';
import { formatClock, pluralCycles, pluralSessions } from '../../lib/date';
import { createHaptics } from '../../lib/haptics';
import { PATTERN_LABEL, SESSION_SECONDS, useBreathing, type Phase } from '../../lib/useBreathing';
import { useStore } from '../../store/store';
import { gradients, palette, radius, shadow, space } from '../../theme/tokens';

/** Orb scale at the end of each phase: breathe in to full, out to 62%. */
const SCALE: Record<Phase | 'rest', number> = {
  inhale: 1,
  hold: 1,
  exhale: 0.62,
  rest: 0.62,
};

export default function BreathScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { state, today, logBreath } = useStore();
  const haptics = useMemo(() => createHaptics(state.hapticsEnabled), [state.hapticsEnabled]);

  const session = useBreathing();
  const [soundOn, setSoundOn] = useState(state.soundEnabled);
  const [celebrating, setCelebrating] = useState(false);

  const core = Math.min(width - 160, 138);
  const halo = Math.round(core * 2.4);
  const haloScale = useRef(new Animated.Value(SCALE.rest)).current;

  const idle = session.idle;
  const headline = idle ? 'Wdech' : session.complete ? 'Spokój' : session.label;

  // Record each finished session exactly once. `today.breaths` is the source of
  // truth, so nothing is double counted across remounts.
  const counted = useRef(false);
  useEffect(() => {
    if (session.complete && !counted.current) {
      counted.current = true;
      setCelebrating(true);
      haptics.success();
      logBreath();
    }
    if (!session.complete) counted.current = false;
  }, [session.complete, haptics, logBreath]);

  // Animate the halo toward the target scale of the current phase.
  useEffect(() => {
    if (idle) {
      haloScale.setValue(SCALE.rest);
      return;
    }
    if (session.complete) {
      Animated.timing(haloScale, {
        toValue: SCALE.rest,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      return;
    }
    if (!session.running) return;

    // `secondsLeftInPhase` already counts down within the phase; converting
    // progress back to seconds would round the final tick down to 0.
    const remaining = Math.max(0, session.secondsLeftInPhase - session.phaseProgress);
    Animated.timing(haloScale, {
      toValue: SCALE[session.phase],
      duration: Math.max(220, Math.round(remaining * 1000)),
      // Inhale and exhale ease like breath; the hold is a gentle settle.
      easing: session.phase === 'hold' ? Easing.out(Easing.quad) : Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();
  }, [
    haloScale,
    idle,
    session.complete,
    session.running,
    session.phase,
    session.secondsLeftInPhase,
    session.phaseProgress,
  ]);

  const onPrimary = () => {
    haptics.press();
    setCelebrating(false);
    if (session.complete || session.idle) session.start();
    else session.toggle();
  };

  const onRestart = () => {
    haptics.tap();
    setCelebrating(false);
    session.start();
  };

  const showCountdown = !idle && !session.complete;

  const primaryLabel = session.running
    ? 'Pauza'
    : session.complete
      ? 'Jeszcze raz'
      : 'Uruchom oddech';

  return (
    <View style={styles.root}>
      {/* Ambient wash behind the orb */}
      <View style={styles.wash} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(214,235,255,0.75)', 'rgba(255,255,255,0)']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.sm, paddingBottom: 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Eyebrow color={palette.inkFaint}>
            {session.running
              ? `oddech ${PATTERN_LABEL}`
              : session.complete
                ? 'sesja zakończona'
                : 'oddech · 3 min'}
          </Eyebrow>
          <T variant="title" style={styles.title}>
            {headline}
          </T>
        </View>

        {/* Orb */}
        <View style={[styles.orbWrap, { height: halo }]}>
          <BreathingOrb
            size={halo}
            core={core}
            intensity={session.running ? 1 : 0.7}
            haloScale={haloScale}
          />
          <View style={styles.orbCenter} pointerEvents="none">
            <T variant="displayMid" numericFigures color={palette.ink}>
              {showCountdown ? session.secondsLeftInPhase : 4}
            </T>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerBlock}>
          <T variant="title" numericFigures style={styles.timer}>
            {formatClock(idle ? SESSION_SECONDS : session.remaining)}
          </T>
          <T variant="meta" color={palette.inkSoft} style={styles.timerCaption}>
            {idle
              ? `oddech ${PATTERN_LABEL}`
              : `${session.label.toLowerCase()} · ${session.hint}`}
          </T>
        </View>

        {/* Session stats */}
        <View style={styles.statsRow}>
          <StatCard
            value={`${today.breaths}`}
            label={`${pluralSessions(today.breaths)} dziś`}
            tint
          />
          <StatCard
            value={`${session.cycles}`}
            label={`${pluralCycles(session.cycles)}`}
          />
          <StatCard value={`${today.cravings.length}`} label="zachcianki" />
        </View>

        {/* Primary control */}
        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            onPress={onPrimary}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <LinearGradient
              colors={[...gradients.plus]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.playButton}
            >
              {session.running ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.secondaryRow}>
          <Pill label={session.complete ? 'Jeszcze raz' : 'Od nowa'} onPress={onRestart} />
          <Pill
            label="Dźwięk"
            icon={
              <SoundIcon
                size={15}
                color={soundOn ? palette.blueDeep : palette.inkSoft}
                muted={!soundOn}
              />
            }
            active={soundOn}
            onPress={() => {
              haptics.tap();
              setSoundOn((v) => !v);
            }}
          />
        </View>

        {/* Guidance */}
        <Card style={styles.guide}>
          <T variant="section" style={styles.guideTitle}>
            Jak to działa
          </T>
          <T variant="meta" color={palette.inkSoft} style={styles.guideBody}>
            Wdech nosem przez 4 sekundy, zatrzymaj na 4, potem spokojny wydech przez 6. Trzy minuty
            zwykle wystarczą, żeby zachcianka opadła.
          </T>
          {celebrating && (
            <T variant="caption" color={palette.blueDeep} style={styles.celebrate}>
              Sesja zapisana. Zachcianka zwykle wraca słabsza — daj jej minutę.
            </T>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

function StatCard({ value, label, tint = false }: { value: string; label: string; tint?: boolean }) {
  return (
    <View style={[styles.statCard, tint && styles.statCardTint]}>
      <T variant="section" color={tint ? palette.blueDeep : palette.ink} numericFigures>
        {value}
      </T>
      <T variant="caption" color={palette.inkSoft} numberOfLines={1}>
        {label}
      </T>
    </View>
  );
}

function Pill({
  label,
  icon,
  active = false,
  onPress,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.pill, active && styles.pillActive, pressed && styles.pressed]}
    >
      {icon}
      <T variant="meta" color={active ? palette.blueDeep : palette.ink} style={styles.pillLabel}>
        {label}
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.canvas },
  wash: { position: 'absolute', left: 0, right: 0, top: 110, bottom: 0 },
  content: { paddingHorizontal: space.lg },
  header: { marginTop: space.md, alignItems: 'center' },
  title: { marginTop: 4 },
  orbWrap: { alignItems: 'center', justifyContent: 'center', marginTop: -space.sm },
  orbCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  timerBlock: { alignItems: 'center', marginTop: space.sm },
  timer: { fontSize: 40, letterSpacing: -1.6 },
  timerCaption: { marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
    ...shadow.soft,
  },
  statCardTint: {
    backgroundColor: palette.blueWash,
    borderColor: 'rgba(28,142,255,0.16)',
  },
  controls: { alignItems: 'center', marginTop: space.lg },
  playButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
    ...shadow.soft,
  },
  pillActive: {
    backgroundColor: palette.blueWash,
    borderColor: 'rgba(28,142,255,0.16)',
  },
  pillLabel: { fontWeight: '600' },
  pressed: { opacity: 0.86, transform: [{ scale: 0.96 }] },
  guide: { marginTop: space.xl },
  guideTitle: { marginBottom: 6 },
  guideBody: { lineHeight: 21 },
  celebrate: { marginTop: space.sm, lineHeight: 18 },
});
