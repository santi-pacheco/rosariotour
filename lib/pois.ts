import { readFile } from "fs/promises";
import path from "path";
import { getPool } from "./db";
import type { Poi } from "./types";

export async function getPois(opts: {
  categoria?: string;
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
}): Promise<Poi[]> {
  const pool = getPool();

  if (pool) {
    const where: string[] = [];
    const params: unknown[] = [];

    if (opts.categoria) {
      params.push(opts.categoria);
      where.push(`categoria = $${params.length}`);
    }
    if (opts.bbox) {
      const [minLon, minLat, maxLon, maxLat] = opts.bbox;
      params.push(minLon, minLat, maxLon, maxLat);
      where.push(
        `geom && ST_MakeEnvelope($${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length}, 4326)`,
      );
    }

    const sql = `
      SELECT id, nombre, categoria, descripcion, tags,
             ST_Y(geom) AS lat, ST_X(geom) AS lon
      FROM pois
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY id`;

    const { rows } = await pool.query(sql, params);
    return rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      categoria: r.categoria,
      descripcion: r.descripcion,
      tags: r.tags ?? [],
      lat: Number(r.lat),
      lon: Number(r.lon),
    }));
  }

  const file = path.join(process.cwd(), "data", "pois.geojson");
  const raw = await readFile(file, "utf-8");
  const fc = JSON.parse(raw) as {
    features: {
      properties: Omit<Poi, "lat" | "lon">;
      geometry: { coordinates: [number, number] };
    }[];
  };

  let pois: Poi[] = fc.features.map((f) => ({
    ...f.properties,
    lon: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }));

  if (opts.categoria) pois = pois.filter((p) => p.categoria === opts.categoria);
  if (opts.bbox) {
    const [minLon, minLat, maxLon, maxLat] = opts.bbox;
    pois = pois.filter(
      (p) => p.lon >= minLon && p.lon <= maxLon && p.lat >= minLat && p.lat <= maxLat,
    );
  }
  return pois;
}
