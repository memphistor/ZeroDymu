import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../../components/Card';
import { ChevronRight, SettingsIcon } from '../../components/Icons';
import { LimitChart } from '../../components/LimitChart';
import { Eyebrow, T } from '../../components/Typography';
import { formatShortDate, pluralCigarettes, pluralDays } from '../../lib/date';
import { createHaptics } from '../../lib/haptics';
import { summarise } from '../../lib/stats';
import { useStore } from '../../store/store';
import { palette, radius, shadow, space } from '../../theme/tokens';

type Range = 14 | 30;

export default function ProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, todayKey, today } = useStore();
  const [range, setRange] = useState<Range>(14);

  const haptics = useMemo(() => createHaptics(state.hapticsEnabled), [state.hapticsEnabled]);
  const summary = useMemo(
    () => summarise(state.settings, state.logs, todayKey, range),
    [state.settings, state.logs, todayKey, range],
  );

  const reduction = Math.round(summary.actualReduction * 100);
  const startLabel = formatShortDate(state.settings.startDate);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.sm, paddingBottom: 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <T variant="caption" color={palette.inkFaint}>
              od {startLabel}
            </T>
            <T variant="title">Postęp</T>
          </View>
          <Segmented
            value={range}
            onChange={(next) => {
              haptics.select();
              setRange(next);
            }}
          />
        </View>

        {/* Headline number */}
        <View style={styles.headline}>
          <T variant="displayMid" color={palette.blueDeep} numericFigures style={styles.bigNumber}>
            −{reduction}%
          </T>
          <T variant="section" color={palette.inkSoft} style={styles.headlineCaption}>
            {`mniej papierosów niż na starcie`}
          </T>
        </View>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <T variant="meta" color={palette.inkSoft}>
              Papierosy dziennie
            </T>
            <View style={styles.legend}>
              <View style={styles.legendDash} />
              <T variant="caption" color={palette.inkFaint}>
                limit
              </T>
            </View>
          </View>
          <LimitChart points={summary.window} height={150} dense={range === 30} />
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat label="Dziś" value={`${today.count}`} />
          <Stat label="Średnio" value={summary.windowAverage.toFixed(1).replace('.', ',')} />
          <Stat label="Oszczędności" value={`${Math.round(summary.savedPln)} zł`} />
        </View>

        {/* Next small step */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Następny mały krok: jutro ${summary.limitTomorrow} ${pluralCigarettes(
            summary.limitTomorrow,
          )}`}
          onPress={() => {
            haptics.tap();
            router.push('/settings');
          }}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Card style={styles.nextStep}>
            <T variant="caption" color={palette.inkSoft}>
              Następny mały krok
            </T>
            <T variant="section" style={styles.nextStepValue}>
              {`Jutro: ${summary.limitTomorrow} ${pluralCigarettes(summary.limitTomorrow)}`}
            </T>
            <T variant="meta" color={palette.inkSoft} style={styles.planBody}>
              Zmieniasz tempo w ustawieniach.
            </T>
            <View style={styles.goRow}>
              <T variant="meta" color={palette.blueDeep} style={styles.goLabel}>
                Otwórz ustawienia
              </T>
              <ChevronRight size={17} color={palette.blue} />
            </View>
          </Card>
        </Pressable>

        {/* Plan context */}
        <Card tint="wash" style={styles.planCard}>
          <Eyebrow color={palette.blueDeep}>Plan</Eyebrow>
          <T variant="meta" color={palette.inkSoft} style={styles.planBody}>
            {`Dzień ${summary.day} · ${summary.streak} ${
              pluralDays(summary.streak)
            } z rzędu w planie. Start: ${state.settings.baseline} papierosów dziennie.`}
          </T>
        </Card>
      </ScrollView>
    </View>
  );
}

function Segmented({ value, onChange }: { value: Range; onChange: (next: Range) => void }) {
  const options: { key: Range; label: string; hint: string }[] = [
    { key: 14, label: '14 dni', hint: 'ostatnie 14 dni' },
    { key: 30, label: 'Miesiąc', hint: 'ostatnie 30 dni' },
  ];
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={option.hint}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.key)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <T
              variant="caption"
              color={active ? palette.blueDeep : palette.inkSoft}
              style={styles.segmentLabel}
            >
              {option.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <T variant="caption" color={palette.inkSoft}>
        {label}
      </T>
      <T variant="section" numericFigures style={styles.statValue}>
        {value}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.canvas },
  content: { paddingHorizontal: space.lg },
  header: { marginTop: space.md, gap: space.md },
  headerText: { gap: 2 },
  segmented: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: palette.surface,
    ...shadow.soft,
  },
  segmentLabel: { fontWeight: '600' },
  headline: { marginTop: space.xl },
  bigNumber: { color: palette.blueDeep },
  headlineCaption: { marginTop: 2 },
  chartCard: { marginTop: space.xl },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDash: {
    width: 16,
    height: 2,
    backgroundColor: palette.inkFaint,
    opacity: 0.5,
  },
  statsRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  stat: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
    ...shadow.soft,
  },
  statValue: { marginTop: 6 },
  nextStep: {
    marginTop: space.md,
  },
  nextStepValue: { marginTop: 4, color: palette.ink },
  goRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: space.md,
  },
  goLabel: { fontWeight: '600' },
  planCard: { marginTop: space.md },
  planBody: { marginTop: 6, lineHeight: 21 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
