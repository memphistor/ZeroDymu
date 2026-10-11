import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../../components/Card';
import { MinusIcon, PlusIcon, SettingsIcon, VapourIcon } from '../../components/Icons';
import { ProgressRing } from '../../components/ProgressRing';
import { T } from '../../components/Typography';
import { formatElapsed, formatLongDate, pluralCigarettes, pluralLeft } from '../../lib/date';
import { createHaptics } from '../../lib/haptics';
import { summarise } from '../../lib/stats';
import { useStore } from '../../store/store';
import { gradients, palette, radius, shadow, space, type } from '../../theme/tokens';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { state, today, todayKey, logCigarette, undoLastCigarette, logCraving } = useStore();

  const haptics = useMemo(() => createHaptics(state.hapticsEnabled), [state.hapticsEnabled]);
  const summary = useMemo(
    () => summarise(state.settings, state.logs, todayKey),
    [state.settings, state.logs, todayKey],
  );

  const { count } = today;
  const limit = summary.today.limit;
  const progress = limit > 0 ? count / limit : 0;
  const lastAt = today.at.length ? today.at[today.at.length - 1] : null;
  const ringSize = Math.min(width - 136, 258);

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
              {formatLongDate()}
            </T>
            <T variant="title" style={styles.title}>
              Dziś
            </T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ustawienia"
            hitSlop={10}
            onPress={() => {
              haptics.tap();
              router.push('/settings');
            }}
            style={({ pressed }) => [styles.gear, pressed && styles.pressed]}
          >
            <SettingsIcon size={19} color={palette.inkSoft} />
          </Pressable>
        </View>

        {/* Progress ring */}
        <View style={styles.ringWrap}>
          <ProgressRing progress={progress} size={ringSize} stroke={15}>
            <View style={styles.ringInner}>
              <T variant="display" numericFigures style={styles.count}>
                {count}
              </T>
              <T variant="meta" color={palette.inkSoft} style={styles.ofLimit}>
                z {limit} dzisiaj
              </T>
            </View>
          </ProgressRing>
        </View>

        {/* Counter controls */}
        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cofnij papierosa"
            disabled={count === 0}
            hitSlop={6}
            onPress={() => {
              haptics.tap();
              undoLastCigarette();
            }}
            style={({ pressed }) => [
              styles.circleSmall,
              count === 0 && styles.circleDisabled,
              pressed && count > 0 && styles.pressed,
            ]}
          >
            <MinusIcon size={20} color={count === 0 ? palette.inkFaint : palette.ink} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zapisz papierosa"
            hitSlop={6}
            onPress={() => {
              haptics.press();
              logCigarette();
            }}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <LinearGradient
              colors={[...gradients.plus]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.circleLarge}
            >
              <PlusIcon size={24} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Facts card */}
        <Card style={styles.facts} padded={0}>
          <View style={styles.factRow}>
            <T variant="meta" color={palette.inkSoft}>
              Ostatni papieros
            </T>
            <T variant="meta" color={palette.ink} style={styles.factValue} numericFigures>
              {lastAt ? `${formatElapsed(lastAt)} temu` : 'brak dzisiaj'}
            </T>
          </View>
          <View style={[styles.factRow, styles.factRowDivider]}>
            <T variant="meta" color={palette.inkSoft}>
              Jutro
            </T>
            <T variant="meta" color={palette.ink} style={styles.factValue}>
              {`${summary.limitTomorrow} ${pluralCigarettes(summary.limitTomorrow)}`}
            </T>
          </View>
          <View style={[styles.factRow, styles.factRowDivider]}>
            <T variant="meta" color={palette.inkSoft}>
              W planie
            </T>
            <T variant="meta" color={palette.ink} style={styles.factValue}>
              {`dzień ${summary.day} · seria ${summary.streak}`}
            </T>
          </View>
        </Card>

        {/* Craving CTA */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mam ochotę zapalić"
          onPress={() => {
            haptics.press();
            logCraving();
            router.push('/breath');
          }}
          style={({ pressed }) => [styles.craving, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={[...gradients.craving]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cravingInner}
          >
            <VapourIcon size={20} color={palette.blueDeep} />
            <T variant="cta" color={palette.blueDeep}>
              Mam ochotę zapalić
            </T>
          </LinearGradient>
        </Pressable>

        {/* Small footnote keeps the screen airy but explains the plan */}
        <T variant="caption" color={palette.inkFaint} align="center" style={styles.footnote}>
          {count > limit
            ? `${count - limit} ${pluralCigarettes(count - limit)} powyżej planu — oddech pomaga wrócić`
            : `Na dziś ${pluralLeft(Math.max(0, limit - count))} jeszcze ${Math.max(
                0,
                limit - count,
              )} ${pluralCigarettes(Math.max(0, limit - count))} do planu`}
        </T>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  content: {
    paddingHorizontal: space.lg,
  },
  header: {
    marginTop: space.md,
    marginBottom: space.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  gear: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
    ...shadow.soft,
  },
  title: {
    marginTop: 2,
  },
  ringWrap: {
    alignItems: 'center',
    marginTop: space.sm,
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    lineHeight: type.display.fontSize * 1.05,
  },
  ofLimit: {
    marginTop: -2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginTop: space.xl,
  },
  circleSmall: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
    ...shadow.soft,
  },
  circleDisabled: {
    opacity: 0.55,
  },
  circleLarge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }],
  },
  facts: {
    marginTop: space.xl,
    overflow: 'hidden',
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: 15,
  },
  factRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.hairline,
  },
  factValue: {
    fontWeight: '600',
  },
  craving: {
    marginTop: space.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.soft,
  },
  cravingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: 17,
  },
  footnote: {
    marginTop: space.lg,
    paddingHorizontal: space.md,
    lineHeight: 18,
  },
});
