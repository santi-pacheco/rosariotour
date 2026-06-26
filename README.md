# RosarioTour 🗺️

Aplicación web de **Sistemas de Información Geográfica (SIG)** para armar itinerarios
turísticos en Rosario. Permite explorar puntos de interés (POI) sobre un mapa interactivo,
seleccionarlos para construir un recorrido, calcular la ruta óptima entre ellos y consultar
información geoespacial enriquecida con datos de clima en tiempo real (IoT) y popularidad.

> Trabajo Práctico Integrador — Materia electiva *Sistemas de Información Geográfica*,
> Ingeniería en Sistemas de Información, UTN Facultad Regional Rosario.

## Funcionalidades

- **Mapa interactivo** de Rosario (2D con Leaflet + tiles OpenStreetMap, 3D con MapLibre GL).
- **Puntos de interés** clasificados por categoría, servidos desde PostGIS con consultas espaciales.
- **Filtro por categoría** que ejercita queries espaciales en la base.
- **Itinerario**: el usuario elige y ordena los puntos a visitar.
- **Cálculo de ruta** entre los puntos del itinerario usando OSRM (distancia y tiempo).
- **Clima e IoT**: clima actual y pronóstico de Rosario vía Open-Meteo.
- **Popularidad / detalle de lugares**: opcional vía Google Places API.

## Arquitectura

```
Browser (React/Next.js)
   │  Leaflet 2D / MapLibre 3D
   ▼
API Routes (Next.js, Node.js)
   ├─ /api/pois     → PostgreSQL + PostGIS (ST_*)   [fallback: data/pois.geojson]
   ├─ /api/route    → OSRM (motor de ruteo OSM)
   ├─ /api/weather  → Open-Meteo
   └─ /api/places   → Google Places (opcional)
```

## Fuentes y formatos de datos

| Dato | Fuente | Procedencia | Formato |
|------|--------|-------------|---------|
| Red vial para ruteo | OpenStreetMap (extract de Santa Fe, Geofabrik) | colaborativa/abierta | `.osm.pbf` → grafo OSRM |
| Cartografía base (tiles) | OpenStreetMap tile server | colaborativa/abierta | raster PNG (z/x/y) |
| Puntos de interés | Curado propio sobre Rosario (referencias OSM / Infomapa) | administrativa/abierta | GeoJSON / tabla PostGIS `geometry(Point,4326)` |
| Clima y pronóstico (IoT) | Open-Meteo | API pública sin key | JSON |
| Detalle/popularidad de lugares | Google Places API | comercial (tier gratuito) | JSON |

El CRS de todos los datos geoespaciales es **EPSG:4326 (WGS84)**.

## Requisitos

- Node.js 20+ y npm
- Docker (para PostGIS y, opcionalmente, OSRM)

## Puesta en marcha

### 1. Variables de entorno

```bash
cp .env.example .env.local
```

Sin configurar nada más, la app funciona: si no hay base de datos usa `data/pois.geojson`,
el ruteo usa el servidor demo público de OSRM y el clima usa Open-Meteo (sin API key).

### 2. Base de datos espacial (PostGIS)

```bash
docker compose up -d db
```

Esto levanta PostgreSQL + PostGIS y ejecuta automáticamente `db/init/01_schema.sql`
y `db/init/02_seed_pois.sql` (crea la tabla `pois` con índice GIST y carga los puntos).
La conexión por defecto (`DATABASE_URL` en `.env.example`) ya apunta a este contenedor.

### 3. (Opcional) Ruteo a pie local con OSRM

El demo público de OSRM solo soporta perfil *driving*. Para ruteo peatonal real:

```bash
bash osrm/prepare.sh                       # descarga extract de OSM y lo preprocesa
docker compose --profile routing up -d osrm
```

Luego en `.env.local`:

```
OSRM_URL=http://localhost:5000
OSRM_PROFILE=foot
```

### 4. (Opcional) Google Places

Cargá tu clave en `.env.local`:

```
GOOGLE_PLACES_API_KEY=tu_api_key
```

Sin clave, la sección de popularidad/reseñas simplemente no aparece.

### 5. App

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>.

## Verificación rápida

```bash
curl "http://localhost:3000/api/pois?categoria=museo"   # POIs filtrados (PostGIS)
curl "http://localhost:3000/api/weather"                # clima de Rosario (Open-Meteo)
```

## Stack

Next.js · React · TypeScript · Leaflet · MapLibre GL · PostgreSQL + PostGIS · OSRM ·
Open-Meteo · Google Places API.
