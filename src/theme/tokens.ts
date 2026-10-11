/** Design tokens — Apple HIG / iOS look.
 * Ultra-minimal, airy, soft blue accents, liquid-glass cards.
 * Values measured directly from the design reference (390pt-wide iPhone frame).
 */

import type { TextStyle } from 'react-native';

export const palette = {
  // Surfaces
  canvas: '#FFFFFF',
  canvasTint: '#F7FBFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F7FB',
  hairline: 'rgba(11, 39, 66, 0.07)',

  // Accents (sampled from reference: primary 28,142,255 / dark 5,112,235)
  blue: '#1C8EFF',
  blueDeep: '#0570EB',
  blueSoft: '#8FC7FF',
  blueWash: '#EDF6FF',
  blueWashStrong: '#DEEDFF',

  // Text
  ink: '#0A121C',
  inkSoft: '#5A6B7C',
  inkFaint: '#93A3B3',
  onAccent: '#FFFFFF',
} as const;

/**
 * Gradient ramps used across the app. Every ramp starts with a white margin so
 * shapes blend into the canvas like the reference ("liquid glass").
 */
export const gradients = {
  ring: ['#7CB9FF', '#1C8EFF', '#0466D8'] as const,
  plus: ['#41A0FF', '#0A78F5'] as const,
  barActive: ['#6DB6FF', '#0A78F5'] as const,
  barIdle: ['#DDEEFF', '#CFE5FC'] as const,
  craving: ['#F3F9FF', '#E7F2FF'] as const,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  /** Card and button radius, measured from the reference (~22pt). */
  xl: 22,
  xxl: 30,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const type = {
  eyebrow: { fontSize: 13, fontWeight: '600', letterSpacing: 0.7 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.9 },
  titleSmall: { fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
  /** The big counter inside the ring — measured cap height ≈ 83pt. */
  display: { fontSize: 116, fontWeight: '600', letterSpacing: -4 },
  displayMid: { fontSize: 62, fontWeight: '600', letterSpacing: -2.4 },
  section: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3 },
  body: { fontSize: 16, fontWeight: '500', letterSpacing: -0.2 },
  meta: { fontSize: 14, fontWeight: '500', letterSpacing: -0.1 },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0 },
  captionBold: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  cta: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3 },
} as const;

/** Explicit line heights so large numerals don't clip. */
export const lineHeight: Partial<Record<keyof typeof type, number>> = {
  display: 122,
  displayMid: 68,
  title: 40,
};

/**
 * iOS-style elevation: wide, very soft, low-opacity shadows.
 * On Android `shadowColor` etc. are ignored, so we rely on `elevation` there.
 */
export const shadow = {
  card: {
    shadowColor: '#0B2742',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#0B72E8',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  soft: {
    shadowColor: '#0B2742',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
} as const;

/** Tabular figures so numbers don't jitter while animating. */
export const numeric: TextStyle = { fontVariant: ['tabular-nums'] };
