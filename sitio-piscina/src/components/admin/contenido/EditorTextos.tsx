"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ContenidoContacto, ContenidoHero, DatosNegocio } from "@/lib/contenido/tipos";
import { guardarBloque } from "@/lib/admin/acciones";
import { ListaEditable, Tarjeta, useAccion } from "../ui";
import { SubirImagen } from "../SubirImagen";
import { PieGuardar, Texto } from "./comunes";

export function EditorHero({ inicial }: { inicial: ContenidoHero }) {
  const [h, setH] = useState(inicial);
  const { ejecutar, pendiente, resultado } = useAccion();
  const set = (c: Partial<ContenidoHero>) => setH((x) => ({ ...x, ...c }));
  return (
    <Tarjeta titulo="Portada (hero)">
      <div className="grid gap-4 sm:grid-cols-2">
        <Texto etiqueta="Etiqueta superior" valor={h.chip} onCambio={(v) => set({ chip: v })} ayuda="Se le agrega “en [ciudad]”." />
        <div />
        <Texto etiqueta="Título" valor={h.titulo} onCambio={(v) => set({ titulo: v })} />
        <Texto etiqueta="Palabra destacada (amarilla)" valor={h.destacado} onCambio={(v) => set({ destacado: v })} />
        <Texto etiqueta="Subtítulo" valor={h.subtitulo} onCambio={(v) => set({ subtitulo: v })} multilinea className="sm:col-span-2" />
        <div className="grid gap-1.5 sm:col-span-2">
          <span className="text-sm font-semibold text-mar-800">Datos destacados (debajo de los botones)</span>
          <ListaEditable valores={h.puntos} onCambio={(v) => set({ puntos: v })} max={6} placeholder="Ej: 🌡️ Agua a 28 °C" />
        </div>
        <SubirImagen valor={h.imagenUrl} onCambio={(v) => set({ imagenUrl: v ?? inicial.imagenUrl })} carpeta="hero" etiqueta="Foto de fondo" permitirQuitar={false} />
      </div>
      <div className="mt-5">
        <PieGuardar pendiente={pendiente} resultado={resultado} onGuardar={() => ejecutar(() => guardarBloque("hero", h))} />
      </div>
    </Tarjeta>
  );
}

export function EditorContacto({ inicial, negocio }: { inicial: ContenidoContacto; negocio: DatosNegocio }) {
  const [c, setC] = useState(inicial);
  const [horarios, setHorarios] = useState(negocio.horarios);
  const { ejecutar, pendiente, resultado } = useAccion();
  return (
    <Tarjeta titulo="Contacto y horarios de apertura">
      <div className="grid gap-4 sm:grid-cols-2">
        <Texto etiqueta="Título de la sección" valor={c.titulo} onCambio={(v) => setC({ ...c, titulo: v })} />
        <Texto etiqueta="Texto destacado" valor={c.destacado} onCambio={(v) => setC({ ...c, destacado: v })} />
        <Texto etiqueta="Bajada" valor={c.subtitulo} onCambio={(v) => setC({ ...c, subtitulo: v })} multilinea className="sm:col-span-2" />
      </div>
      <div className="mt-5 grid gap-2">
        <p className="text-sm font-semibold text-mar-800">Horarios de apertura (se muestran en el pie de página)</p>
        {horarios.map((h, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input className="campo py-2" value={h.dias} aria-label="Días" onChange={(e) => setHorarios(horarios.map((x, j) => (j === i ? { ...x, dias: e.target.value } : x)))} />
            <input className="campo py-2" value={h.horas} aria-label="Horario" onChange={(e) => setHorarios(horarios.map((x, j) => (j === i ? { ...x, horas: e.target.value } : x)))} />
            <button type="button" onClick={() => setHorarios(horarios.filter((_, j) => j !== i))} className="grid size-10 place-items-center rounded-xl text-coral-700 hover:bg-coral-50" aria-label="Quitar">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setHorarios([...horarios, { dias: "", horas: "" }])} className="btn btn-claro btn-chico justify-self-start">
          <Plus className="size-4" aria-hidden="true" /> Agregar fila
        </button>
      </div>
      <div className="mt-5">
        <PieGuardar
          pendiente={pendiente}
          resultado={resultado}
          onGuardar={() =>
            ejecutar(async () => {
              const r = await guardarBloque("contacto", c);
              if (!r?.ok) return r;
              return guardarBloque("negocio", { ...negocio, horarios: horarios.filter((h) => h.dias && h.horas) });
            })
          }
        />
      </div>
    </Tarjeta>
  );
}
