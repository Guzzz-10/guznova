"use client";

import { Sparkles } from "lucide-react";
import { importarContenidoEjemplo } from "@/lib/admin/acciones";
import { BotonAccion } from "./ui";

/** Aviso cuando el sitio todavía muestra el contenido de ejemplo (no editable hasta importarlo). */
export function BannerEjemplo({ texto }: { texto?: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-gradient-to-r from-sol-100 to-coral-100 p-5 ring-1 ring-sol-300 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex gap-3 text-mar-900">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-coral-600" aria-hidden="true" />
        <span>{texto ?? "El sitio está mostrando el contenido de ejemplo. Cargalo en la base de datos para poder editar textos, planes, clases y fotos desde el panel."}</span>
      </p>
      <BotonAccion accion={importarContenidoEjemplo} className="btn btn-coral btn-chico shrink-0">
        Cargar contenido para editar
      </BotonAccion>
    </div>
  );
}
