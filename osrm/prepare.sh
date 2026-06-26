#!/usr/bin/env bash
# Prepara OSRM con un extract de OpenStreetMap para ruteo a pie en Rosario.
# Descarga el extract de la provincia de Santa Fe (Geofabrik) y corre el
# pipeline extract -> partition -> customize usando la imagen osrm/osrm-backend.
#
# Uso:  bash osrm/prepare.sh
# Luego: docker compose --profile routing up osrm
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/data"
PBF_URL="https://download.geofabrik.de/south-america/argentina/santa-fe-latest.osm.pbf"
PBF="santa-fe-latest.osm.pbf"
PROFILE="/opt/foot.lua"   # perfil peatonal incluido en la imagen OSRM

mkdir -p "$DIR"
cd "$DIR"

if [ ! -f "$PBF" ]; then
  echo ">> Descargando extract de OSM (Santa Fe)..."
  curl -L -o "$PBF" "$PBF_URL"
fi

run() { docker run --rm -v "$DIR:/data" osrm/osrm-backend:latest "$@"; }

echo ">> osrm-extract (perfil a pie)..."
run osrm-extract -p "$PROFILE" "/data/$PBF"

echo ">> osrm-partition..."
run osrm-partition /data/santa-fe-latest.osrm

echo ">> osrm-customize..."
run osrm-customize /data/santa-fe-latest.osrm

echo ">> Listo. Arrancá el router con:  docker compose --profile routing up osrm"
