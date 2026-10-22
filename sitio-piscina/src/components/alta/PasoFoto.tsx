"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Camera, ImagePlus, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { recortarImagen } from "./recorte";
import { Aviso } from "@/components/ui/Aviso";

/** Subir o sacar la foto tipo carnet, recortarla y previsualizarla. */
export function PasoFoto({ foto, onFoto }: { foto: string | null; onFoto: (dataUrl: string | null) => void }) {
  const [original, setOriginal] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const elegir = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) return setError("El archivo tiene que ser una imagen.");
    if (archivo.size > 15 * 1024 * 1024) return setError("La imagen es muy pesada (máximo 15 MB).");
    setError("");
    const lector = new FileReader();
    lector.onload = () => {
      setOriginal(String(lector.result));
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    lector.readAsDataURL(archivo);
  };

  const alCompletar = useCallback((_: Area, px: Area) => setArea(px), []);

  const confirmar = async () => {
    if (!original || !area) return;
    setProcesando(true);
    try {
      const { dataUrl } = await recortarImagen(original, area);
      onFoto(dataUrl);
      setOriginal(null);
    } catch {
      setError("No pudimos procesar la imagen. Probá con otra.");
    } finally {
      setProcesando(false);
    }
  };

  if (original) {
    return (
      <div className="grid gap-4">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-3xl bg-mar-950">
          <Cropper image={original} crop={crop} zoom={zoom} aspect={3 / 4} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={alCompletar} showGrid objectFit="cover" />
        </div>
        <div className="mx-auto flex w-full max-w-xs items-center gap-3">
          <ZoomOut className="size-5 text-mar-500" aria-hidden="true" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="h-2 flex-1 cursor-pointer accent-agua-600"
          />
          <ZoomIn className="size-5 text-mar-500" aria-hidden="true" />
        </div>
        <p className="text-center text-sm text-mar-600">Arrastrá y hacé zoom para que tu cara quede centrada.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => setOriginal(null)} className="btn btn-claro btn-chico">
            <RotateCcw className="size-4" aria-hidden="true" /> Elegir otra
          </button>
          <button type="button" onClick={confirmar} disabled={procesando} className="btn btn-agua btn-chico">
            ✂️ Usar este recorte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="mx-auto grid w-full max-w-xs place-items-center">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt="Vista previa de tu foto de carnet" className="aspect-[3/4] w-48 rounded-3xl object-cover shadow-flotante ring-4 ring-white" />
        ) : (
          <div className="grid aspect-[3/4] w-48 place-items-center rounded-3xl border-4 border-dashed border-agua-200 bg-agua-50 text-center text-agua-700">
            <div>
              <span className="text-5xl" aria-hidden="true">
                🤳
              </span>
              <p className="mt-2 px-4 text-sm font-semibold">Tu foto va acá</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="btn btn-agua btn-chico cursor-pointer">
          <ImagePlus className="size-5" aria-hidden="true" /> {foto ? "Cambiar foto" : "Subir foto"}
          <input type="file" accept="image/*" onChange={elegir} className="sr-only" />
        </label>
        <label className="btn btn-claro btn-chico cursor-pointer">
          <Camera className="size-5" aria-hidden="true" /> Sacar una ahora
          <input type="file" accept="image/*" capture="user" onChange={elegir} className="sr-only" />
        </label>
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}

      <Aviso>
        <strong>Tips para que salga bien:</strong> de frente, con buena luz y fondo claro, sin lentes de sol ni gorro. La usamos para verificar tu identidad en la entrada y solo la
        ven vos y la administración.
      </Aviso>
    </div>
  );
}
