"use client";

import { useRouter } from "next/navigation";
import { Ban, QrCode, RotateCcw, Trash2 } from "lucide-react";
import { cambiarSuspension, eliminarSocio, regenerarQRSocio, cancelarReservaAdmin } from "@/lib/admin/acciones";
import { BotonAccion } from "./ui";

export function AccionesSocio({ id, nombre, suspendido, tieneCarnet }: { id: string; nombre: string; suspendido: boolean; tieneCarnet: boolean }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      <BotonAccion
        accion={() => cambiarSuspension(id, !suspendido)}
        confirmar={suspendido ? `¿Reactivar a ${nombre}?` : `¿Suspender a ${nombre}? No va a poder entrar aunque tenga el plan al día.`}
        onOk={() => router.refresh()}
      >
        {suspendido ? <RotateCcw className="size-4" aria-hidden="true" /> : <Ban className="size-4" aria-hidden="true" />} {suspendido ? "Reactivar" : "Suspender"}
      </BotonAccion>
      {tieneCarnet && (
        <BotonAccion accion={() => regenerarQRSocio(id)} confirmar="El QR actual va a dejar de funcionar. ¿Generar uno nuevo?" onOk={() => router.refresh()}>
          <QrCode className="size-4" aria-hidden="true" /> Nuevo QR
        </BotonAccion>
      )}
      <BotonAccion
        accion={() => eliminarSocio(id)}
        confirmar={`¿Eliminar a ${nombre} para siempre? Se borran su cuenta, foto y reservas. Los pagos quedan en el historial.`}
        className="btn btn-claro btn-chico text-coral-700"
        onOk={() => router.replace("/admin/socios")}
      >
        <Trash2 className="size-4" aria-hidden="true" /> Eliminar
      </BotonAccion>
    </div>
  );
}

export function CancelarReserva({ id }: { id: string }) {
  const router = useRouter();
  return (
    <BotonAccion accion={() => cancelarReservaAdmin(id)} confirmar="¿Cancelar esta reserva?" className="text-sm font-semibold text-coral-700 hover:underline" onOk={() => router.refresh()}>
      Cancelar
    </BotonAccion>
  );
}
