// Inicializa el esquema PostGIS + seed en una base remota (Neon).
// Lee la URL de conexión desde .env.local (DATABASE_URL_UNPOOLED preferida
// para DDL). Uso: node db/init-remote.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");

// Parser mínimo de .env.local (sin imprimir valores).
const env = {};
for (const line of (await readFile(path.join(root, ".env.local"), "utf-8")).split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const conn = env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL;
if (!conn) throw new Error("No connection string in .env.local");

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
await client.connect();

const schema = await readFile(path.join(here, "init", "01_schema.sql"), "utf-8");
const seed = await readFile(path.join(here, "init", "02_seed_pois.sql"), "utf-8");

await client.query(schema);
console.log("schema applied");
await client.query(seed);
console.log("seed applied");

const { rows } = await client.query("SELECT count(*)::int AS n FROM pois");
console.log("pois rows:", rows[0].n);

await client.end();
