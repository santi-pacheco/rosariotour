"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Tooltip,
  Polyline,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import type { Feature, Geometry, FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import { colorDe, LEG_COLORS } from "@/lib/categorias";
import type { Poi, RouteResult } from "@/lib/types";

const ROSARIO_CENTER: LatLngExpression = [-32.9476, -60.6308];

function useDark(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(document.documentElement.classList.contains("dark"));
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function isFeatureCollection(x: unknown): x is FeatureCollection {
  return (
    typeof x === "object" &&
    x !== null &&
    (x as { type?: string }).type === "FeatureCollection" &&
    Array.isArray((x as { features?: unknown }).features)
  );
}

function FitToRoute({ route }: { route: RouteResult | null }) {
  const map = useMap();
  useEffect(() => {
    if (route && route.coordinates.length) {
      const latlngs = route.coordinates.map(([lon, lat]) => [lat, lon]) as [number, number][];
      map.fitBounds(latlngs, { padding: [60, 60] });
    }
  }, [route, map]);
  return null;
}

function FitToPois({ pois }: { pois: Poi[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || pois.length === 0) return;
    done.current = true;
    const bounds = L.latLngBounds(pois.map((p) => [p.lat, p.lon] as [number, number]));
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
  }, [pois, map]);
  return null;
}

function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const fix = () => map.invalidateSize();
    const t = setTimeout(fix, 0);
    const ro = new ResizeObserver(fix);
    ro.observe(container);
    window.addEventListener("orientationchange", fix);
    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("orientationchange", fix);
    };
  }, [map]);
  return null;
}

function numberIcon(n: number, color: string) {
  return L.divIcon({
    className: "numpin",
    html: `<div style="background:${color}">${n}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function MapView2D({
  pois,
  selectedId,
  itinerary,
  route,
  showBarrios,
  showAreas,
  onSelect,
  onLayerError,
}: {
  pois: Poi[];
  selectedId: number | null;
  itinerary: number[];
  route: RouteResult | null;
  showBarrios: boolean;
  showAreas: boolean;
  onSelect: (poi: Poi) => void;
  onLayerError?: (msg: string) => void;
}) {
  const [barrios, setBarrios] = useState<FeatureCollection | null>(null);
  const [areas, setAreas] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (showBarrios && !barrios) {
      fetch("/api/barrios")
        .then((r) => r.json())
        .then((data) => {
          if (isFeatureCollection(data)) setBarrios(data);
          else throw new Error("respuesta inválida");
        })
        .catch((err) => {
          console.error("No se pudieron cargar los barrios:", err);
          onLayerError?.("No se pudieron cargar los barrios");
        });
    }
  }, [showBarrios, barrios, onLayerError]);

  useEffect(() => {
    if (showAreas && !areas) {
      fetch("/api/areas")
        .then((r) => r.json())
        .then((data) => {
          if (isFeatureCollection(data)) setAreas(data);
          else throw new Error("respuesta inválida");
        })
        .catch((err) => {
          console.error("No se pudieron cargar las áreas de interés:", err);
          onLayerError?.("No se pudieron cargar las áreas de interés");
        });
    }
  }, [showAreas, areas, onLayerError]);

  const dark = useDark();
  const byId = new Map(pois.map((p) => [p.id, p]));
  const itinPois = itinerary.map((id) => byId.get(id)).filter((p): p is Poi => Boolean(p));

  return (
    <MapContainer
      center={ROSARIO_CENTER}
      zoom={13}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        key={dark ? "dark" : "light"}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={
          dark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        }
      />

      {showBarrios && barrios && (
        <GeoJSON
          key={`barrios-${dark ? "d" : "l"}`}
          data={barrios}
          style={(f?: Feature<Geometry>) => ({
            color: (f?.properties?.color as string) ?? "#64748b",
            weight: 1,
            fillColor: (f?.properties?.color as string) ?? "#64748b",
            fillOpacity: 0.22,
          })}
          onEachFeature={(f, layer) => {
            layer.bindTooltip(String(f.properties?.nombre ?? ""), {
              permanent: true,
              direction: "center",
              className: dark ? "map-label map-label--dark" : "map-label",
            });
          }}
        />
      )}

      {showAreas && areas && (
        <GeoJSON
          key={`areas-${dark ? "d" : "l"}`}
          data={areas}
          style={(f?: Feature<Geometry>) => ({
            color: (f?.properties?.color as string) ?? "#22c55e",
            weight: 1.5,
            fillColor: (f?.properties?.color as string) ?? "#22c55e",
            fillOpacity: 0.25,
          })}
          onEachFeature={(f, layer) => {
            layer.bindTooltip(String(f.properties?.nombre ?? ""), {
              permanent: true,
              direction: "center",
              className: dark ? "map-label map-label--dark" : "map-label",
            });
          }}
        />
      )}

      {pois.map((poi) => {
        const selected = poi.id === selectedId;
        return (
          <CircleMarker
            key={poi.id}
            center={[poi.lat, poi.lon]}
            radius={selected ? 11 : 8}
            pathOptions={{
              color: "#fff",
              weight: selected ? 3 : 2,
              fillColor: colorDe(poi.categoria),
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onSelect(poi) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {poi.nombre}
            </Tooltip>
          </CircleMarker>
        );
      })}

      {route?.legs.map((leg, i) => (
        <Polyline
          key={`leg-${i}`}
          positions={leg.coordinates.map(([lon, lat]) => [lat, lon]) as LatLngExpression[]}
          pathOptions={{ color: LEG_COLORS[i % LEG_COLORS.length], weight: 6, opacity: 0.9 }}
        />
      ))}

      {itinPois.map((poi, i) => (
        <Marker
          key={`stop-${poi.id}`}
          position={[poi.lat, poi.lon]}
          icon={numberIcon(i + 1, LEG_COLORS[Math.max(0, i - 1) % LEG_COLORS.length])}
          eventHandlers={{ click: () => onSelect(poi) }}
        />
      ))}

      <FitToRoute route={route} />
      <FitToPois pois={pois} />
      <ResizeHandler />
    </MapContainer>
  );
}
