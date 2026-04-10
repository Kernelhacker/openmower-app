import {type MapData} from '@/stores/schemas';
import {
  datumToRelative,
  pointToAbsolute,
  pointToRelative,
  pointsToAbsolute,
  type AbsolutePoint,
  type RelativePoint,
  type UtmPoint,
} from '@/utils/coordinates';
import {decimateFilter} from '@/utils/decimate';
import {rdpSimplify} from '@/utils/rdp';
import type {Feature, FeatureCollection, LineString} from 'geojson';
import {useCallback, useEffect, useRef, useState} from 'react';

/*
 * Two-layer GPS track pipeline: "Live" (raw) + "History" (simplified).
 *
 * Positions are pre-processed by a median filter on the mower, so they're
 * relatively smooth. They arrive every ~150 ms and are appended to a raw
 * buffer that renders as the live layer.
 *
 * To avoid a gap between layers, the live line is prefixed with the last
 * vertex of the history.
 *
 * The history is a list of segments, each carrying its own attributes
 * (e.g. bladesOn). When attributes change, a new segment is started
 * whose first point duplicates the previous segment's last point
 * (bridge vertex) so segments connect without gaps or overdraw.
 *
 * When the live buffer exceeds COMPACTION_THRESHOLD, the oldest ~80% of
 * points are moved into the history through two reduction passes:
 *
 *   1. Decimation — drops points that are close together and on the
 *      same heading, keeping those where distance or heading change is
 *      significant. A heartbeat guarantees at least every 10th point is kept.
 *   2. Ramer-Douglas-Peucker — further reduces the decimated result by
 *      removing points that don't deviate from the simplified line.
 *
 * Both passes run on the full buffer with the last point of the history
 * prepended. This gives them extra context to steer the simplification
 * toward better curves at the boundaries. Afterward, only points that
 * originated from the oldest 80% are kept; the prefix and suffix points
 * are discarded from the simplified result so they aren't added to the
 * history prematurely.
 */

// --- Compaction ---
const COMPACTION_THRESHOLD = 60; // Threshold to move raw points to history
const CONTEXT = 10; // Padded window for RDP boundary stability

// --- Decimation ---
const DIST_THRESHOLD = 0.1; // 10 cm — minimum movement to keep a point
const NOISE_DIST_THRESHOLD = 0.03; // 3 cm — minimum movement to trust heading vector
const HEADING_THRESHOLD_RAD = 8 * (Math.PI / 180); // 8° heading change
const HEARTBEAT_POSITIONS = 10;

// --- RDP ---
const RDP_EPSILON = 0.01; // 1 cm — stay fairly close to the original path

export type TrackAttributes = {bladesOn?: boolean};

interface TrackSegment {
  points: AbsolutePoint[];
  attributes: TrackAttributes;
}

interface Position {
  x: number;
  y: number;
}

interface PipelineState {
  relBuffer: RelativePoint[];
  absBuffer: AbsolutePoint[];
  historySegments: TrackSegment[];
  attributes: TrackAttributes;
}

export interface TrackLayers {
  live: Feature<LineString> | null;
  history: FeatureCollection<LineString> | null;
  flush: () => void;
}

function buildLineString(coordinates: AbsolutePoint[]): Feature<LineString> | null {
  if (coordinates.length < 2) return null;
  return {
    type: 'Feature',
    geometry: {type: 'LineString', coordinates},
    properties: {},
  };
}

function buildFeatureCollection(segments: TrackSegment[]): FeatureCollection<LineString> | null {
  const features = segments
    .filter((s) => s.points.length >= 2)
    .map(
      (s): Feature<LineString> => ({
        type: 'Feature',
        geometry: {type: 'LineString', coordinates: s.points},
        properties: {...s.attributes},
      }),
    );
  return features.length === 0 ? null : {type: 'FeatureCollection', features};
}

function attributesMatch(a: TrackAttributes, b: TrackAttributes): boolean {
  return a.bladesOn === b.bladesOn;
}

/**
 * Moves points from rawBuffer into simplified historySegments.
 */
function compactToHistory(state: PipelineState, utmDatum: UtmPoint, flushAll = false): void {
  const {relBuffer, historySegments, attributes} = state;
  if (relBuffer.length <= CONTEXT && !flushAll) return;

  const main = flushAll ? relBuffer : relBuffer.slice(0, -CONTEXT);
  const suffix = flushAll ? [] : relBuffer.slice(-CONTEXT);
  const absSuffix = flushAll ? [] : state.absBuffer.slice(-CONTEXT);

  // Prefix: reach back to the last segment's tail to ensure RDP continuity
  const lastSeg = historySegments[historySegments.length - 1];
  let prefix: RelativePoint[] = [];
  if (lastSeg && lastSeg.points.length > 0) {
    // Note: We'd ideally store relative points for the prefix,
    // but pointToRelative of the last absolute point works too.
    const lastAbs = lastSeg.points[lastSeg.points.length - 1];
    prefix = [pointToRelative(lastAbs, utmDatum)];
  }

  const window = [...prefix, ...main, ...suffix];
  if (window.length < 2) {
    state.relBuffer = suffix;
    state.absBuffer = absSuffix;
    return;
  }

  const decimated = decimateFilter(
    window,
    DIST_THRESHOLD,
    NOISE_DIST_THRESHOLD,
    HEADING_THRESHOLD_RAD,
    HEARTBEAT_POSITIONS,
  );
  const simplified = rdpSimplify(decimated, RDP_EPSILON);
  const mainSet = new Set(main);
  const committed = simplified.filter((p) => mainSet.has(p));

  if (committed.length > 0) {
    const absolute = pointsToAbsolute(committed, utmDatum);

    if (lastSeg && attributesMatch(lastSeg.attributes, attributes)) {
      lastSeg.points.push(...absolute);
    } else {
      // Start new segment + bridge the gap to previous segment
      const bridge = lastSeg ? [lastSeg.points[lastSeg.points.length - 1]] : [];
      historySegments.push({
        points: [...bridge, ...absolute],
        attributes: {...attributes},
      });
    }
  }

  state.relBuffer = suffix;
  state.absBuffer = absSuffix;
}

export function useTrack(
  position: Position | undefined,
  datum: NonNullable<MapData['datum']> | null,
  attributes: TrackAttributes = {bladesOn: true},
): TrackLayers {
  const stateRef = useRef<PipelineState>({
    relBuffer: [],
    absBuffer: [],
    historySegments: [],
    attributes,
  });

  const prevPositionRef = useRef<Position | null>(null);
  const utmDatumRef = useRef<UtmPoint | null>(null);

  const [live, setLive] = useState<Feature<LineString> | null>(null);
  const [history, setHistory] = useState<FeatureCollection<LineString> | null>(null);

  stateRef.current.attributes = attributes;

  useEffect(() => {
    if (datum) {
      utmDatumRef.current = datumToRelative([datum.long, datum.lat]);
    }
  }, [datum]);

  useEffect(() => {
    const s = stateRef.current;
    s.relBuffer = [];
    s.absBuffer = [];
    s.historySegments = [];
    prevPositionRef.current = null;
    setLive(null);
    setHistory(null);
  }, [datum]);

  const rebuildHistory = useCallback(() => {
    setHistory(buildFeatureCollection(stateRef.current.historySegments));
  }, []);

  useEffect(() => {
    if (!position || !datum || !utmDatumRef.current) return;
    const prev = prevPositionRef.current;
    if (prev && prev.x === position.x && prev.y === position.y) return;
    prevPositionRef.current = position;

    const utmDatum = utmDatumRef.current;
    const s = stateRef.current;
    const raw: RelativePoint = {x: position.x, y: position.y};

    s.relBuffer.push(raw);
    s.absBuffer.push(pointToAbsolute(raw, utmDatum));

    // 2. Build Live Layer with Bridge
    const liveCoords: AbsolutePoint[] = [...s.absBuffer];
    const lastSeg = s.historySegments[s.historySegments.length - 1];

    if (lastSeg && lastSeg.points.length > 0) {
      liveCoords.unshift(lastSeg.points[lastSeg.points.length - 1]);
    }
    setLive(buildLineString(liveCoords));

    // 3. Compaction
    if (s.relBuffer.length > COMPACTION_THRESHOLD) {
      compactToHistory(s, utmDatum);
      rebuildHistory();
    }
  }, [position, datum, rebuildHistory]);

  const flush = useCallback(() => {
    const utmDatum = utmDatumRef.current;
    if (!utmDatum) return;
    compactToHistory(stateRef.current, utmDatum, true);
    rebuildHistory();

    const s = stateRef.current;
    s.relBuffer = [];
    s.absBuffer = [];
    setLive(null);
  }, [rebuildHistory]);

  return {live, history, flush};
}
