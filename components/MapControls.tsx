"use client";

import { Box, Layers, Map as MapIcon, Shapes } from "lucide-react";

export default function MapControls({
  vista,
  onVista,
  showBarrios,
  showAreas,
  onToggleBarrios,
  onToggleAreas,
}: {
  vista: "2d" | "3d";
  onVista: (v: "2d" | "3d") => void;
  showBarrios: boolean;
  showAreas: boolean;
  onToggleBarrios: () => void;
  onToggleAreas: () => void;
}) {
  return (
    <div className="glass flex items-center gap-1 rounded-full p-1">
      <SegBtn active={vista === "2d"} onClick={() => onVista("2d")}>
        <MapIcon className="size-4" /> 2D
      </SegBtn>
      <SegBtn active={vista === "3d"} onClick={() => onVista("3d")}>
        <Box className="size-4" /> 3D
      </SegBtn>

      {vista === "2d" && (
        <>
          <span className="mx-0.5 h-5 w-px bg-border/70" />
          <LayerBtn active={showAreas} onClick={onToggleAreas}>
            <Shapes className="size-4" />
            <span className="hidden sm:inline">Áreas</span>
          </LayerBtn>
          <LayerBtn active={showBarrios} onClick={onToggleBarrios}>
            <Layers className="size-4" />
            <span className="hidden sm:inline">Barrios</span>
          </LayerBtn>
        </>
      )}
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function LayerBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? "bg-accent text-accent-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
