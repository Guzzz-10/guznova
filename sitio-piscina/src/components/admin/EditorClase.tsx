"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Clase, Dia } from "@/lib/contenido/tipos";
import { grupos, tipos } from "@/content/clases";
import { dias } from "@/lib/dias";
import { eliminarClase, guardarClase } from "@/lib/admin/acciones";
import { BotonAccion, CampoPanel, FormularioAccion } from "./ui";
import { SubirImagen } from "./SubirImagen";

type FilaHorario = { id?: string; dia: Dia; hora: string; cupo: number; activo: boolean };

const iconos = [
  ["nadador", "🏊 Nadador"],
  ["olas", "🌊 Olas"],
  ["pato", "🐥 Patito"],
  ["bebe", "👶 Bebé"],
  ["pesa", "💪 Fuerza"],
  ["musica", "🎶 Música"],
  ["corazon", "💚 Salud"],
  ["reloj", "⏱️ Reloj"],
];
const colores = [
  ["agua", "Turquesa"],
  ["coral", "Coral"],
  ["sol", "Amarillo"],
  ["mar", "Azul"],
  ["lima", "Verde"],
  ["uva", "Violeta"],
];

export function EditorClase({ clase, piscinas }: { clase?: Clase; piscinas: string[] }) {
  const router = useRouter();
  const [horarios, setHorarios] = useState<FilaHorario[]>(clase?.horarios.map((h) => ({ id: h.id, dia: h.dia, hora: h.hora, cupo: h.cupo, activo: h.activo })) ?? []);
  const [foto, setFoto] = useState<string | null>(clase?.foto ?? null);
  const cambiar = (i: number, c: Partial<FilaHorario>) => setHorarios((hs) => hs.map((h, j) => (j === i ? { ...h, ...c } : h)));

  return (
    <div className="grid gap-6">
      <FormularioAccion
        accion={guardarClase}
        textoBoton={clase ? "Guardar clase" : "Crear clase"}
        onOk={(r) => {
          if (!clase && r?.id) router.replace(`/admin/clases/${r.id}`);
          else router.refresh();
        }}
      >
        {clase && <input type="hidden" name="id" value={clase.id} />}
        <input type="hidden" name="horarios" value={JSON.stringify(horarios)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoPanel etiqueta="Nombre" className="sm:col-span-2">
            <input name="nombre" required defaultValue={clase?.nombre} className="campo" />
          </CampoPanel>
          <CampoPanel etiqueta="Descripción" className="sm:col-span-2">
            <textarea name="descripcion" rows={2} defaultValue={clase?.descripcion} className="campo" />
          </CampoPanel>
          <CampoPanel etiqueta="Tipo">
            <select name="tipo" defaultValue={clase?.tipo ?? "natacion"} className="campo">
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </CampoPanel>
          <CampoPanel etiqueta="Profesor/a">
            <input name="profesor" defaultValue={clase?.profesor} className="campo" />
          </CampoPanel>
          <CampoPanel etiqueta="Nivel">
            <input name="nivel" defaultValue={clase?.nivel} className="campo" placeholder="Inicial, Intermedio…" />
          </CampoPanel>
          <CampoPanel etiqueta="Edad (texto)">
            <input name="edad" defaultValue={clase?.edad} className="campo" placeholder="Ej: 4 a 7 años" />
          </CampoPanel>
          <fieldset className="grid gap-1.5 sm:col-span-2">
            <legend className="mb-1 text-sm font-semibold text-mar-800">Grupos de edad (para el filtro)</legend>
            <div className="flex flex-wrap gap-3">
              {grupos.map((g) => (
                <label key={g.id} className="flex items-center gap-2 rounded-full bg-mar-50 px-3 py-1.5 text-sm">
                  <input type="checkbox" name="grupos" value={g.id} defaultChecked={clase?.grupos.includes(g.id)} className="size-4 accent-agua-600" /> {g.label}
                </label>
              ))}
            </div>
          </fieldset>
          <CampoPanel etiqueta="Duración">
            <input name="duracion" defaultValue={clase?.duracion} className="campo" placeholder="45 min" />
          </CampoPanel>
          <CampoPanel etiqueta="Precio mensual para no socios ($)" ayuda="0 = gratis para socios">
            <input name="precio" type="number" min={0} defaultValue={clase?.precio ?? 0} className="campo" />
          </CampoPanel>
          <CampoPanel etiqueta="Frecuencia">
            <input name="frecuencia" defaultValue={clase?.frecuencia} className="campo" placeholder="2 veces por semana" />
          </CampoPanel>
          <CampoPanel etiqueta="Incluida en (opcional)">
            <input name="incluida_en" defaultValue={clase?.incluidaEn} className="campo" placeholder="Plan Full" />
          </CampoPanel>
          <CampoPanel etiqueta="Piscina">
            <input name="piscina" list="lista-piscinas" defaultValue={clase?.piscina} className="campo" />
          </CampoPanel>
          <datalist id="lista-piscinas">
            {piscinas.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <CampoPanel etiqueta="Ícono">
            <select name="icono" defaultValue={clase?.icono ?? "nadador"} className="campo">
              {iconos.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </CampoPanel>
          <CampoPanel etiqueta="Color de la tarjeta">
            <select name="color" defaultValue={clase?.color ?? "agua"} className="campo">
              {colores.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </CampoPanel>
          <div className="sm:col-span-2">
            <SubirImagen valor={foto} onCambio={setFoto} carpeta="clases" etiqueta="Foto (opcional)" nombre="foto_url" />
          </div>
          <label className="flex items-center gap-2 font-semibold text-mar-800 sm:col-span-2">
            <input type="checkbox" name="activa" defaultChecked={clase?.activa ?? true} className="size-5 accent-agua-600" /> Clase visible en el sitio
          </label>
        </div>

        <fieldset className="grid gap-3 rounded-2xl bg-mar-50 p-4">
          <legend className="sr-only">Horarios y cupos</legend>
          <p className="font-bold text-mar-900">Horarios y cupos</p>
          {horarios.length === 0 && <p className="text-sm text-mar-600">Todavía no hay horarios. Agregá el primero.</p>}
          {horarios.map((h, i) => (
            <div key={h.id ?? `n${i}`} className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 ring-1 ring-mar-100 sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:items-end">
              <CampoPanel etiqueta="Día">
                <select value={h.dia} onChange={(e) => cambiar(i, { dia: e.target.value as Dia })} className="campo py-2">
                  {dias.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.largo}
                    </option>
                  ))}
                </select>
              </CampoPanel>
              <CampoPanel etiqueta="Hora">
                <input type="time" value={h.hora} onChange={(e) => cambiar(i, { hora: e.target.value })} className="campo py-2" />
              </CampoPanel>
              <CampoPanel etiqueta="Cupo">
                <input type="number" min={0} value={h.cupo} onChange={(e) => cambiar(i, { cupo: Number(e.target.value) })} className="campo py-2" />
              </CampoPanel>
              <label className="flex items-center gap-2 pb-2 text-sm font-semibold text-mar-800">
                <input type="checkbox" checked={h.activo} onChange={(e) => cambiar(i, { activo: e.target.checked })} className="size-4 accent-agua-600" /> Activo
              </label>
              <button type="button" onClick={() => setHorarios((hs) => hs.filter((_, j) => j !== i))} className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-coral-700 hover:bg-coral-50">
                <Trash2 className="size-4" aria-hidden="true" /> Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setHorarios((hs) => [...hs, { dia: hs.at(-1)?.dia ?? "lun", hora: "18:00", cupo: hs.at(-1)?.cupo ?? 10, activo: true }])}
            className="btn btn-claro btn-chico justify-self-start"
          >
            <Plus className="size-4" aria-hidden="true" /> Agregar horario
          </button>
          <p className="text-xs text-mar-500">Si quitás un horario que tiene reservas futuras, se desactiva en lugar de borrarse.</p>
        </fieldset>
      </FormularioAccion>

      {clase && (
        <div className="border-t border-dashed border-mar-200 pt-4">
          <BotonAccion
            accion={() => eliminarClase(clase.id)}
            confirmar={`¿Eliminar "${clase.nombre}"? Se borran también sus horarios y reservas. Si solo querés ocultarla, destildá "Clase visible".`}
            className="btn btn-claro btn-chico text-coral-700"
            onOk={() => router.replace("/admin/clases")}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Eliminar clase
          </BotonAccion>
        </div>
      )}
    </div>
  );
}
