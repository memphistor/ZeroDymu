import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Thin wrapper so every interaction feels the same and can be globally muted
 * from settings. No-ops on web and swallows errors on unsupported devices.
 */
export function createHaptics(enabled: boolean) {
  const run = (fn: () => Promise<void>) => {
    if (!enabled || Platform.OS === 'web') return;
    fn().catch(() => {});
  };
  return {
    /** Light tap — counter increments, segmented controls. */
    tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    /** Medium tap — primary actions like "Mam ochotę zapalić". */
    press: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
    /** Success notification — logging progress, finishing a session. */
    success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
    /** Selection ticks — tab changes, chart scrubbing. */
    select: () => run(() => Haptics.selectionAsync()),
  };
}

export type HapticsApi = ReturnType<typeof createHaptics>;
