"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { asignarFotoSocio } from "@/lib/admin/acciones";
import { PasoFoto } from "@/components/alta/PasoFoto";
import { dataUrlABlob } from "@/components/alta/recorte";
import { MensajeResultado } from "./ui";
import type { Resultado } from "@/lib/admin/tipos";

/** Sacar o subir la foto tipo carnet de un socio desde recepción (se guarda privada). */
export function FotoSocioAdmin({ socioId }: { socioId: string }) {
  const router = useRouter();
  const [foto, setFoto] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState<Resultado>(null);

  const guardar = async () => {
    if (!foto) return;
    if (modoDemo) return setResultado({ ok: false, mensaje: "Modo demo: la foto no se guarda." });
    setGuardando(true);
    try {
      const ruta = `${socioId}/foto-${Date.now()}.jpg`;
      const { error } = await supabaseNavegador().storage.from("fotos-socios").upload(ruta, await dataUrlABlob(foto), { contentType: "image/jpeg" });
      if (error) throw error;
      const r = await asignarFotoSocio(socioId, ruta);
      setResultado(r);
      if (r?.ok) {
        setFoto(null);
        router.refresh();
      }
    } catch {
      setResultado({ ok: false, mensaje: "No se pudo subir la foto." });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="grid gap-3">
      <PasoFoto foto={foto} onFoto={setFoto} />
      {foto && (
        <button type="button" onClick={guardar} disabled={guardando} className="btn btn-agua btn-chico justify-self-center">
          {guardando && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />} Guardar foto
        </button>
      )}
      <MensajeResultado resultado={resultado} />
    </div>
  );
}
