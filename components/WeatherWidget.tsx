"use client";

import { useEffect, useState } from "react";
import { Wind } from "lucide-react";
import type { Weather } from "@/lib/types";

export default function WeatherWidget() {
  const [w, setW] = useState<Weather | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setW)
      .catch(() => setError(true));
  }, []);

  if (error) return null;
  if (!w)
    return (
      <div className="hidden items-center rounded-full bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
        Cargando clima…
      </div>
    );

  return (
    <div className="flex items-center gap-3 rounded-full border border-border/50 bg-secondary/40 py-1 pl-2 pr-3">
      <div className="flex items-center gap-2">
        <span className="font-display text-2xl font-semibold leading-none tabular-nums">
          {Math.round(w.temperature)}°
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold capitalize">{w.description}</span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Wind className="size-3" /> {Math.round(w.windspeed)} km/h
          </span>
        </div>
      </div>
      <div className="hidden gap-3 border-l border-border/60 pl-3 lg:flex">
        {w.forecast.slice(0, 3).map((d) => (
          <div key={d.date} className="flex flex-col items-center text-[10px] text-muted-foreground">
            <span className="font-medium capitalize text-foreground/80">
              {new Date(d.date + "T00:00").toLocaleDateString("es-AR", { weekday: "short" })}
            </span>
            <span className="tabular-nums">
              {Math.round(d.tMax)}° / {Math.round(d.tMin)}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
