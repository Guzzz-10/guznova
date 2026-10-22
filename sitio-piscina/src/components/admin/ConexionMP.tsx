"use client";

import { useState } from "react";
import { Check, Copy, PlugZap } from "lucide-react";
import { guardarCredencialesMP, probarMercadoPago } from "@/lib/admin/acciones";
import { BotonAccion, CampoPanel, FormularioAccion } from "./ui";

export function ConexionMP({ webhook, origen, conSecreto }: { webhook: string; origen: "entorno" | "panel" | null; conSecreto: boolean }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="grid gap-5">
      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-mar-50 p-3">
          <dt className="text-sm text-mar-500">Access Token</dt>
          <dd className="font-semibold text-mar-900">{origen ? `✓ Cargado (${origen === "entorno" ? "variable de entorno" : "desde el panel"})` : "✕ Falta"}</dd>
        </div>
        <div className="rounded-2xl bg-mar-50 p-3">
          <dt className="text-sm text-mar-500">Clave secreta del webhook</dt>
          <dd className="font-semibold text-mar-900">{conSecreto ? "✓ Cargada" : "✕ Falta (recomendada)"}</dd>
        </div>
        <div className="rounded-2xl bg-mar-50 p-3">
          <dt className="text-sm text-mar-500">Probar</dt>
          <dd>
            <BotonAccion accion={probarMercadoPago} className="btn btn-claro btn-chico">
              <PlugZap className="size-4" aria-hidden="true" /> Probar conexión
            </BotonAccion>
          </dd>
        </div>
      </dl>

      <div className="grid gap-2">
        <p className="text-sm font-semibold text-mar-800">URL para las notificaciones (Webhooks)</p>
        <div className="flex gap-2">
          <code className="min-w-0 flex-1 truncate rounded-2xl bg-mar-950 px-4 py-3 text-sm text-agua-200">{webhook}</code>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(webhook);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2000);
            }}
            className="btn btn-claro btn-chico shrink-0"
          >
            {copiado ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />} {copiado ? "Copiada" : "Copiar"}
          </button>
        </div>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-mar-600">
          <li>Entrá a mercadopago.com.uy/developers → Tus integraciones → tu aplicación.</li>
          <li>En “Webhooks” pegá esta URL y marcá los eventos “Pagos” y “Planes y suscripciones”.</li>
          <li>Copiá la “clave secreta” que te muestra y pegala abajo, junto con el Access Token de producción.</li>
        </ol>
      </div>

      {origen !== "entorno" && (
        <FormularioAccion accion={guardarCredencialesMP} textoBoton="Guardar credenciales">
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoPanel etiqueta="Access Token" ayuda="Empieza con APP_USR- (producción) o TEST- (pruebas).">
              <input name="token" type="password" autoComplete="off" className="campo" placeholder={origen ? "•••••••• (dejalo vacío para no cambiarlo)" : "APP_USR-…"} />
            </CampoPanel>
            <CampoPanel etiqueta="Clave secreta del webhook">
              <input name="secreto" type="password" autoComplete="off" className="campo" placeholder={conSecreto ? "•••••••• (dejala vacía para no cambiarla)" : ""} />
            </CampoPanel>
          </div>
          <p className="text-xs text-mar-500">Se guardan en una tabla protegida que solo el servidor puede leer. Nunca se muestran de nuevo.</p>
        </FormularioAccion>
      )}
    </div>
  );
}
