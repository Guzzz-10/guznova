import { NextResponse } from "next/server";

/** El panel lo llama mientras hay actividad: el proxy renueva la marca de "última actividad". */
export function GET() {
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
