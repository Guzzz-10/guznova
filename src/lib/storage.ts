import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

/**
 * Almacenamiento de imágenes.
 *
 * Toda la lógica de guardado/borrado está aislada en este archivo. Para pasar a
 * un storage en la nube (S3, Cloudflare R2, Cloudinary, Vercel Blob…) alcanza
 * con implementar otro `StorageDriver` y asignarlo a `driver` más abajo.
 * El resto de la aplicación solo guarda la URL que devuelve `save`.
 */
export interface StorageDriver {
  /** Guarda el archivo y devuelve la URL pública. */
  save(data: Buffer, filename: string, contentType: string): Promise<string>;
  /** Borra un archivo a partir de su URL pública. No falla si no existe. */
  remove(url: string): Promise<void>;
}

export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads/";

const localDriver: StorageDriver = {
  async save(data, filename) {
    const folder = new Date().toISOString().slice(0, 7); // AAAA-MM
    const dir = path.join(UPLOADS_DIR, folder);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), data);
    return `${PUBLIC_PREFIX}${folder}/${filename}`;
  },
  async remove(url) {
    if (!url.startsWith(PUBLIC_PREFIX)) return;
    const full = path.resolve(UPLOADS_DIR, url.slice(PUBLIC_PREFIX.length));
    if (!full.startsWith(UPLOADS_DIR + path.sep)) return; // evita path traversal
    await fs.rm(full, { force: true });
  },
};

const driver: StorageDriver = localDriver;

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"];

export class UploadError extends Error {}

/**
 * Valida, optimiza (rota según EXIF, limita a 2000px y convierte a JPG) y guarda una foto.
 * Se guarda en JPG para máxima compatibilidad (incluida la vista previa de WhatsApp).
 */
export async function saveImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError(`"${file.name}" no es una imagen válida (usá JPG, PNG o WEBP).`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`"${file.name}" pesa más de 12 MB.`);
  }
  let output: Buffer;
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new UploadError(`No se pudo procesar "${file.name}". Probá con otra foto.`);
  }
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.jpg`;
  return driver.save(output, name, "image/jpeg");
}

export async function deleteImage(url: string): Promise<void> {
  try {
    await driver.remove(url);
  } catch (e) {
    console.error("No se pudo borrar la imagen", url, e);
  }
}
