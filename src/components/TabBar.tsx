import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarsIcon, BreathIcon, SunIcon } from './Icons';
import { T } from './Typography';
import { useStore } from '../store/store';
import { createHaptics } from '../lib/haptics';
import { palette, radius, shadow } from '../theme/tokens';

/** BlurView is unsupported on the web build, so fall back to a translucent fill. */
const IS_WEB = Platform.OS === 'web';

const ICONS: Record<string, (props: { size?: number; color?: string }) => React.ReactElement> = {
  index: SunIcon,
  breath: BreathIcon,
  progress: BarsIcon,
};

/**
 * Floating "liquid glass" capsule, matching the reference tab bar: a soft
 * translucent pill inset from the screen edges, with the active item
 * highlighted by a light blue chip.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { state: app, status } = useStore();
  const haptics = React.useMemo(() => createHaptics(app.hapticsEnabled), [app.hapticsEnabled]);

  // Wait for hydration so colors don't flicker on cold start.
  if (status === 'loading') return <View style={{ height: insets.bottom }} />;

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={IS_WEB ? 40 : 44}
        tint="light"
        style={[styles.pill, IS_WEB ? styles.pillWeb : null]}
        pointerEvents="auto"
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key].options;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;
          const Icon = ICONS[route.name] ?? SunIcon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              haptics.select();
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.item}
            >              <View style={[styles.chip, focused && styles.chipActive]}>
                <Icon size={21} color={focused ? palette.blueDeep : palette.inkFaint} />
                <T
                  variant="caption"
                  color={focused ? palette.blueDeep : palette.inkFaint}
                  style={styles.label}
                >
                  {label}
                </T>
              </View>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 64,
    paddingHorizontal: 6,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
    ...shadow.card,
    shadowOpacity: 0.12,
    shadowRadius: 26,
  },
  pillWeb: {
    // `backdrop-filter` is what produces the frosted look in the browser.
    backdropFilter: 'blur(18px) saturate(160%)',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    gap: 2,
  },
  chipActive: {
    backgroundColor: palette.blueWash,
  },
  label: {
    letterSpacing: -0.1,
  },
});

