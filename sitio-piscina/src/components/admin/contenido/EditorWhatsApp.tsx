"use client";

import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import type { ContenidoWhatsApp } from "@/lib/contenido/tipos";
import { guardarBloque } from "@/lib/admin/acciones";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { Tarjeta, useAccion } from "../ui";
import { PieGuardar, Texto } from "./comunes";

export function EditorWhatsApp({ inicial }: { inicial: ContenidoWhatsApp }) {
  const [w, setW] = useState(inicial);
  const { ejecutar, pendiente, resultado } = useAccion();
  const setTema = (i: number, c: Partial<ContenidoWhatsApp["temas"][number]>) => setW({ ...w, temas: w.temas.map((t, j) => (j === i ? { ...t, ...c } : t)) });
  return (
    <Tarjeta titulo="WhatsApp y mensajes pre-armados">
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto
            etiqueta="Número de WhatsApp"
            valor={w.numero}
            onCambio={(v) => setW({ ...w, numero: v })}
            inputMode="numeric"
            ayuda="Con código de país y sin el 0: ej. 59899123456 para el 099 123 456."
          />
          <div className="grid content-end">
            <a href={enlaceWhatsApp(w.numero, "¡Hola! Esto es una prueba desde el panel.")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-chico justify-self-start">
              <ExternalLink className="size-4" aria-hidden="true" /> Probar el número
            </a>
          </div>
        </div>
        <Texto etiqueta="Mensaje del botón principal y el botón flotante" valor={w.mensajeGeneral} onCambio={(v) => setW({ ...w, mensajeGeneral: v })} multilinea />
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-mar-800">Botones rápidos por tema</p>
          {w.temas.map((t, i) => (
            <div key={i} className="grid gap-2 rounded-2xl bg-mar-50 p-3 sm:grid-cols-[4rem_10rem_1fr_auto] sm:items-start">
              <input className="campo px-2 py-2 text-center" value={t.emoji} aria-label="Emoji" maxLength={4} onChange={(e) => setTema(i, { emoji: e.target.value })} />
              <input className="campo py-2" value={t.label} aria-label="Texto del botón" onChange={(e) => setTema(i, { label: e.target.value })} />
              <textarea className="campo py-2" rows={2} value={t.mensaje} aria-label="Mensaje" onChange={(e) => setTema(i, { mensaje: e.target.value })} />
              <button type="button" onClick={() => setW({ ...w, temas: w.temas.filter((_, j) => j !== i) })} className="grid size-10 place-items-center rounded-xl text-coral-700 hover:bg-coral-50" aria-label="Quitar tema">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {w.temas.length < 8 && (
            <button type="button" onClick={() => setW({ ...w, temas: [...w.temas, { emoji: "💬", label: "", mensaje: "¡Hola! " }] })} className="btn btn-claro btn-chico justify-self-start">
              <Plus className="size-4" aria-hidden="true" /> Agregar tema
            </button>
          )}
        </div>
      </div>
      <div className="mt-5">
        <PieGuardar pendiente={pendiente} resultado={resultado} onGuardar={() => ejecutar(() => guardarBloque("whatsapp", w))} />
      </div>
    </Tarjeta>
  );
}
