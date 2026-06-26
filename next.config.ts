import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el indicador/botón de dev tools de Next que aparece sobre el mapa.
  devIndicators: false,

  // Las rutas /api/barrios, /api/areas y el fallback de /api/pois leen
  // data/*.geojson en runtime con readFile(path.join(process.cwd(), "data", ...)).
  // El file tracing de Next no incluye archivos referenciados por una ruta dinámica,
  // así que forzamos su empaquetado para que no devuelvan 500 en Vercel.
  outputFileTracingIncludes: {
    "/api/**": ["./data/**/*"],
  },
};

export default nextConfig;
