'use client';

import {useTrackFeatures, type TrackFeatures} from '@/hooks/useTrackFeatures';
import {featureCollection, lineString, point} from '@turf/helpers';
import type {Feature, FeatureCollection, LineString, Point} from 'geojson';
import {RLayer, RSource} from 'maplibre-react-components';
import {useMemo} from 'react';

const SHOW_TRACK_POINTS = false;

const layout = {'line-join': 'round', 'line-cap': 'round'} as const;
const linePaint = {'line-color': '#1565C0', 'line-width': 2} as const;
const pointPaint = {'circle-radius': 3, 'circle-color': '#1565C0', 'circle-opacity': 0.6} as const;

const emptyLine: Feature<LineString> = lineString([]);
const emptyLineCollection: FeatureCollection<LineString> = featureCollection([]);
const emptyPoints: FeatureCollection<Point> = featureCollection([]);

export default function TrackLayer() {
  const {live, history} = useTrackFeatures();

  return (
    <>
      <RSource id="track-history-source" type="geojson" data={history ?? emptyLineCollection} />
      <RLayer id="track-history-layer" source="track-history-source" type="line" layout={layout} paint={linePaint} />

      <RSource id="track-live-source" type="geojson" data={live ?? emptyLine} />
      <RLayer id="track-live-layer" source="track-live-source" type="line" layout={layout} paint={linePaint} />

      {SHOW_TRACK_POINTS && <TrackPointsLayer live={live} history={history} />}
    </>
  );
}

function TrackPointsLayer({live, history}: TrackFeatures) {
  const livePoints = useMemo(() => (live ? lineToPoints(live) : emptyPoints), [live]);
  const historyPoints = useMemo(() => (history ? collectionToPoints(history) : emptyPoints), [history]);

  return (
    <>
      <RSource id="track-history-points-source" type="geojson" data={historyPoints} />
      <RLayer id="track-history-points-layer" source="track-history-points-source" type="circle" paint={pointPaint} />

      <RSource id="track-live-points-source" type="geojson" data={livePoints} />
      <RLayer id="track-live-points-layer" source="track-live-points-source" type="circle" paint={pointPaint} />
    </>
  );
}

function lineToPoints(line: Feature<LineString>): FeatureCollection<Point> {
  return featureCollection(line.geometry.coordinates.map((coord) => point(coord)));
}

function collectionToPoints(collection: FeatureCollection<LineString>): FeatureCollection<Point> {
  return featureCollection(collection.features.flatMap((f) => f.geometry.coordinates.map((coord) => point(coord))));
}
