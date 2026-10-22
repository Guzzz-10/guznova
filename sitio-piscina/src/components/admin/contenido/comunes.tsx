"use client";

import { LoaderCircle, Save } from "lucide-react";
import type { Resultado } from "@/lib/admin/tipos";
import { MensajeResultado } from "../ui";

export function PieGuardar({ pendiente, resultado, onGuardar, texto = "Guardar cambios" }: { pendiente: boolean; resultado: Resultado; onGuardar: () => void; texto?: string }) {
  return (
    <div className="grid gap-3">
      <MensajeResultado resultado={resultado} />
      <div>
        <button type="button" onClick={onGuardar} disabled={pendiente} className="btn btn-agua btn-chico">
          {pendiente ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />} {texto}
        </button>
      </div>
    </div>
  );
}

/** Input controlado con etiqueta, para editores con estado local. */
export function Texto({
  etiqueta,
  valor,
  onCambio,
  multilinea = false,
  ayuda,
  className = "",
  ...props
}: {
  etiqueta: string;
  valor: string | number;
  onCambio: (v: string) => void;
  multilinea?: boolean;
  ayuda?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="text-sm font-semibold text-mar-800">{etiqueta}</span>
      {multilinea ? (
        <textarea value={valor} onChange={(e) => onCambio(e.target.value)} rows={3} className="campo" />
      ) : (
        <input value={valor} onChange={(e) => onCambio(e.target.value)} className="campo" {...props} />
      )}
      {ayuda && <span className="text-xs text-mar-500">{ayuda}</span>}
    </label>
  );
}
