"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ContenidoHistoria, Hito } from "@/lib/contenido/tipos";
import { eliminarElemento, guardarBloque, guardarHito, moverOrden } from "@/lib/admin/acciones";
import { BotonAccion, Tarjeta, useAccion } from "../ui";
import { SubirImagen } from "../SubirImagen";
import { PieGuardar, Texto } from "./comunes";

export function EditorHistoriaTextos({ inicial }: { inicial: ContenidoHistoria }) {
  const [h, setH] = useState(inicial);
  const { ejecutar, pendiente, resultado } = useAccion();
  const setFrase = (c: Partial<ContenidoHistoria["frase"]>) => setH({ ...h, frase: { ...h.frase, ...c } });
  const setCont = (i: number, c: Partial<ContenidoHistoria["contadores"][number]>) => setH({ ...h, contadores: h.contadores.map((x, j) => (j === i ? { ...x, ...c } : x)) });
  return (
    <Tarjeta titulo="Textos de la historia">
      <div className="grid gap-4">
        <Texto etiqueta="Bajada (debajo del título)" valor={h.bajada} onCambio={(v) => setH({ ...h, bajada: v })} multilinea />
        <Texto etiqueta="Frase del fundador o del equipo" valor={h.frase.texto} onCambio={(v) => setFrase({ texto: v })} multilinea />
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Quién la dice" valor={h.frase.autor} onCambio={(v) => setFrase({ autor: v })} />
          <Texto etiqueta="Rol" valor={h.frase.rol} onCambio={(v) => setFrase({ rol: v })} />
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-mar-800">Contadores animados</p>
          {h.contadores.map((c, i) => (
            <div key={i} className="grid grid-cols-[4rem_1fr_2fr_auto] items-center gap-2">
              <input className="campo px-2 py-2 text-center" value={c.prefijo} maxLength={3} aria-label="Prefijo" placeholder="+" onChange={(e) => setCont(i, { prefijo: e.target.value })} />
              {c.valor === "anios" ? (
                <span className="rounded-2xl bg-agua-50 px-3 py-2 text-sm text-agua-800">Años desde la fundación (automático)</span>
              ) : (
                <input className="campo py-2" type="number" min={0} value={c.valor} aria-label="Número" onChange={(e) => setCont(i, { valor: Number(e.target.value) })} />
              )}
              <input className="campo py-2" value={c.label} aria-label="Texto" onChange={(e) => setCont(i, { label: e.target.value })} />
              <button type="button" onClick={() => setH({ ...h, contadores: h.contadores.filter((_, j) => j !== i) })} className="grid size-10 place-items-center rounded-xl text-coral-700 hover:bg-coral-50" aria-label="Quitar contador">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {h.contadores.length < 6 && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setH({ ...h, contadores: [...h.contadores, { valor: 0, prefijo: "", label: "" }] })} className="btn btn-claro btn-chico">
                <Plus className="size-4" aria-hidden="true" /> Contador
              </button>
              {!h.contadores.some((c) => c.valor === "anios") && (
                <button type="button" onClick={() => setH({ ...h, contadores: [...h.contadores, { valor: "anios", prefijo: "", label: "años de historia" }] })} className="btn btn-claro btn-chico">
                  <Plus className="size-4" aria-hidden="true" /> Años de historia
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-5">
        <PieGuardar pendiente={pendiente} resultado={resultado} onGuardar={() => ejecutar(() => guardarBloque("historia", h))} />
      </div>
    </Tarjeta>
  );
}

function FormHito({ hito, onListo }: { hito?: Hito; onListo: () => void }) {
  const [h, setH] = useState({
    id: hito?.id,
    anio: hito?.anio ?? new Date().getFullYear(),
    titulo: hito?.titulo ?? "",
    texto: hito?.texto ?? "",
    imagen: hito?.imagen ?? null,
    imagenAlt: hito?.imagenAlt ?? "",
    antigua: hito?.antigua ?? false,
  });
  const { ejecutar, pendiente, resultado } = useAccion();
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <Texto etiqueta="Año" type="number" valor={h.anio} onCambio={(v) => setH({ ...h, anio: Number(v) })} />
        <Texto etiqueta="Título" valor={h.titulo} onCambio={(v) => setH({ ...h, titulo: v })} />
      </div>
      <Texto etiqueta="Texto" valor={h.texto} onCambio={(v) => setH({ ...h, texto: v })} multilinea />
      <SubirImagen valor={h.imagen} onCambio={(v) => setH({ ...h, imagen: v })} carpeta="historia" etiqueta="Foto (opcional)" forma="aspect-[4/3]" />
      {h.imagen && (
        <>
          <Texto etiqueta="Descripción de la foto" valor={h.imagenAlt} onCambio={(v) => setH({ ...h, imagenAlt: v })} />
          <label className="flex items-center gap-2 text-sm font-semibold text-mar-800">
            <input type="checkbox" checked={h.antigua} onChange={(e) => setH({ ...h, antigua: e.target.checked })} className="size-4 accent-agua-600" /> Es una foto antigua (se muestra tipo polaroid)
          </label>
        </>
      )}
      <PieGuardar
        pendiente={pendiente}
        resultado={resultado}
        texto={hito ? "Guardar hito" : "Agregar hito"}
        onGuardar={() =>
          ejecutar(async () => {
            const r = await guardarHito(h);
            if (r?.ok) onListo();
            return r;
          })
        }
      />
    </div>
  );
}

export function EditorHitos({ hitos, editable }: { hitos: Hito[]; editable: boolean }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState<string | null>(null);
  return (
    <Tarjeta titulo="Línea de tiempo" accion={editable && <button type="button" onClick={() => setAbierto("nuevo")} className="btn btn-claro btn-chico"><Plus className="size-4" aria-hidden="true" /> Nuevo hito</button>}>
      {abierto === "nuevo" && (
        <div className="mb-4 rounded-2xl bg-agua-50 p-4 ring-1 ring-agua-100">
          <FormHito
            onListo={() => {
              setAbierto(null);
              router.refresh();
            }}
          />
        </div>
      )}
      <ol className="grid gap-2">
        {hitos.map((h) => (
          <li key={h.id} className="rounded-2xl ring-1 ring-mar-100">
            <div className="flex flex-wrap items-center gap-2 p-3">
              <span className="rounded-xl bg-agua-100 px-2.5 py-1 font-bold text-agua-800">{h.anio}</span>
              <span className="min-w-0 flex-1 truncate font-semibold text-mar-900">{h.titulo}</span>
              {editable && (
                <span className="flex items-center gap-1">
                  <BotonAccion accion={() => moverOrden("hitos", h.id, -1)} className="grid size-9 place-items-center rounded-xl hover:bg-mar-50" onOk={() => router.refresh()}>
                    <ArrowUp className="size-4" aria-label="Subir" />
                  </BotonAccion>
                  <BotonAccion accion={() => moverOrden("hitos", h.id, 1)} className="grid size-9 place-items-center rounded-xl hover:bg-mar-50" onOk={() => router.refresh()}>
                    <ArrowDown className="size-4" aria-label="Bajar" />
                  </BotonAccion>
                  <button type="button" onClick={() => setAbierto(abierto === h.id ? null : h.id)} className="btn btn-claro btn-chico">
                    Editar
                  </button>
                  <BotonAccion accion={() => eliminarElemento("hitos", h.id)} confirmar={`¿Borrar el hito ${h.anio}?`} className="grid size-9 place-items-center rounded-xl text-coral-700 hover:bg-coral-50" onOk={() => router.refresh()}>
                    <Trash2 className="size-4" aria-label="Borrar" />
                  </BotonAccion>
                </span>
              )}
            </div>
            {abierto === h.id && (
              <div className="border-t border-mar-100 p-4">
                <FormHito
                  hito={h}
                  onListo={() => {
                    setAbierto(null);
                    router.refresh();
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}
