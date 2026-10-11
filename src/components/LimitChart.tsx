import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { DayPoint } from '../lib/stats';
import { weekdayShort } from '../lib/date';
import { T } from './Typography';
import { gradients, palette } from '../theme/tokens';

type Props = {
  points: DayPoint[];
  /** Height of the plot area, including axis labels. */
  height?: number;
  /** Thin bars, no per-bar labels — used for the 30-day view. */
  dense?: boolean;
};

/**
 * Daily-cigarette bars with a dashed plan line. Bars above the plan turn
 * saturated blue; today is emphasised and future days are dimmed.
 */
export function LimitChart({ points, height = 150, dense = false }: Props) {
  const max = Math.max(...points.map((p) => Math.max(p.count, p.limit)), 1);
  const labelHeight = dense ? 0 : 20;
  const plotHeight = height - labelHeight;
  const gap = dense ? 3 : 8;
  const barRadius = dense ? 2 : 5;
  const limitLineBottom = (points[points.length - 1]?.limit ?? 0) / max * plotHeight;

  return (
    <View>
      <View style={[styles.plot, { height: plotHeight }]}>
        {/* Dashed plan line */}
        <View style={[styles.limitLine, { bottom: limitLineBottom, gap }]} pointerEvents="none">
          {points.map((p) => (
            <View key={p.key} style={styles.dash} />
          ))}
        </View>

        {points.map((point) => {
          const barHeight = Math.max(dense ? 3 : 6, (point.count / max) * plotHeight);
          const overLimit = point.count > point.limit;
          const active = point.isToday;
          const fill = active
            ? gradients.barActive[1]
            : overLimit
              ? gradients.barActive[0]
              : gradients.barIdle[0];
          return (
            <View key={point.key} style={styles.column}>
              <View
                style={[
                  styles.bar,
                  dense && styles.barDense,
                  {
                    height: barHeight,
                    backgroundColor: fill,
                    borderTopLeftRadius: barRadius,
                    borderTopRightRadius: barRadius,
                    borderBottomLeftRadius: barRadius,
                    borderBottomRightRadius: barRadius,
                    opacity: point.isFuture ? 0.35 : 1,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {!dense && (
        <View style={[styles.labels, { gap }]}>
          {points.map((point) => (
            <View key={point.key} style={styles.labelCell}>
              <T
                variant="caption"
                color={point.isToday ? palette.blueDeep : palette.inkFaint}
                style={point.isToday ? styles.labelToday : undefined}
              >
                {point.isToday ? 'Dziś' : weekdayShort(point.key)}
              </T>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    maxWidth: 22,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  barDense: {
    maxWidth: 10,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  limitLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  dash: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
    marginHorizontal: 3,
    backgroundColor: palette.inkFaint,
    opacity: 0.4,
  },
  labels: {
    flexDirection: 'row',
    marginTop: 8,
  },
  labelCell: {
    flex: 1,
    alignItems: 'center',
  },
  labelToday: {
    fontWeight: '600',
  },
});
