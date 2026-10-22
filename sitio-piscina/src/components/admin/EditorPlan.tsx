"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, Star, Trash2 } from "lucide-react";
import type { Plan } from "@/lib/contenido/tipos";
import { alternarActivo, eliminarPlan, guardarPlan, moverOrden } from "@/lib/admin/acciones";
import { precioUYU } from "@/lib/formato";
import { BotonAccion, CampoPanel, FormularioAccion, ListaEditable } from "./ui";

function CamposPlan({ plan }: { plan?: Plan }) {
  const [incluye, setIncluye] = useState(plan?.incluye ?? []);
  return (
    <>
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoPanel etiqueta="Nombre del plan">
          <input name="nombre" required defaultValue={plan?.nombre} className="campo" />
        </CampoPanel>
        <CampoPanel etiqueta="Precio mensual ($ UYU)">
          <input name="precio" type="number" min={1} step={1} required defaultValue={plan?.precio} className="campo" />
        </CampoPanel>
        <CampoPanel etiqueta="Frase corta" className="sm:col-span-2">
          <input name="bajada" defaultValue={plan?.bajada} className="campo" placeholder="Ej: Para nadar a tu ritmo" />
        </CampoPanel>
        <CampoPanel etiqueta="Etiqueta destacada (opcional)" ayuda="Ej: El más elegido">
          <input name="etiqueta" defaultValue={plan?.etiqueta ?? ""} className="campo" />
        </CampoPanel>
        <CampoPanel etiqueta="Color">
          <select name="color" defaultValue={plan?.color ?? "agua"} className="campo">
            <option value="agua">Turquesa</option>
            <option value="coral">Coral</option>
            <option value="sol">Amarillo sol</option>
          </select>
        </CampoPanel>
      </div>
      <div className="grid gap-1.5">
        <span className="text-sm font-semibold text-mar-800">Qué incluye</span>
        <ListaEditable nombre="incluye" valores={incluye} onCambio={setIncluye} placeholder="Ej: Acceso libre a las piscinas" />
      </div>
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 font-semibold text-mar-800">
          <input type="checkbox" name="destacado" defaultChecked={plan?.destacado} className="size-5 accent-agua-600" /> Plan recomendado (resaltado)
        </label>
        <label className="flex items-center gap-2 font-semibold text-mar-800">
          <input type="checkbox" name="activo" defaultChecked={plan?.activo ?? true} className="size-5 accent-agua-600" /> Visible y contratable
        </label>
      </div>
    </>
  );
}

export function EditorPlan({ plan, editable }: { plan: Plan; editable: boolean }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  return (
    <li className={`rounded-3xl bg-white shadow-suave ring-1 ${plan.activo ? "ring-mar-100" : "opacity-70 ring-mar-100"}`}>
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-lg font-bold text-mar-900">
            {plan.nombre}
            {plan.destacado && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sol-100 px-2 py-0.5 text-xs text-sol-900">
                <Star className="size-3" aria-hidden="true" /> Recomendado
              </span>
            )}
            {!plan.activo && <span className="rounded-full bg-mar-100 px-2 py-0.5 text-xs text-mar-700">Oculto</span>}
          </p>
          <p className="text-mar-600">
            {precioUYU(plan.precio)} /mes · {plan.incluye.length} beneficios
          </p>
        </div>
        {editable && (
          <div className="flex flex-wrap items-center gap-1">
            <BotonAccion accion={() => moverOrden("planes", plan.id, -1)} className="grid size-9 place-items-center rounded-xl hover:bg-mar-50" onOk={() => router.refresh()}>
              <ArrowUp className="size-4" aria-label="Subir" />
            </BotonAccion>
            <BotonAccion accion={() => moverOrden("planes", plan.id, 1)} className="grid size-9 place-items-center rounded-xl hover:bg-mar-50" onOk={() => router.refresh()}>
              <ArrowDown className="size-4" aria-label="Bajar" />
            </BotonAccion>
            <BotonAccion accion={() => alternarActivo("planes", plan.id, !plan.activo)} className="btn btn-claro btn-chico" onOk={() => router.refresh()}>
              {plan.activo ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />} {plan.activo ? "Ocultar" : "Mostrar"}
            </BotonAccion>
            <button type="button" onClick={() => setAbierto((a) => !a)} aria-expanded={abierto} className="btn btn-agua btn-chico">
              Editar <ChevronDown className={`size-4 transition ${abierto ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      {abierto && (
        <div className="border-t border-mar-100 p-4 sm:p-5">
          <FormularioAccion accion={guardarPlan} textoBoton="Guardar plan" onOk={() => router.refresh()}>
            <CamposPlan plan={plan} />
          </FormularioAccion>
          <div className="mt-4 border-t border-dashed border-mar-100 pt-4">
            <BotonAccion
              accion={() => eliminarPlan(plan.id)}
              confirmar={`¿Eliminar el ${plan.nombre}? Si hay socios con este plan, mejor ocultalo.`}
              className="btn btn-claro btn-chico text-coral-700"
              onOk={() => router.refresh()}
            >
              <Trash2 className="size-4" aria-hidden="true" /> Eliminar plan
            </BotonAccion>
          </div>
        </div>
      )}
    </li>
  );
}

export function NuevoPlan() {
  const router = useRouter();
  const [clave, setClave] = useState(0);
  return (
    <FormularioAccion
      key={clave}
      accion={guardarPlan}
      textoBoton="Crear plan"
      onOk={() => {
        setClave((c) => c + 1);
        router.refresh();
      }}
    >
      <CamposPlan />
    </FormularioAccion>
  );
}
