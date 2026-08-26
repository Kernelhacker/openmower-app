'use client';

import {useSelectedMower} from '@/stores/mowersStore';
import type {Datum} from '@/stores/schemas';
import {datumToRelative, pointToAbsolute, type AbsolutePoint} from '@/utils/coordinates';
import {featureCollection, polygon} from '@turf/helpers';
import type {Feature, FeatureCollection, Polygon} from 'geojson';
import type {FillLayerSpecification, LineLayerSpecification} from 'maplibre-gl';
import {RLayer, RSource} from 'maplibre-react-components';
import {useMemo} from 'react';

const obstacleFillPaint: FillLayerSpecification['paint'] = {
  'fill-color': '#f44336',
  'fill-opacity': 0.6,
};

const obstacleLinePaint: LineLayerSpecification['paint'] = {
  'line-color': '#d32f2f',
  'line-width': 2,
  'line-dasharray': [2, 2],
};

const inflationFillPaint: FillLayerSpecification['paint'] = {
  'fill-color': '#ff9800',
  'fill-opacity': 0.2,
};

const inflationLinePaint: LineLayerSpecification['paint'] = {
  'line-color': '#ff9800',
  'line-width': 1.5,
  'line-dasharray': [3, 3],
};

const emptyCollection: FeatureCollection<Polygon> = featureCollection([]);

interface ObstacleLayerProps {
  datum: Datum | null;
  visible?: boolean;
  showInflation?: boolean;
}

export default function ObstacleLayer({datum, visible = true, showInflation = true}: ObstacleLayerProps) {
  const obstacles = useSelectedMower((s) => s?.temporaryObstacles ?? []);

  const {obstacleFeatures, inflationFeatures} = useMemo(() => {
    if (!datum || obstacles.length === 0) {
      return {obstacleFeatures: emptyCollection, inflationFeatures: emptyCollection};
    }

    const utmDatum = datumToRelative([datum.long, datum.lat]);
    const obsList: Feature<Polygon>[] = [];
    const inflList: Feature<Polygon>[] = [];

    for (const obs of obstacles) {
      const r = obs.radius || 0.45;
      const inflR = r + 0.35; // 35 cm inflation buffer

      // Obstacle Polygon
      const obsCoords: AbsolutePoint[] =
        obs.polygon && obs.polygon.length >= 3
          ? obs.polygon.map((p) => pointToAbsolute(p, utmDatum))
          : [
              pointToAbsolute({x: obs.x - r, y: obs.y - r}, utmDatum),
              pointToAbsolute({x: obs.x + r, y: obs.y - r}, utmDatum),
              pointToAbsolute({x: obs.x + r, y: obs.y + r}, utmDatum),
              pointToAbsolute({x: obs.x - r, y: obs.y + r}, utmDatum),
            ];

      // Close polygon loop
      if (obsCoords.length > 0) {
        obsCoords.push(obsCoords[0]);
        obsList.push(polygon([obsCoords], {id: obs.id, type: 'temporary_obstacle'}));
      }

      // Inflation Buffer Polygon
      const inflCoords: AbsolutePoint[] = [
        pointToAbsolute({x: obs.x - inflR, y: obs.y - inflR}, utmDatum),
        pointToAbsolute({x: obs.x + inflR, y: obs.y - inflR}, utmDatum),
        pointToAbsolute({x: obs.x + inflR, y: obs.y + inflR}, utmDatum),
        pointToAbsolute({x: obs.x - inflR, y: obs.y + inflR}, utmDatum),
      ];
      inflCoords.push(inflCoords[0]);
      inflList.push(polygon([inflCoords], {id: `${obs.id}-inflation`, type: 'obstacle_inflation'}));
    }

    return {
      obstacleFeatures: featureCollection(obsList),
      inflationFeatures: featureCollection(inflList),
    };
  }, [datum, obstacles]);

  const obsVisibility = visible ? 'visible' : 'none';
  const inflVisibility = visible && showInflation ? 'visible' : 'none';

  return (
    <>
      {/* Inflation Buffer Layer */}
      <RSource id="temporary-obstacles-inflation-source" type="geojson" data={inflationFeatures} />
      <RLayer
        id="temporary-obstacles-inflation-fill"
        source="temporary-obstacles-inflation-source"
        type="fill"
        layout={{visibility: inflVisibility}}
        paint={inflationFillPaint}
      />
      <RLayer
        id="temporary-obstacles-inflation-line"
        source="temporary-obstacles-inflation-source"
        type="fill"
        layout={{visibility: inflVisibility}}
        paint={inflationLinePaint}
      />

      {/* Obstacle Core Layer */}
      <RSource id="temporary-obstacles-source" type="geojson" data={obstacleFeatures} />
      <RLayer
        id="temporary-obstacles-fill"
        source="temporary-obstacles-source"
        type="fill"
        layout={{visibility: obsVisibility}}
        paint={obstacleFillPaint}
      />
      <RLayer
        id="temporary-obstacles-line"
        source="temporary-obstacles-source"
        type="line"
        layout={{visibility: obsVisibility}}
        paint={obstacleLinePaint}
      />
    </>
  );
}
