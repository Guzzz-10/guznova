"use client";

import { useState } from "react";
import type { DatosNegocio } from "@/lib/contenido/tipos";
import { guardarBloque } from "@/lib/admin/acciones";
import { Tarjeta, useAccion } from "./ui";
import { SubirImagen } from "./SubirImagen";
import { PieGuardar, Texto } from "./contenido/comunes";

export function EditorNegocio({ inicial }: { inicial: DatosNegocio }) {
  const [n, setN] = useState(inicial);
  const { ejecutar, pendiente, resultado } = useAccion();
  const set = (c: Partial<DatosNegocio>) => setN((x) => ({ ...x, ...c }));
  return (
    <Tarjeta titulo="Datos del negocio">
      <div className="grid gap-4 sm:grid-cols-2">
        <Texto etiqueta="Nombre corto" valor={n.nombre} onCambio={(v) => set({ nombre: v })} ayuda="Aparece en el logo, el menú y el carnet." />
        <Texto etiqueta="Nombre completo" valor={n.nombreCompleto} onCambio={(v) => set({ nombreCompleto: v })} />
        <Texto etiqueta="Eslogan (debajo del logo)" valor={n.eslogan} onCambio={(v) => set({ eslogan: v })} />
        <Texto etiqueta="Año de fundación" type="number" valor={n.anioFundacion} onCambio={(v) => set({ anioFundacion: Number(v) })} />
        <Texto etiqueta="Descripción (Google y pie de página)" valor={n.descripcion} onCambio={(v) => set({ descripcion: v })} multilinea className="sm:col-span-2" />
        <SubirImagen valor={n.logoUrl} onCambio={(v) => set({ logoUrl: v })} carpeta="logo" etiqueta="Logo (cuadrado)" forma="aspect-square max-w-32" />
        <div />
        <Texto etiqueta="Dirección" valor={n.direccion} onCambio={(v) => set({ direccion: v })} />
        <Texto etiqueta="Ciudad" valor={n.ciudad} onCambio={(v) => set({ ciudad: v })} />
        <Texto etiqueta="Departamento" valor={n.departamento} onCambio={(v) => set({ departamento: v })} />
        <Texto etiqueta="Código postal" valor={n.codigoPostal} onCambio={(v) => set({ codigoPostal: v })} />
        <Texto etiqueta="Teléfono" valor={n.telefono} onCambio={(v) => set({ telefono: v })} />
        <Texto etiqueta="Email" type="email" valor={n.email} onCambio={(v) => set({ email: v })} />
        <Texto etiqueta="Instagram" valor={n.redes.instagram} onCambio={(v) => set({ redes: { ...n.redes, instagram: v } })} placeholder="https://www.instagram.com/…" />
        <Texto etiqueta="Facebook" valor={n.redes.facebook} onCambio={(v) => set({ redes: { ...n.redes, facebook: v } })} placeholder="https://www.facebook.com/…" />
        <Texto etiqueta="TikTok" valor={n.redes.tiktok} onCambio={(v) => set({ redes: { ...n.redes, tiktok: v } })} placeholder="https://www.tiktok.com/@…" />
        <div />
        <Texto
          etiqueta="Mapa de Google (insertar)"
          valor={n.mapa.embed}
          onCambio={(v) => set({ mapa: { ...n.mapa, embed: (v.match(/src="([^"]+)"/)?.[1] ?? v).trim() } })}
          ayuda="En Google Maps: Compartir → Insertar un mapa → copiá el código y pegalo acá."
          className="sm:col-span-2"
        />
        <Texto etiqueta="Enlace “Cómo llegar”" valor={n.mapa.enlace} onCambio={(v) => set({ mapa: { ...n.mapa, enlace: v } })} ayuda="En Google Maps: Compartir → Copiar enlace." className="sm:col-span-2" />
      </div>
      <div className="mt-5">
        <PieGuardar pendiente={pendiente} resultado={resultado} onGuardar={() => ejecutar(() => guardarBloque("negocio", n))} />
      </div>
    </Tarjeta>
  );
}
