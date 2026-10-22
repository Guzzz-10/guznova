"use client";

import { useActionState, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import type { Resultado } from "@/lib/admin/tipos";
import { Aviso } from "@/components/ui/Aviso";

/** Muestra el resultado de una acción (éxito o error). */
export function MensajeResultado({ resultado, className = "" }: { resultado: Resultado; className?: string }) {
  if (!resultado || !resultado.mensaje) return null;
  return (
    <Aviso tipo={resultado.ok ? "ok" : "error"} className={className}>
      {resultado.mensaje}
    </Aviso>
  );
}

/** Ejecuta una server action desde un botón, con confirmación opcional. */
export function useAccion() {
  const [pendiente, iniciar] = useTransition();
  const [resultado, setResultado] = useState<Resultado>(null);
  const ejecutar = (fn: () => Promise<Resultado>, confirmar?: string) => {
    if (confirmar && !window.confirm(confirmar)) return;
    iniciar(async () => {
      const r = await fn();
      setResultado(r);
    });
  };
  return { ejecutar, pendiente, resultado, setResultado };
}

export function BotonAccion({
  accion,
  confirmar,
  children,
  className = "btn btn-claro btn-chico",
  onOk,
}: {
  accion: () => Promise<Resultado>;
  confirmar?: string;
  children: React.ReactNode;
  className?: string;
  onOk?: (r: Resultado) => void;
}) {
  const { ejecutar, pendiente, resultado } = useAccion();
  return (
    <span className="inline-grid shrink-0 gap-2">
      <button
        type="button"
        disabled={pendiente}
        className={className}
        onClick={() =>
          ejecutar(async () => {
            const r = await accion();
            if (r?.ok) onOk?.(r);
            return r;
          }, confirmar)
        }
      >
        {pendiente && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
      <MensajeResultado resultado={resultado} />
    </span>
  );
}

/** Formulario conectado a una server action (FormData) con mensaje de resultado. */
export function FormularioAccion({
  accion,
  children,
  textoBoton = "Guardar",
  className = "",
  onOk,
}: {
  accion: (prev: Resultado, fd: FormData) => Promise<Resultado>;
  children: React.ReactNode;
  textoBoton?: string;
  className?: string;
  onOk?: (r: Resultado) => void;
}) {
  const [resultado, enviar, pendiente] = useActionState(async (prev: Resultado, fd: FormData) => {
    const r = await accion(prev, fd);
    if (r?.ok) onOk?.(r);
    return r;
  }, null);
  return (
    <form action={enviar} className={`grid gap-4 ${className}`}>
      {children}
      <MensajeResultado resultado={resultado} />
      <div>
        <button type="submit" disabled={pendiente} className="btn btn-agua btn-chico">
          {pendiente && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
          {textoBoton}
        </button>
      </div>
    </form>
  );
}

export function Tarjeta({ titulo, children, accion, className = "" }: { titulo?: React.ReactNode; children: React.ReactNode; accion?: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl bg-white p-5 shadow-suave ring-1 ring-mar-100 sm:p-6 ${className}`}>
      {(titulo || accion) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {titulo && <h2 className="text-lg font-bold text-mar-900">{titulo}</h2>}
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

/** Campo simple para formularios del panel (input, textarea o select). */
export function CampoPanel({
  etiqueta,
  ayuda,
  className = "",
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  className?: string;
  children: React.ReactElement;
}) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="text-sm font-semibold text-mar-800">{etiqueta}</span>
      {children}
      {ayuda && <span className="text-xs text-mar-500">{ayuda}</span>}
    </label>
  );
}

/** Lista editable de textos (beneficios, "ideal para", etc.). Envía un JSON en un input oculto. */
export function ListaEditable({
  nombre,
  valores,
  onCambio,
  placeholder = "Escribí y apretá Agregar",
  max = 12,
}: {
  nombre?: string;
  valores: string[];
  onCambio: (v: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [nuevo, setNuevo] = useState("");
  const agregar = () => {
    const t = nuevo.trim();
    if (!t || valores.length >= max) return;
    onCambio([...valores, t]);
    setNuevo("");
  };
  return (
    <div className="grid gap-2">
      {nombre && <input type="hidden" name={nombre} value={JSON.stringify(valores)} />}
      {valores.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input className="campo py-2" value={v} onChange={(e) => onCambio(valores.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`Elemento ${i + 1}`} />
          <button type="button" onClick={() => onCambio(valores.filter((_, j) => j !== i))} className="shrink-0 rounded-xl px-3 text-sm font-semibold text-coral-700 hover:bg-coral-50" aria-label={`Quitar ${v}`}>
            Quitar
          </button>
        </div>
      ))}
      {valores.length < max && (
        <div className="flex gap-2">
          <input
            className="campo py-2"
            value={nuevo}
            placeholder={placeholder}
            onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregar();
              }
            }}
          />
          <button type="button" onClick={agregar} className="btn btn-claro btn-chico shrink-0">
            Agregar
          </button>
        </div>
      )}
    </div>
  );
}

const estiloInsignia: Record<string, string> = {
  activo: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  vencido: "bg-red-100 text-red-800 ring-red-200",
  pendiente: "bg-sol-100 text-sol-900 ring-sol-300",
  suspendido: "bg-mar-100 text-mar-700 ring-mar-200",
  aprobado: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rechazado: "bg-red-100 text-red-800 ring-red-200",
  reembolsado: "bg-mar-100 text-mar-700 ring-mar-200",
  permitido: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  desconocido: "bg-mar-100 text-mar-700 ring-mar-200",
};
const textoInsignia: Record<string, string> = {
  activo: "✓ Activo",
  vencido: "✕ Vencido",
  pendiente: "Pendiente",
  suspendido: "Suspendido",
  aprobado: "✓ Aprobado",
  rechazado: "✕ Rechazado",
  reembolsado: "Reembolsado",
  permitido: "✓ Permitido",
  desconocido: "? Desconocido",
};

/** Estado con texto + símbolo (nunca solo color). */
export function Insignia({ estado }: { estado: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ring-1 ${estiloInsignia[estado] ?? "bg-mar-100 text-mar-700 ring-mar-200"}`}>{textoInsignia[estado] ?? estado}</span>;
}

export function Avatar({ nombre, foto, tam = "size-10" }: { nombre: string; foto?: string | null; tam?: string }) {
  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return foto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={foto} alt="" className={`${tam} shrink-0 rounded-xl object-cover`} />
  ) : (
    <span aria-hidden="true" className={`${tam} grid shrink-0 place-items-center rounded-xl bg-agua-100 text-sm font-bold text-agua-800`}>
      {iniciales}
    </span>
  );
}
