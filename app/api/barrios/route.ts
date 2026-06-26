import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "barrios.geojson"), "utf-8");
    return new NextResponse(raw, {
      headers: { "Content-Type": "application/geo+json" },
    });
  } catch (err) {
    console.error("GET /api/barrios", err);
    return NextResponse.json({ error: "No se pudieron cargar los barrios" }, { status: 500 });
  }
}
