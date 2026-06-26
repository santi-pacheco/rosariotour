import type { RouteLeg, RouteResult } from "./types";

export async function getRoute(
  coords: [number, number][],
): Promise<RouteResult> {
  if (coords.length < 2) {
    throw new Error("Se necesitan al menos 2 puntos para calcular una ruta");
  }

  const base = process.env.OSRM_URL ?? "https://router.project-osrm.org";
  const profile = process.env.OSRM_PROFILE ?? "driving";
  const path = coords.map(([lon, lat]) => `${lon},${lat}`).join(";");
  const url = `${base}/route/v1/${profile}/${path}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OSRM respondió ${res.status}`);
  }
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error(`OSRM: ${data.code ?? "sin ruta"}`);
  }

  const route = data.routes[0];

  const legs: RouteLeg[] = (route.legs ?? []).map(
    (leg: {
      distance: number;
      duration: number;
      steps?: { geometry: { coordinates: [number, number][] } }[];
    }) => {
      const coordinates: [number, number][] = [];
      for (const step of leg.steps ?? []) {
        for (const c of step.geometry.coordinates) {
          coordinates.push(c);
        }
      }
      return { coordinates, distanceMeters: leg.distance, durationSeconds: leg.duration };
    },
  );

  return {
    coordinates: route.geometry.coordinates as [number, number][],
    legs,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}
