'use client';

import {useSmoothedPosition} from '@/hooks/useSmoothedPosition';
import {useSelectedMower} from '@/stores/mowersStore';
import type {Datum, Position} from '@/stores/schemas';
import {useMemo} from 'react';
import MapMarker from './MapMarker';

export const MOWER_LENGTH_M = 0.46;

export interface MowerDimensions {
  lengthM: number;
  widthM: number;
  axleFromRearM: number;
  wheelDistanceM: number;
  usLeftX: number;
  usLeftY: number;
  usRightX: number;
  usRightY: number;
}

/**
 * Dynamically extract mower dimensions from ROS parameters (published via /params/json),
 * allowing any mower model (YardForce, Einhell, Landroid, custom builds) to be rendered
 * with its exact physical dimensions and geometry.
 */
export function extractMowerDimensions(params?: Record<string, unknown>): MowerDimensions {
  const getNum = (keys: string[], def: number): number => {
    if (!params) return def;
    for (const key of keys) {
      const v = params[key];
      if (typeof v === 'number' && !isNaN(v) && v > 0) return v;
    }
    return def;
  };

  const lengthM = getNum(['/mower_logic/mower_length', '/mower/length_m', 'mower/length', 'mower_length'], 0.46);
  const widthM = getNum(['/mower_logic/mower_width', '/mower/width_m', 'mower/width', 'mower_width'], 0.37);
  const axleFromRearM = getNum(['/mower_logic/mower_axle_from_rear', '/mower/axle_from_rear_m', 'mower_axle_from_rear'], 0.10);
  const wheelDistanceM = getNum(['/services/diff_drive/wheel_distance_m', 'wheel_distance_m'], 0.30);
  const usLeftX = getNum(['/ultrasonic/left/x', 'ultrasonic/left/x'], lengthM - axleFromRearM - 0.18);
  const usLeftY = getNum(['/ultrasonic/left/y', 'ultrasonic/left/y'], 0.105);
  const usRightX = getNum(['/ultrasonic/right/x', 'ultrasonic/right/x'], lengthM - axleFromRearM - 0.18);
  const usRightY = getNum(['/ultrasonic/right/y', 'ultrasonic/right/y'], -0.105);

  return {
    lengthM,
    widthM,
    axleFromRearM,
    wheelDistanceM,
    usLeftX,
    usLeftY,
    usRightX,
    usRightY,
  };
}

interface MowerArrowProps {
  /** Scale factor relative to full size (default 1) */
  scale?: number;
  fill: string;
}

/**
 * Mower arrow shape centered at (16, 16) in a 32×32 viewBox, pointing up (forward at 0° heading).
 * Maintained for backwards compatibility (e.g. DockingStationMarker).
 */
export function MowerArrow({scale = 1, fill}: MowerArrowProps) {
  const cx = 16;
  const cy = 16;
  const hw = 10 * scale;
  const hh = 13 * scale;
  const notch = 6 * scale;
  return (
    <path
      d={`M${cx} ${cy - hh} L${cx + hw} ${cy + hh} L${cx} ${cy + hh - notch} L${cx - hw} ${cy + hh} Z`}
      fill={fill}
      stroke="#fff"
      strokeWidth={2 * scale}
      strokeLinejoin="round"
    />
  );
}

interface MowerChassisProps {
  dimensions: MowerDimensions;
  accentColor: string;
  isMowing?: boolean;
}

/**
 * Dynamically rendered 1:1 real-world physical polygon of the mower:
 * Scales and adapts to whatever dimensions are configured for the specific mower.
 * (0, 0) is anchored on the drive axle (base_link / RTK center).
 */
export function MowerChassis({dimensions, accentColor, isMowing = false}: MowerChassisProps) {
  const frontOverhangMm = (dimensions.lengthM - dimensions.axleFromRearM) * 1000;
  const rearOverhangMm = dimensions.axleFromRearM * 1000;
  const halfWidthMm = (dimensions.widthM / 2) * 1000;
  const halfTrackMm = (dimensions.wheelDistanceM / 2) * 1000;

  const usLeft = {x: -dimensions.usLeftY * 1000, y: -dimensions.usLeftX * 1000};
  const usRight = {x: -dimensions.usRightY * 1000, y: -dimensions.usRightX * 1000};

  return (
    <g className="mower-chassis">
      {/* Drive Wheels (at drive axle y=0, x=±halfTrackMm) */}
      <rect
        x={-halfTrackMm - 20}
        y={-75}
        width={40}
        height={150}
        rx={10}
        fill="#1e293b"
        stroke="#334155"
        strokeWidth={5}
      />
      <rect
        x={halfTrackMm - 20}
        y={-75}
        width={40}
        height={150}
        rx={10}
        fill="#1e293b"
        stroke="#334155"
        strokeWidth={5}
      />

      {/* Front Caster Wheels */}
      <rect
        x={-halfWidthMm * 0.7 - 14}
        y={-frontOverhangMm * 0.85}
        width={28}
        height={55}
        rx={8}
        fill="#334155"
        opacity="0.9"
      />
      <rect
        x={halfWidthMm * 0.7 - 14}
        y={-frontOverhangMm * 0.85}
        width={28}
        height={55}
        rx={8}
        fill="#334155"
        opacity="0.9"
      />

      {/* Main Body Chassis Polygon: dynamically adapting to length and width */}
      <path
        d={`M ${-halfWidthMm},${rearOverhangMm - 5} L ${-halfWidthMm},${-frontOverhangMm * 0.6} Q ${-halfWidthMm},${-frontOverhangMm} 0,${-frontOverhangMm} Q ${halfWidthMm},${-frontOverhangMm} ${halfWidthMm},${-frontOverhangMm * 0.6} L ${halfWidthMm},${rearOverhangMm - 5} Q ${halfWidthMm},${rearOverhangMm} 0,${rearOverhangMm} Q ${-halfWidthMm},${rearOverhangMm} ${-halfWidthMm},${rearOverhangMm - 5} Z`}
        fill="#0f172a"
        fillOpacity="0.88"
        stroke={accentColor}
        strokeWidth="8"
        strokeLinejoin="round"
      />

      {/* Front Bumper Accent Bar */}
      <path
        d={`M ${-halfWidthMm * 0.8},${-frontOverhangMm * 0.94} Q 0,${-frontOverhangMm * 1.01} ${halfWidthMm * 0.8},${-frontOverhangMm * 0.94}`}
        fill="none"
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Cutting Deck / Blades Indicator */}
      <circle
        cx="0"
        cy={-frontOverhangMm * 0.38}
        r={Math.min(halfWidthMm * 0.55, 100)}
        fill={isMowing ? 'rgba(76, 175, 80, 0.25)' : 'rgba(148, 163, 184, 0.1)'}
        stroke={isMowing ? '#4CAF50' : '#475569'}
        strokeWidth="5"
        strokeDasharray={isMowing ? '14 7' : 'none'}
      />
      {isMowing && (
        <circle cx="0" cy={-frontOverhangMm * 0.38} r="20" fill="#4CAF50" opacity="0.9" />
      )}

      {/* Ultrasonic Sensors */}
      <circle cx={usLeft.x} cy={usLeft.y} r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="4" />
      <circle cx={usRight.x} cy={usRight.y} r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="4" />

      {/* Drive Axle Center Indicator (base_link / RTK origin) */}
      <circle cx="0" cy="0" r="8" fill="#ffffff" opacity="0.8" />

      {/* Directional Heading Arrow */}
      <path
        d={`M 0,${-frontOverhangMm * 0.65} L ${halfWidthMm * 0.3},${-frontOverhangMm * 0.35} L 0,${-frontOverhangMm * 0.44} L ${-halfWidthMm * 0.3},${-frontOverhangMm * 0.35} Z`}
        fill={accentColor}
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </g>
  );
}

interface MowerMarkerProps {
  position: Position;
  datum: Datum;
}

export default function MowerMarker({position, datum}: MowerMarkerProps) {
  const smoothedPosition = useSmoothedPosition(position);
  const accuracy = useSelectedMower((s) => s?.state.pose?.pos_accuracy);
  const params = useSelectedMower((s) => s?.params);
  const isMowing = useSelectedMower(
    (s) => s?.state.current_state === 'MOWING' || Boolean(s?.position?.attributes?.blades),
  );

  const dimensions = useMemo(() => extractMowerDimensions(params), [params]);

  // ViewBox bounds around drive axle center (0, 0)
  const maxSpanMm = useMemo(() => {
    const frontOverhang = (dimensions.lengthM - dimensions.axleFromRearM) * 1000;
    const rearOverhang = dimensions.axleFromRearM * 1000;
    const halfWidth = (dimensions.widthM / 2) * 1000;
    return Math.ceil(Math.max(frontOverhang, rearOverhang, halfWidth) * 1.15);
  }, [dimensions]);

  const sizeM = (maxSpanMm * 2) / 1000;
  const markerColor = accuracy === 0 ? '#F44336' : '#4CAF50';

  return (
    <MapMarker
      position={smoothedPosition}
      heading={smoothedPosition?.heading ?? 0}
      sizeM={sizeM}
      datum={datum}
      className="mower-marker"
    >
      {(sizePx) => (
        <svg
          width={Math.max(sizePx, 24)}
          height={Math.max(sizePx, 24)}
          viewBox={`${-maxSpanMm} ${-maxSpanMm} ${maxSpanMm * 2} ${maxSpanMm * 2}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{overflow: 'visible'}}
        >
          <MowerChassis dimensions={dimensions} accentColor={markerColor} isMowing={isMowing} />
        </svg>
      )}
    </MapMarker>
  );
}
