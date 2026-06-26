"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Plus, Route, Search, Trash2, X } from "lucide-react";
import { CATEGORIAS, CATEGORIA_KEYS, colorDe } from "@/lib/categorias";
import type { Categoria, Poi, RouteResult } from "@/lib/types";

function fmtDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
function fmtDur(s: number): string {
  const min = Math.round(s / 60);
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
}

export default function Sidebar({
  pois,
  filtro,
  itinerary,
  selectedId,
  route,
  routeLoading,
  onFiltro,
  onSelect,
  onToggleItinerary,
  onCalcular,
  onLimpiar,
}: {
  pois: Poi[];
  filtro: Categoria | "todos";
  itinerary: number[];
  selectedId: number | null;
  route: RouteResult | null;
  routeLoading: boolean;
  onFiltro: (f: Categoria | "todos") => void;
  onSelect: (poi: Poi) => void;
  onToggleItinerary: (id: number) => void;
  onCalcular: () => void;
  onLimpiar: () => void;
}) {
  const [query, setQuery] = useState("");
  const byId = useMemo(() => new Map(pois.map((p) => [p.id, p])), [pois]);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pois;
    return pois.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [pois, query]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar lugar o etiqueta…"
          className="w-full rounded-xl border border-border/70 bg-background/60 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip active={filtro === "todos"} onClick={() => onFiltro("todos")}>
          Todos
        </Chip>
        {CATEGORIA_KEYS.map((k) => (
          <Chip
            key={k}
            active={filtro === k}
            color={CATEGORIAS[k].color}
            onClick={() => onFiltro(k)}
          >
            {CATEGORIAS[k].label}
          </Chip>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin -mr-2 pr-2">
        <SectionTitle>
          Puntos de interés
          <span className="ml-1 font-normal text-muted-foreground">({visibles.length})</span>
        </SectionTitle>
        <ul className="flex flex-col gap-1">
          {visibles.map((poi, i) => {
            const on = poi.id === selectedId;
            const inItin = itinerary.includes(poi.id);
            return (
              <motion.li
                key={poi.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(i * 0.015, 0.3) }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(poi)}
                  onKeyDown={(e) => e.key === "Enter" && onSelect(poi)}
                  className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-2.5 py-2 transition-colors ${
                    on
                      ? "border-primary/60 bg-primary/10"
                      : "border-transparent hover:border-border/60 hover:bg-secondary/60"
                  }`}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full ring-2 ring-background"
                    style={{ background: colorDe(poi.categoria) }}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <strong className="truncate text-[13px] font-semibold leading-tight">
                      {poi.nombre}
                    </strong>
                    <small className="text-[11px] text-muted-foreground">
                      {CATEGORIAS[poi.categoria]?.label}
                    </small>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleItinerary(poi.id);
                    }}
                    aria-label={inItin ? "Quitar del itinerario" : "Agregar al itinerario"}
                    className={`grid size-7 shrink-0 place-items-center rounded-lg border transition-colors ${
                      inItin
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/70 bg-background/70 text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {inItin ? <Check className="size-4" /> : <Plus className="size-4" />}
                  </button>
                </div>
              </motion.li>
            );
          })}
          {visibles.length === 0 && (
            <li className="px-1 py-3 text-sm text-muted-foreground">Sin resultados</li>
          )}
        </ul>
      </div>

      <div className="shrink-0">
        <SectionTitle>Mi itinerario</SectionTitle>
        <ol className="flex flex-col gap-1.5">
          {itinerary.map((id, i) => {
            const poi = byId.get(id);
            if (!poi) return null;
            return (
              <li key={id} className="flex items-center gap-2.5 text-[13px]">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 truncate">{poi.nombre}</span>
                <button
                  onClick={() => onToggleItinerary(id)}
                  aria-label="Quitar"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
          {itinerary.length === 0 && (
            <li className="text-xs text-muted-foreground">
              Agregá puntos con <Plus className="inline size-3 align-text-bottom" /> para armar tu recorrido.
            </li>
          )}
        </ol>

        {route && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/50 px-3 py-2 text-[13px]">
            <Route className="size-4 text-primary" />
            <span>
              <strong className="tabular-nums">{fmtDist(route.distanceMeters)}</strong>
              <span className="text-muted-foreground"> · {fmtDur(route.durationSeconds)}</span>
            </span>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <button
            disabled={itinerary.length < 2 || routeLoading}
            onClick={onCalcular}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Route className="size-4" />
            {routeLoading ? "Calculando…" : "Calcular ruta"}
          </button>
          {(itinerary.length > 0 || route) && (
            <button
              onClick={onLimpiar}
              aria-label="Limpiar itinerario"
              className="grid place-items-center rounded-xl border border-border/70 px-3 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}
    >
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ background: active ? "currentColor" : color }}
        />
      )}
      {children}
    </button>
  );
}
