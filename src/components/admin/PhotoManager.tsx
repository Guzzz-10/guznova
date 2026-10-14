"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2, Upload } from "lucide-react";
import { useToast } from "./Feedback";
import { cn } from "@/lib/cn";

type Uploading = { id: string; name: string; progress: number; preview: string };

const MAX_MB = 12;

function uploadFile(file: File, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && body.url) resolve(body.url);
        else reject(new Error(body.error || "No se pudo subir la foto."));
      } catch {
        reject(new Error("No se pudo subir la foto."));
      }
    };
    xhr.onerror = () => reject(new Error("Sin conexión. Revisá internet y probá de nuevo."));
    xhr.open("POST", "/api/admin/upload");
    xhr.send(fd);
  });
}

/**
 * Gestor de fotos: arrastrar y soltar o elegir desde el celular/computadora,
 * elegir portada (la primera foto) y reordenar.
 */
export function PhotoManager({
  images,
  onChange,
  onRemove,
}: {
  images: string[];
  onChange: (next: string[] | ((prev: string[]) => string[])) => void;
  onRemove: (url: string) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<Uploading[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    const files = Array.from(list).filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast("error", `"${f.name}" no es una imagen.`);
        return false;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        toast("error", `"${f.name}" pesa más de ${MAX_MB} MB.`);
        return false;
      }
      return true;
    });
    let okCount = 0;
    await Promise.all(
      files.map(async (file) => {
        const id = `${Date.now()}-${Math.random()}`;
        const preview = URL.createObjectURL(file);
        setUploading((u) => [...u, { id, name: file.name, progress: 0, preview }]);
        try {
          const url = await uploadFile(file, (progress) =>
            setUploading((u) => u.map((x) => (x.id === id ? { ...x, progress } : x))),
          );
          onChange((prev) => [...prev, url]);
          okCount++;
        } catch (e) {
          toast("error", e instanceof Error ? e.message : "No se pudo subir la foto.");
        } finally {
          URL.revokeObjectURL(preview);
          setUploading((u) => u.filter((x) => x.id !== id));
        }
      }),
    );
    if (okCount) toast("success", okCount === 1 ? "Foto subida." : `${okCount} fotos subidas.`);
    if (inputRef.current) inputRef.current.value = "";
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    onChange((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
          dragOver ? "border-nova-500 bg-nova-50" : "border-ink-200 bg-ink-50/50",
        )}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-nova-600 shadow-sm">
          <Upload className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-3 font-semibold text-ink-800">Arrastrá las fotos acá</p>
        <p className="text-sm text-ink-500">o</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="a-btn-primary mt-2">
          <ImagePlus className="h-4 w-4" aria-hidden /> Elegir fotos
        </button>
        <p className="mt-3 text-xs text-ink-500">JPG, PNG o WEBP · hasta {MAX_MB} MB cada una · podés elegir varias a la vez</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Elegir fotos"
        />
      </div>

      {(images.length > 0 || uploading.length > 0) && (
        <>
          <p className="mb-2 mt-5 text-sm text-ink-600">
            <strong>La primera foto es la portada.</strong> Usá las flechas (o arrastrá las fotos) para cambiar el orden.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence initial={false}>
              {images.map((url, i) => (
                <motion.li
                  key={url}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  draggable
                  onDragStartCapture={() => setDragIndex(i)}
                  onDragOverCapture={(e) => {
                    if (dragIndex !== null) e.preventDefault();
                  }}
                  onDropCapture={(e) => {
                    if (dragIndex === null) return;
                    e.preventDefault();
                    e.stopPropagation();
                    move(dragIndex, i);
                    setDragIndex(null);
                  }}
                  onDragEndCapture={() => setDragIndex(null)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 bg-white",
                    i === 0 ? "border-nova-500" : "border-ink-100",
                    dragIndex === i && "opacity-40",
                  )}
                >
                  <div className="relative aspect-[4/3] cursor-grab bg-ink-100 active:cursor-grabbing">
                    <Image src={url} alt={`Foto ${i + 1}`} fill sizes="(min-width: 1024px) 220px, 45vw" className="pointer-events-none object-cover" />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-nova-500 px-2 py-1 text-xs font-bold text-ink-950">
                        <Star className="h-3 w-3 fill-current" aria-hidden /> Portada
                      </span>
                    )}
                    <span className="absolute right-2 top-2 rounded-full bg-ink-900/70 px-2 py-0.5 text-xs font-semibold text-white">{i + 1}</span>
                  </div>
                  <div className="flex items-center gap-1 p-1.5">
                    <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 disabled:opacity-30" aria-label={`Mover foto ${i + 1} a la izquierda`}>
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 disabled:opacity-30" aria-label={`Mover foto ${i + 1} a la derecha`}>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {i !== 0 && (
                      <button type="button" onClick={() => move(i, 0)} className="ml-auto inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-nova-700 hover:bg-nova-50" title="Usar como portada">
                        <Star className="h-3.5 w-3.5" aria-hidden /> Portada
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(url)}
                      className={cn("grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50", i === 0 && "ml-auto")}
                      aria-label={`Quitar foto ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.li>
              ))}
              {uploading.map((u) => (
                <motion.li key={u.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative overflow-hidden rounded-2xl border-2 border-ink-100 bg-white">
                  <div className="relative aspect-[4/3] bg-ink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.preview} alt="" className="h-full w-full object-cover opacity-50" />
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink-800">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> {u.progress < 100 ? `${u.progress}%` : "Procesando…"}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-ink-100">
                    <div className="h-full bg-nova-500 transition-all" style={{ width: `${u.progress}%` }} />
                  </div>
                  <p className="truncate p-2 text-xs text-ink-500">{u.name}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </div>
  );
}
