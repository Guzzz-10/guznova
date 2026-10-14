import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/storage";

// En producción (`next start`) Next.js solo sirve los archivos de /public que
// existían al compilar. Las fotos subidas después se sirven desde acá
// (ver la regla `fallback` en next.config.ts).

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const full = path.resolve(UPLOADS_DIR, ...parts);
  const type = TYPES[path.extname(full).toLowerCase()];
  if (!full.startsWith(UPLOADS_DIR + path.sep) || !type) {
    return new Response("No encontrado", { status: 404 });
  }
  try {
    const data = await fs.readFile(full);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
