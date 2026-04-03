'use client';

import type {TrackLayers} from '@/hooks/useTrack';
import type {Feature, FeatureCollection, LineString, Point} from 'geojson';
import {RLayer, RSource} from 'maplibre-react-components';
import {useMemo} from 'react';

const SHOW_TRACK_POINTS = false;

const emptyLineString: Feature<LineString> = {
  type: 'Feature',
  geometry: {type: 'LineString', coordinates: []},
  properties: {},
};

const emptyCollection: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [],
};

const emptyPointCollection: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [],
};

const layout = {'line-join': 'round', 'line-cap': 'round'} as const;
const paint = {'line-color': '#1565C0', 'line-width': 2} as const;
const pointPaint = {'circle-radius': 3, 'circle-color': '#1565C0', 'circle-opacity': 0.6} as const;

function lineToPoints(line: Feature<LineString>): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: line.geometry.coordinates.map((coord) => ({
      type: 'Feature',
      geometry: {type: 'Point', coordinates: coord},
      properties: {},
    })),
  };
}

function collectionToPoints(collection: FeatureCollection<LineString>): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: collection.features.flatMap((f) =>
      f.geometry.coordinates.map((coord) => ({
        type: 'Feature' as const,
        geometry: {type: 'Point' as const, coordinates: coord},
        properties: {},
      })),
    ),
  };
}

type TrackLayerProps = Pick<TrackLayers, 'live' | 'history'>;

export default function TrackLayer({live, history}: TrackLayerProps) {
  const livePoints = useMemo(() => (live ? lineToPoints(live) : emptyPointCollection), [live]);
  const historyPoints = useMemo(() => (history ? collectionToPoints(history) : emptyPointCollection), [history]);

  return (
    <>
      <RSource id="track-history-source" type="geojson" data={history ?? emptyCollection} />
      <RLayer id="track-history-layer" source="track-history-source" type="line" layout={layout} paint={paint} />

      <RSource id="track-live-source" type="geojson" data={live ?? emptyLineString} />
      <RLayer id="track-live-layer" source="track-live-source" type="line" layout={layout} paint={paint} />

      {SHOW_TRACK_POINTS && (
        <>
          <RSource id="track-history-points-source" type="geojson" data={historyPoints} />
          <RLayer
            id="track-history-points-layer"
            source="track-history-points-source"
            type="circle"
            paint={pointPaint}
          />

          <RSource id="track-live-points-source" type="geojson" data={livePoints} />
          <RLayer id="track-live-points-layer" source="track-live-points-source" type="circle" paint={pointPaint} />
        </>
      )}
    </>
  );
}
