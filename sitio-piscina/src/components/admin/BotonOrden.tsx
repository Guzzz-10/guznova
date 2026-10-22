"use client";

import { useRouter } from "next/navigation";
import { moverOrden } from "@/lib/admin/acciones";
import { BotonAccion } from "./ui";

export function BotonOrden({ tabla, id, direccion, children }: { tabla: "planes" | "piscinas" | "galeria" | "hitos" | "clases"; id: string; direccion: -1 | 1; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <BotonAccion accion={() => moverOrden(tabla, id, direccion)} className="grid size-9 place-items-center rounded-xl hover:bg-mar-50" onOk={() => router.refresh()}>
      {children}
    </BotonAccion>
  );
}
