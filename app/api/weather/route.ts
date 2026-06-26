import { NextRequest, NextResponse } from "next/server";
import { getWeather } from "@/lib/openmeteo";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get("lat") ?? -32.9477);
  const lon = Number(sp.get("lon") ?? -60.6303);

  try {
    const weather = await getWeather(lat, lon);
    return NextResponse.json(weather);
  } catch (err) {
    console.error("GET /api/weather", err);
    return NextResponse.json({ error: "No se pudo obtener el clima" }, { status: 502 });
  }
}
