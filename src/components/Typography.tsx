import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { lineHeight, numeric, palette, type } from '../theme/tokens';

type Variant = keyof typeof type;

type Props = {
  variant?: Variant;
  color?: string;
  numericFigures?: boolean;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  children?: React.ReactNode;
};

/** Text with the app's type ramp applied. */
export function T({
  variant = 'body',
  color = palette.ink,
  numericFigures = false,
  align,
  style,
  numberOfLines,
  children,
}: Props) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        type[variant] as TextStyle,
        lineHeight[variant] !== undefined ? { lineHeight: lineHeight[variant] } : null,
        { color },
        numericFigures ? numeric : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Uppercase, letter-spaced label — the small "ODDECH · 3 MIN" style headers. */
export function Eyebrow({
  children,
  color = palette.inkFaint,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <T variant="captionBold" color={color} style={[styles.eyebrow, style]}>
      {children}
    </T>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
});
