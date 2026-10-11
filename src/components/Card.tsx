import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radius, shadow } from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  /** Card fill. `wash` mirrors the blue-tinted craving button from the design. */
  tint?: 'surface' | 'wash' | 'strong';
  padded?: boolean | number;
  style?: StyleProp<ViewStyle>;
};

/** The app's standard card: flat near-white surface, hairline border, soft shadow. */
export function Card({ children, tint = 'surface', padded = 16, style }: Props) {
  const backgroundColor =
    tint === 'surface' ? palette.surface : tint === 'wash' ? palette.blueWash : palette.blueWashStrong;
  return (
    <View
      style={[
        styles.base,
        { backgroundColor, padding: padded === false ? 0 : typeof padded === 'number' ? padded : 16 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
    ...shadow.soft,
  },
});
