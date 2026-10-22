import { Suspense } from "react";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { IngresoAdmin } from "@/components/admin/IngresoAdmin";

export const metadata = { title: "Ingresar" };

export default async function Ingresar() {
  const { negocio } = await obtenerContenido();
  return (
    <main id="contenido" className="grid min-h-screen place-items-center bg-gradient-to-br from-mar-900 via-mar-800 to-agua-800 p-4">
      <Suspense>
        <IngresoAdmin nombre={negocio.nombre} />
      </Suspense>
    </main>
  );
}
