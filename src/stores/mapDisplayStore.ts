import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface MapDisplayStore {
  showSatelliteLayer: boolean;
  showTrackLayer: boolean;
  showAreaList: boolean;
  showTemporaryObstacles: boolean;
  showInflationLayer: boolean;
  selectedJobId: string | null;
  setShowSatelliteLayer: (v: boolean) => void;
  setShowTrackLayer: (v: boolean) => void;
  setShowAreaList: (v: boolean) => void;
  setShowTemporaryObstacles: (v: boolean) => void;
  setShowInflationLayer: (v: boolean) => void;
  setSelectedJobId: (v: string | null) => void;
}

export const useMapDisplayStore = create<MapDisplayStore>()(
  persist(
    (set) => ({
      showSatelliteLayer: false,
      showTrackLayer: true,
      showAreaList: true,
      showTemporaryObstacles: true,
      showInflationLayer: true,
      selectedJobId: null,
      setShowSatelliteLayer: (v) => set({showSatelliteLayer: v}),
      setShowTrackLayer: (v) => set({showTrackLayer: v}),
      setShowAreaList: (v) => set({showAreaList: v}),
      setShowTemporaryObstacles: (v) => set({showTemporaryObstacles: v}),
      setShowInflationLayer: (v) => set({showInflationLayer: v}),
      setSelectedJobId: (v) => set({selectedJobId: v}),
    }),
    {name: 'map-display'},
  ),
);
