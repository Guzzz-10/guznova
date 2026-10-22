"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Piscina } from "@/lib/contenido/tipos";
import { eliminarElemento, guardarPiscina, moverOrden } from "@/lib/admin/acciones";
import { BotonAccion, ListaEditable, Tarjeta, useAccion } from "../ui";
import { SubirImagen } from "../SubirImagen";
import { PieGuardar, Texto } from "./comunes";

function FormPiscina({ piscina, onListo }: { piscina?: Piscina; onListo: () => void }) {
  const [p, setP] = useState({
    id: piscina?.id,
    nombre: piscina?.nombre ?? "",
    tipo: piscina?.tipo ?? "",
    descripcion: piscina?.descripcion ?? "",
    imagen: piscina?.imagen ?? "",
    medidas: piscina?.medidas ?? "",
    profundidad: piscina?.profundidad ?? "",
    temperatura: piscina?.temperatura ?? "",
    idealPara: piscina?.idealPara ?? [],
    color: piscina?.color ?? ("agua" as Piscina["color"]),
  });
  const { ejecutar, pendiente, resultado } = useAccion();
  const set = (c: Partial<typeof p>) => setP((x) => ({ ...x, ...c }));
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Texto etiqueta="Nombre" valor={p.nombre} onCambio={(v) => set({ nombre: v })} />
        <Texto etiqueta="Tipo" valor={p.tipo} onCambio={(v) => set({ tipo: v })} placeholder="Piscina semiolímpica" />
        <Texto etiqueta="Descripción" valor={p.descripcion} onCambio={(v) => set({ descripcion: v })} multilinea className="sm:col-span-2" />
        <Texto etiqueta="Medidas" valor={p.medidas} onCambio={(v) => set({ medidas: v })} placeholder="25 × 12,5 m" />
        <Texto etiqueta="Profundidad" valor={p.profundidad} onCambio={(v) => set({ profundidad: v })} placeholder="1,20 a 2,00 m" />
        <Texto etiqueta="Temperatura del agua" valor={p.temperatura} onCambio={(v) => set({ temperatura: v })} placeholder="28 °C" />
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-mar-800">Color</span>
          <select value={p.color} onChange={(e) => set({ color: e.target.value as Piscina["color"] })} className="campo">
            <option value="agua">Turquesa</option>
            <option value="coral">Coral</option>
            <option value="sol">Amarillo sol</option>
          </select>
        </label>
      </div>
      <div className="grid gap-1.5">
        <span className="text-sm font-semibold text-mar-800">Ideal para</span>
        <ListaEditable valores={p.idealPara} onCambio={(v) => set({ idealPara: v })} max={6} placeholder="Ej: Nado libre" />
      </div>
      <SubirImagen valor={p.imagen || null} onCambio={(v) => set({ imagen: v ?? "" })} carpeta="piscinas" etiqueta="Foto" forma="aspect-[4/5] max-w-56" />
      <PieGuardar
        pendiente={pendiente}
        resultado={resultado}
        texto={piscina ? "Guardar piscina" : "Agregar piscina"}
        onGuardar={() =>
          ejecutar(async () => {
            const r = await guardarPiscina(p);
            if (r?.ok) onListo();
            return r;
          })
        }
      />
    </div>
  );
}

export function EditorPiscinas({ piscinas, editable }: { piscinas: Piscina[]; editable: boolean }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState<string | null>(null);
  const listo = () => {
    setAbierto(null);
    router.refresh();
  };
  return (
    <Tarjeta titulo="Tarjetas de las piscinas" accion={editable && <button type="button" onClick={() => setAbierto("nueva")} className="btn btn-claro btn-chico"><Plus className="size-4" aria-hidden="true" /> Nueva piscina</button>}>
      {abierto === "nueva" && (
        <div className="mb-4 rounded-2xl bg-agua-50 p-4 ring-1 ring-agua-100">
          <FormPiscina onListo={listo} />
        </div>
      )}
      <ul className="grid gap-3">
        {piscinas.map((p) => (
          <li key={p.id} className="rounded-2xl ring-1 ring-mar-100">
            <div className="flex flex-wrap items-center gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imagen} alt="" className="size-14 rounded-xl object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-mar-900">{p.nombre}</span>
                <span className="text-sm text-mar-500">
                  {p.medidas} · {p.profundidad} · {p.temperatura}
                </span>
              </span>
              {editable && (
                <span className="flex items-center gap-1">
                  <BotonAccion accion={() => moverOrden("piscinas", p.id, -1)} className="grid size-9 place-items-center rounded-xl hover:bg-mar-50" onOk={() => router.refresh()}>
                    <ArrowUp className="size-4" aria-label="Subir" />
                  </BotonAccion>
                  <BotonAccion accion={() => moverOrden("piscinas", p.id, 1)} className="grid size-9 place-items-center rounded-xl hover:bg-mar-50" onOk={() => router.refresh()}>
                    <ArrowDown className="size-4" aria-label="Bajar" />
                  </BotonAccion>
                  <button type="button" onClick={() => setAbierto(abierto === p.id ? null : p.id)} className="btn btn-claro btn-chico">
                    Editar
                  </button>
                  <BotonAccion accion={() => eliminarElemento("piscinas", p.id)} confirmar={`¿Borrar la tarjeta de ${p.nombre}?`} className="grid size-9 place-items-center rounded-xl text-coral-700 hover:bg-coral-50" onOk={() => router.refresh()}>
                    <Trash2 className="size-4" aria-label="Borrar" />
                  </BotonAccion>
                </span>
              )}
            </div>
            {abierto === p.id && (
              <div className="border-t border-mar-100 p-4">
                <FormPiscina piscina={p} onListo={listo} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
