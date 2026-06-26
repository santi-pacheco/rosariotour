import { NextRequest, NextResponse } from "next/server";
import { getPois } from "@/lib/pois";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const categoria = sp.get("categoria") ?? undefined;

  let bbox: [number, number, number, number] | undefined;
  const bboxParam = sp.get("bbox");
  if (bboxParam) {
    const parts = bboxParam.split(",").map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      bbox = parts as [number, number, number, number];
    }
  }

  try {
    const pois = await getPois({ categoria, bbox });
    return NextResponse.json({ pois });
  } catch (err) {
    console.error("GET /api/pois", err);
    return NextResponse.json({ error: "No se pudieron obtener los POIs" }, { status: 500 });
  }
}
