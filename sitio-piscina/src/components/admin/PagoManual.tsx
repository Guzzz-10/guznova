"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import type { Plan } from "@/lib/contenido/tipos";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { demoSocios } from "@/lib/demo/panel";
import { formatoCedula, formatoNumeroSocio } from "@/lib/formato";
import { FormularioRenovar } from "./FormularioRenovar";

type Opcion = { id: string; nombre_completo: string; numero_socio: number | null; cedula: string; plan_id: string };

/** Buscar un socio y registrarle un pago en efectivo o transferencia. */
export function PagoManual({ planes }: { planes: Plan[] }) {
  const [q, setQ] = useState("");
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [elegido, setElegido] = useState<Opcion | null>(null);

  useEffect(() => {
    const t = q.trim().replace(/[,()*%\\]/g, " ");
    if (t.length < 2 || elegido) return;
    const id = setTimeout(async () => {
      const digitos = t.replace(/\D/g, "");
      if (modoDemo) {
        setOpciones(demoSocios().filter((s) => s.nombre_completo.toLowerCase().includes(t.toLowerCase()) || (digitos && (s.cedula.includes(digitos) || String(s.numero_socio) === digitos))).slice(0, 8));
        return;
      }
      const ors = [`nombre_completo.ilike.%${t}%`];
      if (digitos) ors.push(`cedula.ilike.%${digitos}%`);
      if (digitos && digitos.length <= 7) ors.push(`numero_socio.eq.${Number(digitos)}`);
      const { data } = await supabaseNavegador().from("socios").select("id, nombre_completo, numero_socio, cedula, plan_id").or(ors.join(",")).limit(8);
      setOpciones((data as Opcion[]) ?? []);
    }, 250);
    return () => clearTimeout(id);
  }, [q, elegido]);

  const visibles = q.trim().length >= 2 ? opciones : [];

  if (elegido) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-agua-50 p-3 ring-1 ring-agua-200">
          <span>
            <span className="block font-semibold text-mar-900">{elegido.nombre_completo}</span>
            <span className="text-sm text-mar-600">
              N.º {formatoNumeroSocio(elegido.numero_socio)} · CI {formatoCedula(elegido.cedula)}
            </span>
          </span>
          <button type="button" onClick={() => setElegido(null)} className="grid size-9 place-items-center rounded-full hover:bg-white" aria-label="Elegir otro socio">
            <X className="size-5" />
          </button>
        </div>
        <FormularioRenovar socioId={elegido.id} planes={planes} planActual={elegido.plan_id} />
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="relative block">
        <span className="sr-only">Buscar socio</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-mar-400" aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscá el socio por nombre, cédula o N.º" className="campo pl-12" role="combobox" aria-expanded={visibles.length > 0} aria-controls="opciones-socio" />
      </label>
      {visibles.length > 0 && (
        <ul id="opciones-socio" role="listbox" className="absolute inset-x-0 z-10 mt-2 overflow-hidden rounded-2xl bg-white shadow-flotante ring-1 ring-mar-100">
          {visibles.map((o) => (
            <li key={o.id} role="option" aria-selected={false}>
              <button type="button" onClick={() => setElegido(o)} className="block w-full px-4 py-3 text-left hover:bg-agua-50">
                <span className="block font-semibold text-mar-900">{o.nombre_completo}</span>
                <span className="text-sm text-mar-500">
                  N.º {formatoNumeroSocio(o.numero_socio)} · CI {formatoCedula(o.cedula)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
