'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapLibre, Marker, NavigationControl, type GeoJSONSource, type MapLayerMouseEvent, type MapMouseEvent } from 'maplibre-gl';
import { MapPin } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TerraDraw, TerraDrawPolygonMode, TerraDrawSelectMode, ValidateNotSelfIntersecting, type GeoJSONStoreFeatures } from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import type { Polygon, Position } from './geo';
import type { CoverageZone } from './types';

export type MapMode = 'view' | 'draw' | 'edit' | 'test';

// Raster tiles; set NEXT_PUBLIC_MAP_TILES to the production tile service (OSM's own tiles are for light use only).
const TILES = process.env.NEXT_PUBLIC_MAP_TILES ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const RIYADH: [number, number] = [46.6753, 24.7136];
// Refuse crossing edges when a shape is closed or an edit is committed (the API rejects them too).
const notSelfIntersecting = (f: GeoJSONStoreFeatures, { updateType }: { updateType: string }) =>
  updateType === 'finish' || updateType === 'commit' ? ValidateNotSelfIntersecting(f) : { valid: true };
const EDIT_ID = 'b0a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d'; // terra-draw wants UUIDs

/**
 * MapLibre map: saved zones are GeoJSON layers in their color; terra-draw draws a new polygon or edits the selected
 * one; in test mode a click drops a Map pin and reports the point.
 */
export function ZoneMap({
  zones,
  selectedId,
  mode,
  editShape,
  draft,
  onSelect,
  onShape,
  onTestPoint,
  testPoint,
  label,
}: {
  zones: CoverageZone[];
  selectedId?: string;
  mode: MapMode;
  editShape?: Polygon; // the polygon being edited (edit mode)
  draft?: { polygon: Polygon; color: string }; // a drawn zone not saved yet
  onSelect: (id: string) => void;
  onShape: (p: Polygon) => void;
  onTestPoint: (p: Position) => void;
  testPoint?: Position;
  label: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibre>(null);
  const [ready, setReady] = useState(false);
  const draw = useRef<TerraDraw>(null);
  const pin = useRef<Marker>(null);
  const handlers = useRef({ onSelect, onShape, onTestPoint, mode });
  handlers.current = { onSelect, onShape, onTestPoint, mode };

  useEffect(() => {
    const m = new MapLibre({
      container: box.current!,
      style: {
        version: 8,
        sources: { osm: { type: 'raster', tiles: [TILES], tileSize: 256, attribution: '© OpenStreetMap' } },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: RIYADH,
      zoom: 10,
      attributionControl: { compact: true },
    });
    m.addControl(new NavigationControl({ showCompass: false }), 'top-left');
    m.on('load', () => {
      m.addSource('zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({ id: 'zones-fill', type: 'fill', source: 'zones', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['case', ['get', 'active'], 0.2, 0.08] } });
      m.addLayer({
        id: 'zones-line',
        type: 'line',
        source: 'zones',
        paint: { 'line-color': ['get', 'color'], 'line-width': ['case', ['get', 'selected'], 3, 1.5], 'line-dasharray': ['case', ['get', 'active'], ['literal', [1, 0]], ['literal', [2, 2]]] },
      });
      m.on('click', 'zones-fill', (e: MapLayerMouseEvent) => {
        if (handlers.current.mode === 'view' && e.features?.[0]) handlers.current.onSelect(String(e.features[0].properties.id));
      });
      const td = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({ map: m }),
        modes: [
          new TerraDrawPolygonMode({ validation: notSelfIntersecting, styles: { fillColor: '#8E1F26', fillOpacity: 0.2, outlineColor: '#8E1F26', outlineWidth: 2 } }),
          new TerraDrawSelectMode({
            flags: { polygon: { feature: { validation: notSelfIntersecting, draggable: true, coordinates: { midpoints: true, draggable: true, deletable: true } } } },
            styles: { selectedPolygonColor: '#8E1F26', selectedPolygonOutlineColor: '#8E1F26', selectionPointColor: '#FFFBF7', selectionPointOutlineColor: '#8E1F26', midPointColor: '#EEDFD3', midPointOutlineColor: '#8E1F26' },
          }),
        ],
      });
      td.start();
      td.on('finish', (id) => {
        const f = td.getSnapshotFeature(id);
        if (f?.geometry.type === 'Polygon') handlers.current.onShape(f.geometry as Polygon);
      });
      td.on('change', (ids) => {
        if (handlers.current.mode !== 'edit' || !ids.includes(EDIT_ID)) return;
        const f = td.getSnapshotFeature(EDIT_ID);
        if (f?.geometry.type === 'Polygon') handlers.current.onShape(f.geometry as Polygon);
      });
      draw.current = td;
      setReady(true);
    });
    m.on('click', (e: MapMouseEvent) => {
      if (handlers.current.mode === 'test') handlers.current.onTestPoint([e.lngLat.lng, e.lngLat.lat]);
    });
    map.current = m;
    return () => {
      draw.current?.stop();
      draw.current = null;
      setReady(false);
      m.remove();
    };
  }, []);

  // Saved zones → layer data (the zone being edited is drawn by terra-draw instead).
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    (m.getSource('zones') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: zones
          .filter((z) => !(mode === 'edit' && z.id === selectedId))
          .map((z) => ({ type: 'Feature' as const, geometry: z.polygon, properties: { id: z.id, color: z.color, active: z.isActive, selected: z.id === selectedId } }))
          .concat(draft && mode !== 'edit' ? [{ type: 'Feature', geometry: draft.polygon, properties: { id: 'draft', color: draft.color, active: true, selected: true } }] : []),
    });
  }, [zones, selectedId, mode, ready, draft]);

  // Mode → terra-draw mode and its single feature.
  useEffect(() => {
    const m = map.current;
    const td = draw.current;
    if (!m || !td || !ready) return;
    td.clear();
    if (mode === 'draw') td.setMode('polygon');
    else if (mode === 'edit' && editShape) {
      td.setMode('select');
      td.addFeatures([{ id: EDIT_ID, type: 'Feature', geometry: editShape, properties: { mode: 'polygon' } }]);
      td.selectFeature(EDIT_ID);
    } else td.setMode('static');
    m.getCanvas().style.cursor = mode === 'test' ? 'crosshair' : '';
    // editShape is read when entering edit mode only; later changes come from terra-draw itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedId, ready]);

  // Test point → Map pin (DS 16:923, type=address), rendered by React into the marker's element.
  const [pinEl] = useState(() => (typeof document === 'undefined' ? null : document.createElement('div')));
  useEffect(() => {
    pin.current?.remove();
    if (!testPoint || !map.current || !pinEl) return;
    pin.current = new Marker({ element: pinEl, anchor: 'bottom' }).setLngLat(testPoint).addTo(map.current);
  }, [testPoint, pinEl]);

  return (
    <>
      <div ref={box} role="application" aria-label={label} aria-busy={!ready} className="size-full" />
      {pinEl &&
        createPortal(
          <span className="flex flex-col items-center gap-s4">
            <span className="flex size-10 items-center justify-center rounded-pill border-[3px] border-paper bg-ember">
              <MapPin size={20} weight="fill" className="text-paper" aria-hidden />
            </span>
            <span className="h-2 w-1 rounded-[2px] bg-ember" />
          </span>,
          pinEl,
        )}
    </>
  );
}
