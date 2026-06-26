-- RosarioTour - esquema de base de datos espacial
-- PostGIS habilita tipos y funciones geoespaciales (ST_*).

CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS pois;

CREATE TABLE pois (
    id          INTEGER PRIMARY KEY,
    nombre      TEXT NOT NULL,
    categoria   TEXT NOT NULL,
    descripcion TEXT,
    tags        TEXT[] DEFAULT '{}',
    -- Geometría de punto en WGS84 (EPSG:4326), el CRS de GPS/OSM.
    geom        geometry(Point, 4326) NOT NULL
);

-- Índice espacial GIST: acelera consultas por bounding box e intersección.
CREATE INDEX idx_pois_geom ON pois USING GIST (geom);

-- Índice por categoría para el filtro del frontend.
CREATE INDEX idx_pois_categoria ON pois (categoria);
