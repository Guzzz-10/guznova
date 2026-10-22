import Link from "next/link";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { FormularioSocio } from "@/components/admin/FormularioSocio";
import { Tarjeta } from "@/components/admin/ui";

export const metadata = { title: "Nuevo socio" };

export default async function NuevoSocio() {
  const { planes } = await obtenerContenido();
  return (
    <div className="grid gap-5">
      <div>
        <Link href="/admin/socios" className="text-sm font-semibold text-agua-700 hover:underline">
          ← Socios
        </Link>
        <h1 className="text-3xl font-bold text-mar-950">Nuevo socio</h1>
        <p className="text-mar-600">Para altas en recepción. El socio entra a Mi Carnet con un código que le llega por email.</p>
      </div>
      <Tarjeta>
        <FormularioSocio planes={planes} />
      </Tarjeta>
    </div>
  );
}
