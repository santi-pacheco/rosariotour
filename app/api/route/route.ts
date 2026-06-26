import { NextRequest, NextResponse } from "next/server";
import { getRoute } from "@/lib/osrm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coords = body.coords as [number, number][];

    if (!Array.isArray(coords) || coords.length < 2) {
      return NextResponse.json(
        { error: "Se necesitan al menos 2 puntos" },
        { status: 400 },
      );
    }

    const route = await getRoute(coords);
    return NextResponse.json(route);
  } catch (err) {
    console.error("POST /api/route", err);
    return NextResponse.json(
      { error: "No se pudo calcular la ruta" },
      { status: 502 },
    );
  }
}
