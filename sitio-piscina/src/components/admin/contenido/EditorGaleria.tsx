"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import type { FotoGaleria } from "@/lib/contenido/tipos";
import { modoDemo } from "@/lib/entorno";
import { agregarFotosGaleria, editarAltFoto, eliminarElemento, moverOrden } from "@/lib/admin/acciones";
import type { Resultado } from "@/lib/admin/tipos";
import { BotonAccion, MensajeResultado, Tarjeta } from "../ui";
import { subirAlSitio } from "../SubirImagen";

export function EditorGaleria({ fotos, editable }: { fotos: FotoGaleria[]; editable: boolean }) {
  const router = useRouter();
  const [subiendo, setSubiendo] = useState(0);
  const [resultado, setResultado] = useState<Resultado>(null);

  const subir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = [...(e.target.files ?? [])];
    e.target.value = "";
    if (!archivos.length) return;
    if (modoDemo) return setResultado({ ok: false, mensaje: "En modo demo no se pueden subir fotos." });
    setSubiendo(archivos.length);
    const subidas = [];
    for (const f of archivos) {
      try {
        const r = await subirAlSitio(f, "galeria");
        subidas.push({ url: r.url, path: r.ruta, ancho: r.ancho, alto: r.alto, alt: f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") });
      } catch {
        /* se informa abajo */
      }
      setSubiendo((n) => n - 1);
    }
    const r = subidas.length ? await agregarFotosGaleria(subidas) : { ok: false, mensaje: "No se pudo subir ninguna foto." };
    setResultado(subidas.length < archivos.length && r?.ok ? { ok: false, mensaje: `${r.mensaje} (${archivos.length - subidas.length} no se pudieron subir)` } : r);
    router.refresh();
  };

  return (
    <Tarjeta
      titulo={`Galería (${fotos.length} fotos)`}
      accion={
        editable && (
          <label className="btn btn-agua btn-chico cursor-pointer">
            {subiendo ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
            {subiendo ? `Subiendo ${subiendo}…` : "Subir fotos"}
            <input type="file" accept="image/*" multiple className="sr-only" onChange={subir} disabled={subiendo > 0} />
          </label>
        )
      }
    >
      <MensajeResultado resultado={resultado} className="mb-4" />
      <p className="mb-4 text-sm text-mar-600">Las fotos se achican automáticamente para que el sitio cargue rápido. Escribí una descripción de cada una: ayuda a Google y a personas con lectores de pantalla.</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fotos.map((f, i) => (
          <li key={f.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-mar-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.src} alt={f.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            {editable && (
              <div className="grid gap-2 p-2">
                <input
                  defaultValue={f.alt}
                  aria-label="Descripción de la foto"
                  className="campo px-3 py-1.5 text-sm"
                  onBlur={async (e) => {
                    if (e.target.value !== f.alt) setResultado(await editarAltFoto(f.id, e.target.value));
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="flex">
                    <BotonAccion accion={() => moverOrden("galeria", f.id, -1)} className="grid size-8 place-items-center rounded-lg hover:bg-mar-50 disabled:opacity-30" onOk={() => router.refresh()}>
                      <ArrowLeft className="size-4" aria-label="Mover antes" />
                    </BotonAccion>
                    <BotonAccion accion={() => moverOrden("galeria", f.id, 1)} className="grid size-8 place-items-center rounded-lg hover:bg-mar-50" onOk={() => router.refresh()}>
                      <ArrowRight className="size-4" aria-label="Mover después" />
                    </BotonAccion>
                  </span>
                  <span className="text-xs text-mar-400">#{i + 1}</span>
                  <BotonAccion accion={() => eliminarElemento("galeria", f.id)} confirmar="¿Borrar esta foto de la galería?" className="grid size-8 place-items-center rounded-lg text-coral-700 hover:bg-coral-50" onOk={() => router.refresh()}>
                    <Trash2 className="size-4" aria-label="Borrar foto" />
                  </BotonAccion>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
