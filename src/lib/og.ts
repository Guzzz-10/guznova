import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "./storage";

/** Devuelve la foto como data URL para usarla dentro de ImageResponse. */
export async function imageForOg(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    if (/^https?:\/\//.test(url)) return url; // storage en la nube
    if (!url.startsWith("/uploads/")) return null;
    const full = path.resolve(UPLOADS_DIR, url.slice("/uploads/".length));
    if (!full.startsWith(UPLOADS_DIR + path.sep)) return null;
    const data = await fs.readFile(full);
    const ext = path.extname(full).toLowerCase();
    const mime = ext === ".png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Fuentes para las imágenes Open Graph (Sora, licencia OFL, incluida en el repo). */
export async function ogFonts() {
  const dir = path.join(process.cwd(), "src", "assets", "fonts");
  const [regular, bold, extra] = await Promise.all([
    fs.readFile(path.join(dir, "Sora-Regular.ttf")),
    fs.readFile(path.join(dir, "Sora-Bold.ttf")),
    fs.readFile(path.join(dir, "Sora-ExtraBold.ttf")),
  ]);
  return [
    { name: "Sora", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Sora", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Sora", data: extra, weight: 800 as const, style: "normal" as const },
  ];
}
