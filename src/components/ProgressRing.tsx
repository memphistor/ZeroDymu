import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { gradients, palette } from '../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** 0..1 */
  progress: number;
  size: number;
  stroke?: number;
  children?: React.ReactNode;
};

/**
 * Progress ring with a gradient stroke, a soft outer glow and a warm track.
 * Geometry matches the reference: the aria inside the ring is ~55% of it.
 */
export function ProgressRing({ progress, size, stroke = 15, children }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  // Reference: outer ring diameter ≈ 132pt of a 260pt circle, stroke ≈ 15pt.
  const outerRadius = size * 0.5 * 0.95;
  const radius = outerRadius - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animated = useRef(new Animated.Value(clamped)).current;
  const first = useRef(true);

  useEffect(() => {
    // Animate on updates, but snap on the very first paint.
    if (first.current) {
      first.current = false;
      animated.setValue(clamped);
      return;
    }
    Animated.timing(animated, {
      toValue: clamped,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animated, clamped]);

  const dashOffset = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradients.ring[0]} />
            <Stop offset="0.5" stopColor={gradients.ring[1]} />
            <Stop offset="1" stopColor={gradients.ring[2]} />
          </LinearGradient>
          <RadialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0.55" stopColor={palette.blue} stopOpacity={0.16} />
            <Stop offset="0.82" stopColor={palette.blue} stopOpacity={0.06} />
            <Stop offset="1" stopColor={palette.blue} stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="trackStroke" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.blue} stopOpacity={0.07} />
            <Stop offset="1" stopColor={palette.blue} stopOpacity={0.03} />
          </LinearGradient>
        </Defs>

        {/* Ambient halo behind the whole ring. */}
        <Circle cx={center} cy={center} r={size / 2} fill="url(#ringGlow)" />

        {/* Whisper-faint track — the reference shows none, but it orients the eye. */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#trackStroke)"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress, drawn clockwise from the top. */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#ringStroke)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children}
    </View>
  );
}
