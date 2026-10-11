import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Card } from '../components/Card';
import { T } from '../components/Typography';
import { formatLongDate } from '../lib/date';
import { dailyLimit, dayIndex } from '../lib/stats';
import { useStore } from '../store/store';
import { palette, radius, shadow, space } from '../theme/tokens';

export default function SettingsScreen() {
  const {
    state,
    todayKey,
    patchSettings,
    setHaptics,
    setSound,
    resetAll,
    clearHistory,
  } = useStore();

  const { settings } = state;
  const plan = useMemo(() => {
    // How many plan days until the taper reaches the floor.
    const daysToFloor = Math.max(0, (settings.baseline - settings.floor) * settings.stepDays);
    const day = Math.max(1, dayIndex(settings.startDate, todayKey) + 1);
    const stepLabel = settings.stepDays === 1 ? 'codziennie' : `co ${settings.stepDays} dni`;
    return { daysToFloor, day, todayLimit: dailyLimit(settings, todayKey), stepLabel };
  }, [settings, todayKey]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card>
        <T variant="caption" color={palette.inkSoft}>
          Punkt startowy
        </T>
        <T variant="section" style={styles.value}>
          {`${settings.baseline} papierosów dziennie`}
        </T>
        <Stepper
          label="Papierosy na starcie"
          value={settings.baseline}
          min={5}
          max={60}
          onChange={(baseline) => patchSettings({ baseline })}
        />
        <Divider />
        <Stepper
          label="Mniej o 1 co (dni)"
          value={settings.stepDays}
          min={1}
          max={14}
          onChange={(stepDays) => patchSettings({ stepDays })}
        />
        <Divider />
        <Stepper
          label="Cena paczki (zł)"
          value={settings.packPrice}
          min={5}
          max={60}
          onChange={(packPrice) => patchSettings({ packPrice })}
        />
      </Card>

      <Card style={styles.spaced}>
        <Row
          label="Wibracje"
          hint="Delikatne potwierdzenie każdego dotknięcia"
          value={state.hapticsEnabled}
          onChange={setHaptics}
        />
        <Divider />
        <Row
          label="Dźwięk oddechu"
          hint="Cichy sygnał przy zmianie fazy"
          value={state.soundEnabled}
          onChange={setSound}
        />
      </Card>

      <Card tint="wash" style={styles.spaced}>
        <T variant="caption" color={palette.inkSoft}>
          Twój plan
        </T>
        <T variant="section" style={styles.value}>
          {`Dzień ${plan.day} · limit dziś ${plan.todayLimit}`}
        </T>
        <T variant="meta" color={palette.inkSoft} style={styles.planBody}>
          {`Start ${formatLongDate(new Date(`${settings.startDate}T00:00:00`))}. Jeden papieros mniej ${plan.stepLabel}. `}
          {plan.daysToFloor > 0
            ? `Docelowy limit osiągniesz za około ${plan.daysToFloor} dni.`
            : 'Jesteś już na docelowym poziomie.'}
        </T>
      </Card>

      <Card style={styles.spaced}>
        <T variant="caption" color={palette.inkSoft}>
          Dane
        </T>
        <T variant="meta" color={palette.inkSoft} style={styles.planBody}>
          Historia jest zapisana tylko na tym urządzeniu.
        </T>
        <Pressable onPress={clearHistory} style={({ pressed }) => [styles.danger, pressed && styles.pressed]}>
          <T variant="meta" color={palette.ink} style={styles.dangerLabel}>
            Wyczyść historię
          </T>
        </Pressable>
        <Pressable onPress={resetAll} style={({ pressed }) => [styles.danger, pressed && styles.pressed]}>
          <T variant="meta" color="#D64545" style={styles.dangerLabel}>
            Ustaw wszystko od nowa
          </T>
        </Pressable>
      </Card>
    </ScrollView>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <View style={styles.stepperRow}>
      <T variant="meta" color={palette.inkSoft} style={styles.stepperLabel}>
        {label}
      </T>
      <View style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: zmniejsz`}
          onPress={() => onChange(clamp(value - 1))}
          style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
        >
          <T variant="section" color={palette.ink}>
            −
          </T>
        </Pressable>
        <T variant="meta" numericFigures style={styles.stepperValue}>
          {value}
        </T>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: zwiększ`}
          onPress={() => onChange(clamp(value + 1))}
          style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
        >
          <T variant="section" color={palette.ink}>
            +
          </T>
        </Pressable>
      </View>
    </View>
  );
}

function Row({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchText}>
        <T variant="meta" color={palette.ink}>
          {label}
        </T>
        <T variant="caption" color={palette.inkFaint}>
          {hint}
        </T>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: palette.surfaceMuted, true: palette.blueSoft }}
        thumbColor={palette.surface}
        ios_backgroundColor={palette.surfaceMuted}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.canvasTint },
  content: { padding: space.lg, paddingBottom: 40 },
  spaced: { marginTop: space.md },
  value: { marginTop: 4 },
  planBody: { marginTop: 8, lineHeight: 21 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.hairline,
    marginVertical: space.md,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  stepperLabel: { flex: 1 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.pill,
    padding: 3,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    ...shadow.soft,
  },
  stepperValue: {
    minWidth: 44,
    textAlign: 'center',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  switchText: { flex: 1, gap: 2 },
  danger: {
    marginTop: space.md,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: palette.surfaceMuted,
  },
  dangerLabel: { fontWeight: '600' },
  pressed: { opacity: 0.85 },
});
