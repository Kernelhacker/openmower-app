// import {useMapContext} from '@/contexts/MapContext'; // TODO: Uncomment when implementing persistence
import {withDisplaySortKeys, useMap, useMapboxDraw, useMapContext, useMapSelection} from '@/contexts/MapContext';
import {AreaProps} from '@/stores/schemas';
import {DndContext, DragEndEvent, DragOverlay} from '@dnd-kit/core';
import {restrictToFirstScrollableAncestor, restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {arrayMove, SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {Card, CardContent, CardHeader, List, useTheme} from '@mui/material';
import {featureCollection} from '@turf/helpers';
import {Feature, Polygon} from 'geojson';
import {useRef} from 'react';
import SortableAreaItem from './edit/SortableAreaItem';

function rangeIndices(ids: string[], a: string, b: string): [number, number] {
  const ai = ids.indexOf(a);
  const bi = ids.indexOf(b);
  return [Math.min(ai, bi), Math.max(ai, bi)];
}

export default function AreasList({areas}: {areas: Feature<Polygon, AreaProps>[]}) {
  const theme = useTheme();
  const selectedIds = useMapSelection();
  const {editMode, setFeatures} = useMapContext();
  const draw = useMapboxDraw();
  const map = useMap();
  const anchorId = useRef<string | null>(null);

  const selectFeatures = (featureIds: string[]) => {
    if (!draw || !map) return;
    draw.changeMode('simple_select', {featureIds});
    // draw.changeMode with featureIds suppresses draw.selectionchange by default,
    // so fire it manually to keep useMapSelection() in sync.
    map.fire('draw.selectionchange', {features: featureIds.map((fid) => draw.get(fid)).filter(Boolean)});
  };

  const handleSelect = (id: string, event: React.MouseEvent) => {
    if (!draw || !editMode) return;
    const current = draw.getSelectedIds();
    const ids = areas.map((a) => a.id as string);
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;

    if (ctrl && shift) {
      const anchor = anchorId.current ?? ids[0];
      const [lo, hi] = rangeIndices(ids, anchor, id);
      selectFeatures(Array.from(new Set([...current, ...ids.slice(lo, hi + 1)])));
    } else if (shift) {
      const anchor = anchorId.current ?? ids[0];
      const [lo, hi] = rangeIndices(ids, anchor, id);
      selectFeatures(ids.slice(lo, hi + 1));
    } else if (ctrl) {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      selectFeatures(next);
      anchorId.current = id;
    } else {
      selectFeatures([id]);
      anchorId.current = id;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (over?.id !== undefined && active.id !== over.id) {
      setFeatures((draft) => {
        const oldIndex = draft.features.findIndex((item) => item.id === active.id);
        const newIndex = draft.features.findIndex((item) => item.id === over?.id);
        draft.features = arrayMove(draft.features, oldIndex, newIndex);
        draw?.set(withDisplaySortKeys(featureCollection(draft.features)));
      });
    }
  };

  return (
    <Card sx={{height: '100%', display: 'flex', flexDirection: 'column', border: 0}}>
      <CardHeader
        title="Areas"
        sx={{
          py: 1,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      <CardContent sx={{flex: 1, p: 0, overflowY: 'auto', '&:last-child': {pb: 0}}}>
        <List sx={{minHeight: '100%', p: 0, userSelect: 'none'}}>
          <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}>
            <SortableContext items={areas.map((area) => area.id as string)} strategy={verticalListSortingStrategy}>
              {areas.map((area) => (
                <SortableAreaItem
                  key={area.id}
                  area={area}
                  selected={selectedIds.includes(area.id as string)}
                  showDragHandle={editMode}
                  onSelect={handleSelect}
                />
              ))}
            </SortableContext>
            <DragOverlay style={{cursor: 'grabbing'}} />
          </DndContext>
        </List>
      </CardContent>
    </Card>
  );
}
