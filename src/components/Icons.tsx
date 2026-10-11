import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export type IconProps = {
  size?: number;
  color?: string;
  /** Stroke width in px, scaled with the icon so it stays optically consistent. */
  weight?: number;
};

/** Sun / burst — the "Dziś" tab. */
export function SunIcon({ size = 24, color = '#0A121C', weight = 1.7 }: IconProps) {
  const c = size / 2;
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rays.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const inner = c - size * 0.34;
        const outer = c - size * 0.46;
        return (
          <Line
            key={deg}
            x1={c + inner * Math.cos(rad)}
            y1={c + inner * Math.sin(rad)}
            x2={c + outer * Math.cos(rad)}
            y2={c + outer * Math.sin(rad)}
            stroke={color}
            strokeWidth={weight}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={c} cy={c} r={size * 0.19} stroke={color} strokeWidth={weight} fill="none" />
    </Svg>
  );
}

/** Gear / dial — opens "Ustawienia". */
export function SettingsIcon({ size = 20, color = '#5A6B7C', weight = 1.6 }: IconProps) {
  const w = size;
  const hub = w * 0.31;
  const teeth = 8;
  const outer = w * 0.43;
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      {Array.from({ length: teeth }, (_, i) => {
        const rad = ((i * 360) / teeth * Math.PI) / 180;
        return (
          <Line
            key={i}
            x1={w / 2 + hub * Math.cos(rad)}
            y1={w / 2 + hub * Math.sin(rad)}
            x2={w / 2 + outer * Math.cos(rad)}
            y2={w / 2 + outer * Math.sin(rad)}
            stroke={color}
            strokeWidth={weight * 1.7}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={w / 2} cy={w / 2} r={hub} stroke={color} strokeWidth={weight} fill="none" />
    </Svg>
  );
}

/** Stacked breeze — the "Oddech" tab. */
export function BreathIcon({ size = 24, color = '#0A121C', weight = 1.7 }: IconProps) {
  const w = size;
  const stroke = { stroke: color, strokeWidth: weight, strokeLinecap: 'round' as const, fill: 'none' };
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Path d={`M${w * 0.12} ${w * 0.32} H${w * 0.62} a${w * 0.12} ${w * 0.12} 0 1 0 -${w * 0.12} -${w * 0.12}`} {...stroke} />
      <Path d={`M${w * 0.12} ${w * 0.54} H${w * 0.5}`} {...stroke} />
      <Path d={`M${w * 0.12} ${w * 0.76} H${w * 0.7} a${w * 0.13} ${w * 0.13} 0 1 1 -${w * 0.13} ${w * 0.13}`} {...stroke} />
    </Svg>
  );
}

/** Three ascending bars — the "Postęp" tab. */
export function BarsIcon({ size = 24, color = '#0A121C', weight = 1.7 }: IconProps) {
  const w = size;
  const bar = Math.max(1.6, weight);
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Rect x={w * 0.18} y={w * 0.56} width={bar} height={w * 0.3} rx={bar / 2} fill={color} />
      <Rect x={w * 0.47} y={w * 0.38} width={bar} height={w * 0.48} rx={bar / 2} fill={color} />
      <Rect x={w * 0.76} y={w * 0.2} width={bar} height={w * 0.66} rx={bar / 2} fill={color} />
    </Svg>
  );
}

/** Upward vapour — used by the craving button. */
export function VapourIcon({ size = 20, color = '#1C8EFF', weight = 1.6 }: IconProps) {
  const w = size;
  const stroke = { stroke: color, strokeWidth: weight, strokeLinecap: 'round' as const, fill: 'none' };
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Path d={`M${w * 0.32} ${w * 0.84} C${w * 0.18} ${w * 0.6} ${w * 0.46} ${w * 0.5} ${w * 0.32} ${w * 0.2}`} {...stroke} />
      <Path d={`M${w * 0.68} ${w * 0.84} C${w * 0.54} ${w * 0.6} ${w * 0.82} ${w * 0.5} ${w * 0.68} ${w * 0.2}`} {...stroke} />
    </Svg>
  );
}

export function MinusIcon({ size = 18, color = '#0A121C', weight = 2.2 }: IconProps) {
  const w = size;
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Line x1={w * 0.2} y1={w / 2} x2={w * 0.8} y2={w / 2} stroke={color} strokeWidth={weight} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 22, color = '#FFFFFF', weight = 2.4 }: IconProps) {
  const w = size;
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Line x1={w * 0.5} y1={w * 0.2} x2={w * 0.5} y2={w * 0.8} stroke={color} strokeWidth={weight} strokeLinecap="round" />
      <Line x1={w * 0.2} y1={w * 0.5} x2={w * 0.8} y2={w * 0.5} stroke={color} strokeWidth={weight} strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronRight({ size = 18, color = '#1C8EFF', weight = 2 }: IconProps) {
  const w = size;
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Path d={`M${w * 0.38} ${w * 0.24} L${w * 0.66} ${w * 0.5} L${w * 0.38} ${w * 0.76}`} stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function PauseIcon({ size = 22, color = '#FFFFFF', weight = 3 }: IconProps) {
  const w = size;
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Rect x={w * 0.34} y={w * 0.24} width={weight} height={w * 0.52} rx={weight / 2} fill={color} />
      <Rect x={w * 0.62} y={w * 0.24} width={weight} height={w * 0.52} rx={weight / 2} fill={color} />
    </Svg>
  );
}

export function PlayIcon({ size = 22, color = '#FFFFFF' }: IconProps) {
  const w = size;
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Path d={`M${w * 0.36} ${w * 0.24} L${w * 0.76} ${w * 0.5} L${w * 0.36} ${w * 0.76} Z`} fill={color} />
    </Svg>
  );
}

export function SoundIcon({ size = 16, color = '#0A121C', weight = 1.6, muted = false }: IconProps & { muted?: boolean }) {  const w = size;
  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Path
        d={`M${w * 0.14} ${w * 0.4} H${w * 0.3} L${w * 0.5} ${w * 0.24} V${w * 0.76} L${w * 0.3} ${w * 0.6} H${w * 0.14} Z`}
        fill={color}
      />
      {!muted && (
        <>
          <Path d={`M${w * 0.62} ${w * 0.36} a${w * 0.18} ${w * 0.18} 0 0 1 0 ${w * 0.28}`} stroke={color} strokeWidth={weight} strokeLinecap="round" fill="none" />
          <Path d={`M${w * 0.76} ${w * 0.26} a${w * 0.3} ${w * 0.3} 0 0 1 0 ${w * 0.48}`} stroke={color} strokeWidth={weight} strokeLinecap="round" fill="none" />
        </>
      )}
      {muted && (
        <Path d={`M${w * 0.62} ${w * 0.38} L${w * 0.86} ${w * 0.62} M${w * 0.86} ${w * 0.38} L${w * 0.62} ${w * 0.62}`} stroke={color} strokeWidth={weight} strokeLinecap="round" />
      )}
    </Svg>
  );
}
