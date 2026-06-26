export type Categoria =
  | "monumento"
  | "parque"
  | "museo"
  | "gastronomia"
  | "turistico"
  | "historico"
  | "deporte";

export interface Poi {
  id: number;
  nombre: string;
  categoria: Categoria;
  descripcion: string;
  tags: string[];
  lat: number;
  lon: number;
}

export interface RouteLeg {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResult {
  coordinates: [number, number][];
  legs: RouteLeg[];
  distanceMeters: number;
  durationSeconds: number;
}

export interface Weather {
  temperature: number;
  windspeed: number;
  weatherCode: number;
  description: string;
  time: string;
  forecast: { date: string; tMax: number; tMin: number; code: number }[];
}
