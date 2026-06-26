"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, MapPinned } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PoiCard from "@/components/PoiCard";
import WeatherWidget from "@/components/WeatherWidget";
import ThemeToggle from "@/components/ThemeToggle";
import MapControls from "@/components/MapControls";
import BottomSheet from "@/components/BottomSheet";
import { LEG_COLORS } from "@/lib/categorias";
import type { Categoria, Poi, RouteResult } from "@/lib/types";

const MapView2D = dynamic(() => import("@/components/MapView2D"), { ssr: false });
const MapView3D = dynamic(() => import("@/components/MapView3D"), { ssr: false });

export default function Home() {
  const [pois, setPois] = useState<Poi[]>([]);
  const [filtro, setFiltro] = useState<Categoria | "todos">("todos");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [itinerary, setItinerary] = useState<number[]>([]);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [vista, setVista] = useState<"2d" | "3d">("2d");
  const [showBarrios, setShowBarrios] = useState(false);
  const [showAreas, setShowAreas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  useEffect(() => {
    const q = filtro === "todos" ? "" : `?categoria=${filtro}`;
    fetch(`/api/pois${q}`)
      .then((r) => r.json())
      .then((d) => setPois(d.pois ?? []))
      .catch(() => setError("No se pudieron cargar los puntos de interés"));
  }, [filtro]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  const selected = useMemo(() => pois.find((p) => p.id === selectedId) ?? null, [pois, selectedId]);
  const byId = useMemo(() => new Map(pois.map((p) => [p.id, p])), [pois]);

  const selectPoi = useCallback((p: Poi) => {
    setSelectedId(p.id);
    setSheetExpanded(true);
  }, []);

  const toggleItinerary = useCallback((id: number) => {
    setItinerary((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setRoute(null);
  }, []);

  const calcular = useCallback(async () => {
    const coords = itinerary
      .map((id) => byId.get(id))
      .filter((p): p is Poi => Boolean(p))
      .map((p) => [p.lon, p.lat] as [number, number]);
    if (coords.length < 2) return;

    setRouteLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coords }),
      });
      if (!res.ok) throw new Error();
      setRoute(await res.json());
    } catch {
      setError("No se pudo calcular la ruta (revisá OSRM)");
    } finally {
      setRouteLoading(false);
    }
  }, [itinerary, byId]);

  const limpiar = useCallback(() => {
    setItinerary([]);
    setRoute(null);
  }, []);

  const sidebar = (
    <Sidebar
      pois={pois}
      filtro={filtro}
      itinerary={itinerary}
      selectedId={selectedId}
      route={route}
      routeLoading={routeLoading}
      onFiltro={setFiltro}
      onSelect={selectPoi}
      onToggleItinerary={toggleItinerary}
      onCalcular={calcular}
      onLimpiar={limpiar}
    />
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <div className="mapwrap absolute inset-0">
        {vista === "2d" ? (
          <MapView2D
            pois={pois}
            selectedId={selectedId}
            itinerary={itinerary}
            route={route}
            showBarrios={showBarrios}
            showAreas={showAreas}
            onSelect={selectPoi}
            onLayerError={setError}
          />
        ) : (
          <MapView3D pois={pois} route={route} onSelect={selectPoi} />
        )}
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-[1100] flex items-center gap-3 p-3 sm:p-4">
        <div className="glass pointer-events-auto flex items-center gap-2 rounded-full py-2 pl-4 pr-2">
          <MapPinned className="size-5 text-primary" />
          <span className="font-display text-lg font-semibold leading-none tracking-tight">
            Rosario<span className="text-primary">Tour</span>
          </span>
        </div>
        <div className="pointer-events-auto ml-auto flex items-center gap-2">
          <div className="glass hidden rounded-full p-1 sm:block">
            <WeatherWidget />
          </div>
          <div className="glass rounded-full p-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="absolute left-1/2 top-20 z-[1050] -translate-x-1/2">
        <MapControls
          vista={vista}
          onVista={setVista}
          showBarrios={showBarrios}
          showAreas={showAreas}
          onToggleBarrios={() => {
            setShowBarrios((v) => !v);
            setShowAreas(false);
          }}
          onToggleAreas={() => {
            setShowAreas((v) => !v);
            setShowBarrios(false);
          }}
        />
      </div>

      <aside className="glass absolute bottom-4 left-4 top-24 z-[1040] hidden w-[360px] flex-col gap-3 rounded-3xl p-4 lg:flex">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-base font-semibold">Explorar Rosario</h1>
          <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] text-muted-foreground">
            {pois.length} lugares
          </span>
        </div>
        <div className="min-h-0 flex-1">{sidebar}</div>
      </aside>

      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="absolute bottom-4 right-4 z-[1040] hidden w-[350px] lg:block"
          >
            <PoiCard
              poi={selected}
              inItinerary={itinerary.includes(selected.id)}
              onAdd={() => toggleItinerary(selected.id)}
              onRemove={() => toggleItinerary(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {vista === "2d" && route && route.legs.length > 0 && (
        <div className="glass absolute bottom-4 left-[396px] z-[1030] hidden max-w-[260px] rounded-2xl p-3 text-xs xl:block">
          <strong className="mb-1.5 block">Tramos del recorrido</strong>
          {route.legs.map((leg, i) => (
            <div key={i} className="my-1 flex items-center gap-2">
              <span
                className="h-1.5 w-4 shrink-0 rounded-full"
                style={{ background: LEG_COLORS[i % LEG_COLORS.length] }}
              />
              <span className="flex-1">
                Parada {i + 1} → {i + 2}
              </span>
              <em className="not-italic text-muted-foreground">
                {(leg.distanceMeters / 1000).toFixed(1)} km · {Math.round(leg.durationSeconds / 60)} min
              </em>
            </div>
          ))}
        </div>
      )}

      <BottomSheet
        title={
          selected ? (
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1.5 text-primary"
            >
              <ArrowLeft className="size-4" /> Volver a la lista
            </button>
          ) : (
            <span className="flex items-center gap-1.5">
              <MapPinned className="size-4 text-primary" /> Explorar Rosario · {pois.length}
            </span>
          )
        }
        expanded={sheetExpanded}
        onExpandedChange={setSheetExpanded}
      >
        {selected ? (
          <PoiCard
            embedded
            poi={selected}
            inItinerary={itinerary.includes(selected.id)}
            onAdd={() => toggleItinerary(selected.id)}
            onRemove={() => toggleItinerary(selected.id)}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="h-[64dvh]">{sidebar}</div>
        )}
      </BottomSheet>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute left-1/2 top-3 z-[1300] -translate-x-1/2 rounded-full border border-destructive/40 bg-destructive/15 px-4 py-2 text-sm font-medium text-destructive backdrop-blur"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
