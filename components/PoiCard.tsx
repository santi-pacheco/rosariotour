"use client";

import { useEffect, useState } from "react";
import { Check, Clock, MapPin, Plus, Star, X } from "lucide-react";
import { CATEGORIAS, colorDe } from "@/lib/categorias";
import type { Poi } from "@/lib/types";
import type { PlaceInfo } from "@/lib/places";

export default function PoiCard({
  poi,
  inItinerary,
  onAdd,
  onRemove,
  onClose,
  embedded = false,
}: {
  poi: Poi;
  inItinerary: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
  embedded?: boolean;
}) {
  const [places, setPlaces] = useState<{ enabled: boolean; info: PlaceInfo | null } | null>(null);

  useEffect(() => {
    setPlaces(null);
    const q = new URLSearchParams({ nombre: poi.nombre, lat: String(poi.lat), lon: String(poi.lon) });
    fetch(`/api/places?${q}`)
      .then((r) => r.json())
      .then(setPlaces)
      .catch(() => setPlaces({ enabled: false, info: null }));
  }, [poi]);

  const cat = CATEGORIAS[poi.categoria];
  const accent = colorDe(poi.categoria);

  return (
    <div
      className={
        embedded ? "flex flex-col" : "glass flex flex-col overflow-hidden rounded-3xl"
      }
    >
      <div className="relative">
        <div className="h-1.5 w-full" style={{ background: accent }} />
        {!embedded && (
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-background/70 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ background: accent }}
          >
            <MapPin className="size-3" />
            {cat?.label ?? poi.categoria}
          </span>
          <h3 className="mt-2 font-display text-xl font-semibold leading-snug">{poi.nombre}</h3>
        </div>

        <p className="text-[13px] leading-relaxed text-muted-foreground">{poi.descripcion}</p>

        <div className="flex flex-wrap gap-1.5">
          {poi.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/60 bg-secondary/50 px-2.5 py-0.5 text-[11px]"
            >
              {t}
            </span>
          ))}
        </div>

        {places?.enabled && places.info && (
          <div className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-secondary/40 p-3 text-xs">
            <div className="flex items-center gap-3">
              {places.info.rating != null && (
                <span className="flex items-center gap-1 font-semibold">
                  <Star className="size-3.5 fill-accent text-accent" /> {places.info.rating}
                  <span className="font-normal text-muted-foreground">
                    ({places.info.userRatingsTotal})
                  </span>
                </span>
              )}
              {places.info.openNow != null && (
                <span
                  className={`flex items-center gap-1 font-medium ${
                    places.info.openNow ? "text-primary" : "text-destructive"
                  }`}
                >
                  <Clock className="size-3.5" />
                  {places.info.openNow ? "Abierto ahora" : "Cerrado"}
                </span>
              )}
            </div>

            {places.info.popularity != null && (
              <div className="relative h-5 overflow-hidden rounded-md bg-background/70">
                <div
                  className="absolute inset-y-0 left-0 bg-primary/30"
                  style={{ width: `${places.info.popularity}%` }}
                />
                <span className="relative block text-center text-[11px] leading-5">
                  Popularidad {places.info.popularity}%
                </span>
              </div>
            )}

            {places.info.hours && places.info.hours.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer list-none font-medium text-foreground">
                  Horarios
                </summary>
                <ul className="mt-1.5 space-y-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {places.info.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </details>
            )}

            {places.info.reviews && places.info.reviews.length > 0 && (
              <div className="flex max-h-52 flex-col gap-2 overflow-y-auto scroll-thin pr-1">
                <strong className="text-[11px]">Reseñas</strong>
                {places.info.reviews.map((r, i) => (
                  <div key={i} className="rounded-lg bg-background/60 p-2">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="truncate">{r.author}</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3 fill-accent text-accent" />
                        {r.rating}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{r.text}</p>
                    <small className="text-[10px] text-muted-foreground">{r.relativeTime}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {inItinerary ? (
          <button
            onClick={onRemove}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-border/70 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
          >
            <Check className="size-4" /> En tu itinerario · quitar
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:translate-y-px"
          >
            <Plus className="size-4" /> Agregar al itinerario
          </button>
        )}
      </div>
    </div>
  );
}
