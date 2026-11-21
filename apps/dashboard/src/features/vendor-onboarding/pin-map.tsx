'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapLibre, Marker, NavigationControl } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';

export type GeoPoint = { latitude: number; longitude: number };

// Same raster tiles as the coverage map (NEXT_PUBLIC_MAP_TILES).
const TILES = process.env.NEXT_PUBLIC_MAP_TILES ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const RIYADH: GeoPoint = { latitude: 24.7136, longitude: 46.6753 };

/**
 * One point on a MapLibre map. Editable (application location, 410:40011): drag the pin, click the map, or press Enter
 * to put it at the map centre (keyboard). Read-only (store profile, 131:24074): the Map pin icon at the point.
 */
export function PinMap({ value, onChange, label, pin }: { value: GeoPoint | null; onChange?: (p: GeoPoint) => void; label: string; pin?: 'address' }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibre>(null);
  const marker = useRef<Marker>(null);
  const [ready, setReady] = useState(false);
  const change = useRef(onChange);
  change.current = onChange;
  const editable = !!onChange;
  const start = value ?? RIYADH;

  useEffect(() => {
    const m = new MapLibre({
      container: box.current!,
      style: {
        version: 8,
        sources: { osm: { type: 'raster', tiles: [TILES], tileSize: 256, attribution: '© OpenStreetMap' } },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [start.longitude, start.latitude],
      zoom: 14,
      attributionControl: { compact: true },
      interactive: editable,
    });
    if (editable) m.addControl(new NavigationControl({ showCompass: false }), 'top-left');
    const el = document.createElement('span');
    // Editable: the ember pin of 410:40011 (28px, 3px paper ring). Read-only: Phosphor map-pin, ink-2, 32px.
    el.className = editable ? 'block size-7 cursor-grab rounded-pill border-[3px] border-paper bg-ember shadow-card' : 'block size-8 text-ink-2';
    if (pin === 'address') {
      // DS «Map pin» type=address (16:923), as on the order detail (135:49134): ember 40 head with a paper ring, a white
      // map-pin-fill 20, and a 4×8 tail.
      el.className = 'flex flex-col items-center gap-s4';
      el.innerHTML =
        '<span class="flex size-10 items-center justify-center rounded-pill border-2 border-paper bg-ember text-paper"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,56a32,32,0,1,1-32,32A32,32,0,0,1,128,72Z"/></svg></span><span class="block h-2 w-1 rounded-[2px] bg-ember"></span>';
    } else if (!editable) {
      el.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"/></svg>';
    }
    const k = new Marker({ element: el, draggable: editable, anchor: editable ? 'center' : 'bottom' }).setLngLat([start.longitude, start.latitude]).addTo(m);
    const report = (lng: number, lat: number) => change.current?.({ latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) });
    m.on('load', () => setReady(true));
    if (editable) {
      k.on('dragend', () => report(k.getLngLat().lng, k.getLngLat().lat));
      m.on('click', (e) => {
        k.setLngLat(e.lngLat);
        report(e.lngLat.lng, e.lngLat.lat);
      });
    }
    map.current = m;
    marker.current = k;
    return () => m.remove();
    // The map is created once; later value changes move the pin below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value) marker.current?.setLngLat([value.longitude, value.latitude]);
  }, [value]);

  return (
    <div
      ref={box}
      role="application"
      aria-label={label}
      aria-busy={!ready}
      className="size-full"
      onKeyDown={(e) => {
        // From the map canvas (MapLibre makes it focusable and pans it with the arrow keys), not its zoom buttons.
        if (!editable || e.key !== 'Enter' || (e.target as HTMLElement).tagName !== 'CANVAS') return;
        const c = map.current!.getCenter();
        marker.current?.setLngLat(c);
        change.current?.({ latitude: Number(c.lat.toFixed(6)), longitude: Number(c.lng.toFixed(6)) });
      }}
    />
  );
}
