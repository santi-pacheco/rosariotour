import type { Categoria } from "./types";

export const CATEGORIAS: Record<Categoria, { label: string; color: string }> = {
  monumento: { label: "Monumentos", color: "#16a34a" },
  parque: { label: "Parques", color: "#22c55e" },
  museo: { label: "Museos", color: "#8b5cf6" },
  gastronomia: { label: "Gastronomía", color: "#ec4899" },
  turistico: { label: "Turístico", color: "#f59e0b" },
  historico: { label: "Histórico", color: "#ef4444" },
  deporte: { label: "Deporte", color: "#0ea5e9" },
};

export const CATEGORIA_KEYS = Object.keys(CATEGORIAS) as Categoria[];

export function colorDe(cat: string): string {
  return (CATEGORIAS as Record<string, { color: string }>)[cat]?.color ?? "#64748b";
}

export const LEG_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#db2777",
  "#7c3aed",
  "#0891b2",
  "#dc2626",
];
