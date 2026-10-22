"use client";

import Link from "next/link";
import { useState } from "react";
import type { Plan } from "@/lib/contenido/tipos";
import type { Socio } from "@/lib/socio/tipos";
import { guardarSocio } from "@/lib/admin/acciones";
import { precioUYU } from "@/lib/formato";
import { CampoPanel, FormularioAccion } from "./ui";
import { FotoSocioAdmin } from "./FotoSocioAdmin";

/** Alta manual o edición de los datos de un socio. */
export function FormularioSocio({ planes, socio }: { planes: Plan[]; socio?: Socio }) {
  const [creado, setCreado] = useState<string | null>(null);
  const [plan, setPlan] = useState(socio?.plan_id ?? planes[0]?.id ?? "");
  const [meses, setMeses] = useState(1);
  const [pagoInicial, setPagoInicial] = useState(true);
  const precio = planes.find((p) => p.id === plan)?.precio ?? 0;

  if (creado) {
    return (
      <div className="grid gap-4">
        <p className="rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-900 ring-1 ring-emerald-200">✅ Socio creado. Subí su foto tipo carnet para terminar.</p>
        <FotoSocioAdmin socioId={creado} />
        <Link href={`/admin/socios/${creado}`} className="btn btn-agua btn-chico justify-self-start">
          Ir a la ficha del socio
        </Link>
      </div>
    );
  }

  return (
    <FormularioAccion accion={guardarSocio} textoBoton={socio ? "Guardar cambios" : "Crear socio"} onOk={(r) => !socio && r?.id && setCreado(r.id)}>
      {socio && <input type="hidden" name="id" value={socio.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoPanel etiqueta="Nombre completo" className="sm:col-span-2">
          <input name="nombre" required defaultValue={socio?.nombre_completo} className="campo" autoComplete="off" />
        </CampoPanel>
        <CampoPanel etiqueta="Cédula" ayuda="Con dígito verificador, ej: 1.234.567-2">
          <input name="cedula" required defaultValue={socio?.cedula} className="campo" inputMode="numeric" />
        </CampoPanel>
        <CampoPanel etiqueta="Fecha de nacimiento">
          <input name="fechaNacimiento" type="date" required defaultValue={socio?.fecha_nacimiento} className="campo" />
        </CampoPanel>
        <CampoPanel etiqueta="Celular">
          <input name="telefono" type="tel" required defaultValue={socio?.telefono} className="campo" />
        </CampoPanel>
        <CampoPanel etiqueta="Email" ayuda={socio ? undefined : "Con este email entra a Mi Carnet (le llega un código)."}>
          <input name="email" type="email" required defaultValue={socio?.email} className="campo" />
        </CampoPanel>
        <CampoPanel etiqueta="Plan">
          <select name="plan" value={plan} onChange={(e) => setPlan(e.target.value)} className="campo">
            {planes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · {precioUYU(p.precio)}
              </option>
            ))}
          </select>
        </CampoPanel>
        <CampoPanel etiqueta="Notas internas (opcional)" className="sm:col-span-2">
          <textarea name="notas" rows={2} defaultValue={socio?.notas ?? ""} className="campo" />
        </CampoPanel>
      </div>

      {!socio && (
        <fieldset className="grid gap-3 rounded-2xl bg-agua-50 p-4 ring-1 ring-agua-100">
          <label className="flex items-center gap-2 font-semibold text-mar-900">
            <input type="checkbox" name="pagoInicial" checked={pagoInicial} onChange={(e) => setPagoInicial(e.target.checked)} className="size-5 accent-agua-600" />
            Registrar el primer pago ahora (efectivo o transferencia)
          </label>
          {pagoInicial && (
            <div className="grid gap-3 sm:grid-cols-3">
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
              <CampoPanel etiqueta="Monto ($)">
                <input key={`${plan}-${meses}`} name="monto" type="number" min={0} defaultValue={precio * meses} className="campo" />
              </CampoPanel>
            </div>
          )}
        </fieldset>
      )}
    </FormularioAccion>
  );
}
