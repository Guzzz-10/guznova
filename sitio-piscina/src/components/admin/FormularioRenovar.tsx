"use client";

import { useState } from "react";
import type { Plan } from "@/lib/contenido/tipos";
import { renovarSocio } from "@/lib/admin/acciones";
import { precioUYU } from "@/lib/formato";
import { CampoPanel, FormularioAccion } from "./ui";

/** Renovación manual / pago en efectivo o transferencia. */
export function FormularioRenovar({ socioId, planes, planActual }: { socioId: string; planes: Plan[]; planActual: string }) {
  const [plan, setPlan] = useState(planes.some((p) => p.id === planActual) ? planActual : (planes[0]?.id ?? ""));
  const [meses, setMeses] = useState(1);
  const precio = planes.find((p) => p.id === plan)?.precio ?? 0;
  return (
    <FormularioAccion accion={renovarSocio} textoBoton="Registrar pago y renovar">
      <input type="hidden" name="socio" value={socioId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoPanel etiqueta="Plan">
          <select name="plan" value={plan} onChange={(e) => setPlan(e.target.value)} className="campo">
            {planes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · {precioUYU(p.precio)}
              </option>
            ))}
          </select>
        </CampoPanel>
        <CampoPanel etiqueta="Meses">
          <select name="meses" value={meses} onChange={(e) => setMeses(Number(e.target.value))} className="campo">
            {[1, 2, 3, 6, 12].map((m) => (
              <option key={m} value={m}>
                {m} {m === 1 ? "mes" : "meses"}
              </option>
            ))}
          </select>
        </CampoPanel>
        <CampoPanel etiqueta="Método">
          <select name="metodo" className="campo">
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </CampoPanel>
        <CampoPanel etiqueta="Monto cobrado ($)">
          <input key={`${plan}-${meses}`} name="monto" type="number" min={0} defaultValue={precio * meses} className="campo" />
        </CampoPanel>
        <CampoPanel etiqueta="Detalle (opcional)" className="sm:col-span-2">
          <input name="detalle" placeholder="Ej: pagó en recepción, transferencia BROU…" className="campo" />
        </CampoPanel>
      </div>
      <p className="text-sm text-mar-500">El vencimiento se extiende desde la fecha actual de vencimiento (o desde hoy si ya venció).</p>
    </FormularioAccion>
  );
}
