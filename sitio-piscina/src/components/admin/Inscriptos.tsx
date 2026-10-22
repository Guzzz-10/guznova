"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Horario } from "@/lib/contenido/tipos";
import type { Inscripto } from "@/lib/admin/tipos";
import { fechaCortaDia, nombreDia, proximaFecha } from "@/lib/dias";
import { formatoNumeroSocio } from "@/lib/formato";
import { cancelarReservaAdmin, moverReservaAdmin } from "@/lib/admin/acciones";
import { useAccion, MensajeResultado } from "./ui";

/** Quiénes están anotados en cada horario, con opción de cancelar o mover la reserva. */
export function Inscriptos({ horarios, inscriptos }: { horarios: Horario[]; inscriptos: Record<string, Inscripto[]> }) {
  const router = useRouter();
  const { ejecutar, pendiente, resultado } = useAccion();
  const [moviendo, setMoviendo] = useState<string | null>(null);
  const [destino, setDestino] = useState("");

  return (
    <div className="grid gap-4">
      <MensajeResultado resultado={resultado} />
      {horarios.map((h) => {
        const lista = inscriptos[h.id] ?? [];
        const proxima = proximaFecha(h.dia, h.hora);
        const enProxima = lista.filter((x) => x.fecha === proxima).length;
        return (
          <details key={h.id} className="rounded-2xl bg-white ring-1 ring-mar-100" open={lista.length > 0 && lista.length < 15}>
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-4">
              <span className="font-semibold text-mar-900">
                {nombreDia(h.dia)} {h.hora} {!h.activo && <span className="text-sm text-mar-400">(inactivo)</span>}
              </span>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${enProxima >= h.cupo ? "bg-coral-100 text-coral-800" : "bg-agua-50 text-agua-800"}`}>
                {fechaCortaDia(proxima)}: {enProxima}/{h.cupo} {enProxima >= h.cupo ? "· completo" : ""}
              </span>
            </summary>
            {lista.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-mar-500">Nadie anotado todavía.</p>
            ) : (
              <ul className="divide-y divide-mar-50 px-4 pb-2 text-sm">
                {lista.map((x) => (
                  <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      <span className="font-semibold text-mar-900">{x.nombre}</span>
                      <span className="text-mar-500">
                        {" "}
                        · N.º {formatoNumeroSocio(x.numero)} · {fechaCortaDia(x.fecha)} · {x.telefono}
                      </span>
                    </span>
                    {moviendo === x.id ? (
                      <span className="flex flex-wrap items-center gap-2">
                        <select value={destino} onChange={(e) => setDestino(e.target.value)} className="campo py-1.5 text-sm" aria-label="Mover a">
                          <option value="">Mover a…</option>
                          {horarios
                            .filter((o) => o.id !== h.id && o.activo)
                            .map((o) => (
                              <option key={o.id} value={o.id}>
                                {nombreDia(o.dia)} {fechaCortaDia(proximaFecha(o.dia, o.hora))} {o.hora}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          disabled={!destino || pendiente}
                          className="btn btn-agua btn-chico py-1.5"
                          onClick={() => {
                            const o = horarios.find((z) => z.id === destino);
                            if (!o) return;
                            ejecutar(async () => {
                              const r = await moverReservaAdmin(x.id, o.id, proximaFecha(o.dia, o.hora));
                              if (r?.ok) {
                                setMoviendo(null);
                                router.refresh();
                              }
                              return r;
                            });
                          }}
                        >
                          Mover
                        </button>
                        <button type="button" onClick={() => setMoviendo(null)} className="text-sm font-semibold text-mar-500">
                          Cancelar
                        </button>
                      </span>
                    ) : (
                      <span className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setMoviendo(x.id);
                            setDestino("");
                          }}
                          className="font-semibold text-agua-700 hover:underline"
                        >
                          Mover
                        </button>
                        <button
                          type="button"
                          disabled={pendiente}
                          onClick={() =>
                            ejecutar(async () => {
                              const r = await cancelarReservaAdmin(x.id);
                              if (r?.ok) router.refresh();
                              return r;
                            }, `¿Cancelar la reserva de ${x.nombre}?`)
                          }
                          className="font-semibold text-coral-700 hover:underline"
                        >
                          Cancelar
                        </button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </details>
        );
      })}
    </div>
  );
}
