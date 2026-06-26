"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { colorDe } from "@/lib/categorias";
import type { Poi, RouteResult } from "@/lib/types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export default function MapView3D({
  pois,
  route,
  onSelect,
}: {
  pois: Poi[];
  route: RouteResult | null;
  onSelect: (poi: Poi) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: ref.current,
      style: STYLE_URL,
      center: [-60.6308, -32.9476],
      zoom: 15,
      pitch: 60,
      bearing: -17,
      maxPitch: 80,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
    mapRef.current = map;

    map.on("load", () => {
      if (!map.getLayer("edificios-3d")) {
        const firstSymbol = map.getStyle().layers?.find((l) => l.type === "symbol")?.id;
        map.addLayer(
          {
            id: "edificios-3d",
            type: "fill-extrusion",
            source: "openmaptiles",
            "source-layer": "building",
            minzoom: 13,
            paint: {
              "fill-extrusion-color": "#9aa7b8",
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
              "fill-extrusion-opacity": 0.85,
            },
          },
          firstSymbol,
        );
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const place = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = pois.map((poi) => {
        const el = document.createElement("div");
        el.style.cssText = `width:16px;height:16px;border-radius:50%;border:2px solid #fff;background:${colorDe(
          poi.categoria,
        )};cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.5)`;
        el.title = poi.nombre;
        el.addEventListener("click", () => onSelect(poi));
        return new maplibregl.Marker({ element: el }).setLngLat([poi.lon, poi.lat]).addTo(map);
      });
    };

    if (map.isStyleLoaded()) place();
    else map.once("load", place);
  }, [pois, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;

    const draw = () => {
      const data = {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: route.coordinates },
      };
      const src = map.getSource("route") as maplibregl.GeoJSONSource | undefined;
      if (src) {
        src.setData(data);
      } else {
        map.addSource("route", { type: "geojson", data });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#2563eb", "line-width": 6 },
        });
      }
      const lons = route.coordinates.map((c) => c[0]);
      const lats = route.coordinates.map((c) => c[1]);
      map.fitBounds(
        [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
        { padding: 80, pitch: 55 },
      );
    };

    if (map.isStyleLoaded()) draw();
    else map.once("load", draw);
  }, [route]);

  return <div ref={ref} style={{ height: "100%", width: "100%" }} />;
}
