import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

type Props = {
  /** Outer diameter, including the glow field. */
  size: number;
  /** Core orb diameter. */
  core: number;
  /** 0 = pale/inert, 1 = fully inviting blue. */
  intensity?: number;
  /** Scales the bright halo band with the breath. */
  haloScale?: Animated.Value;
};

/**
 * The "Oddech" orb. Three stacked parts, matching the reference:
 *   1. a diffuse glow field that always fills `size`
 *   2. a bright rounded-square halo that grows and shrinks with the breath
 *   3. a frosted capsule with the glassy white core on top
 */
export function BreathingOrb({ size, core, intensity = 1, haloScale }: Props) {
  const tint = Math.min(1, Math.max(0, intensity));

  // The bright halo sits between the glow field and the capsule.
  const band = Math.round(core * 1.34);
  const bandRadius = Math.round(band * 0.3);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* 1. Diffuse glow field */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0.34" stopColor="#9FCCFF" stopOpacity={0.5 * tint} />
            <Stop offset="0.62" stopColor="#BEDCFF" stopOpacity={0.22 * tint} />
            <Stop offset="1" stopColor="#DCEBFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#orbGlow)" />
      </Svg>

      {/* 2. Bright halo band — the part that breathes */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: band,
            height: band,
            borderRadius: bandRadius,
            backgroundColor: `rgba(150,206,255,${0.72 * tint})`,
          },
          haloScale ? { transform: [{ scale: haloScale }] } : null,
        ]}
      />

      {/* 3a. Frosted capsule */}
      <View
        style={{
          position: 'absolute',
          width: core,
          height: core,
          borderRadius: Math.round(core * 0.36),
          backgroundColor: `rgba(255,255,255,${0.34 + 0.2 * tint})`,
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.92)',
          overflow: 'hidden',
          shadowColor: '#3B86D6',
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        {/* 3b. Glassy core, inset a touch from the capsule edges */}
        <View
          style={{
            flex: 1,
            margin: Math.round(core * 0.13),
            borderRadius: Math.round(core * 0.24),
            backgroundColor: `rgba(255,255,255,${0.55 + 0.25 * tint})`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: '62%',
              height: '62%',
              borderRadius: 999,
              backgroundColor: `rgba(226,241,255,${0.6 * tint})`,
            }}
          />
        </View>
      </View>
    </View>
  );
}
