"use client";

import { useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";

/** Achica la imagen en el navegador antes de subirla (carga rápida del sitio). */
export async function comprimirImagen(archivo: File, maximo = 1920, calidad = 0.85): Promise<{ blob: Blob; ancho: number; alto: number; tipo: string }> {
  if (archivo.type === "image/svg+xml") return { blob: archivo, ancho: 512, alto: 512, tipo: archivo.type };
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, maximo / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, ancho, alto);
  const tipo = "image/webp";
  const blob = await new Promise<Blob>((ok) => canvas.toBlob((b) => ok(b!), tipo, calidad));
  return { blob, ancho, alto, tipo };
}

/** Sube un archivo al bucket público "sitio" (las reglas de la base permiten solo al admin). */
export async function subirAlSitio(archivo: File, carpeta: string) {
  const { blob, ancho, alto, tipo } = await comprimirImagen(archivo);
  const extension = tipo === "image/svg+xml" ? "svg" : "webp";
  const ruta = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const supabase = supabaseNavegador();
  const { error } = await supabase.storage.from("sitio").upload(ruta, blob, { contentType: tipo, cacheControl: "31536000" });
  if (error) throw error;
  const { data } = supabase.storage.from("sitio").getPublicUrl(ruta);
  return { url: data.publicUrl, ruta, ancho, alto };
}

/** Selector de imagen con vista previa: sube y devuelve la URL pública. */
export function SubirImagen({
  valor,
  onCambio,
  carpeta,
  etiqueta = "Imagen",
  nombre,
  forma = "aspect-video",
  permitirQuitar = true,
}: {
  valor: string | null;
  onCambio: (url: string | null) => void;
  carpeta: string;
  etiqueta?: string;
  nombre?: string;
  forma?: string;
  permitirQuitar?: boolean;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const elegir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (modoDemo) return setError("En modo demo no se pueden subir archivos.");
    if (f.size > 20 * 1024 * 1024) return setError("La imagen pesa más de 20 MB.");
    setSubiendo(true);
    setError("");
    try {
      const { url } = await subirAlSitio(f, carpeta);
      onCambio(url);
    } catch {
      setError("No se pudo subir la imagen. Probá de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-mar-800">{etiqueta}</span>
      {nombre && <input type="hidden" name={nombre} value={valor ?? ""} />}
      <div className={`relative w-full max-w-sm overflow-hidden rounded-2xl bg-mar-50 ring-1 ring-mar-100 ${forma}`}>
        {valor ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={valor} alt="" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-sm text-mar-400">Sin imagen</span>
        )}
        {subiendo && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <LoaderCircle className="size-8 animate-spin text-agua-600" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="btn btn-claro btn-chico cursor-pointer">
          <ImagePlus className="size-4" aria-hidden="true" /> {valor ? "Cambiar" : "Subir"}
          <input type="file" accept="image/*" className="sr-only" onChange={elegir} disabled={subiendo} />
        </label>
        {valor && permitirQuitar && (
          <button type="button" onClick={() => onCambio(null)} className="btn btn-claro btn-chico text-coral-700">
            <Trash2 className="size-4" aria-hidden="true" /> Quitar
          </button>
        )}
      </div>
      {error && <p className="text-sm font-semibold text-coral-700">{error}</p>}
    </div>
  );
}
