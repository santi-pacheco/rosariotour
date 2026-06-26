import { NextRequest, NextResponse } from "next/server";
import { getPlaceInfo, placesEnabled } from "@/lib/places";

export async function GET(req: NextRequest) {
  if (!placesEnabled()) {
    return NextResponse.json({ enabled: false });
  }

  const sp = req.nextUrl.searchParams;
  const nombre = sp.get("nombre") ?? "";
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));

  if (!nombre || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  try {
    const info = await getPlaceInfo(nombre, lat, lon);
    return NextResponse.json({ enabled: true, info });
  } catch (err) {
    console.error("GET /api/places", err);
    return NextResponse.json({ enabled: true, info: null });
  }
}
