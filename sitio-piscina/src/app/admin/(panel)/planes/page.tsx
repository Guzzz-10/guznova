import { obtenerContenido } from "@/lib/contenido/obtener";
import { modoDemo } from "@/lib/entorno";
import { BannerEjemplo } from "@/components/admin/BannerEjemplo";
import { EditorPlan, NuevoPlan } from "@/components/admin/EditorPlan";
import { Tarjeta } from "@/components/admin/ui";

export const metadata = { title: "Planes" };

export default async function Planes() {
  const { planes, origen } = await obtenerContenido();
  const editable = origen.planes === "db" || modoDemo;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-mar-950">Planes de suscripción</h1>
        <p className="text-mar-600">Los cambios se ven al instante en el sitio. El precio que cobra Mercado Pago sale de acá.</p>
      </div>
      {!editable && <BannerEjemplo texto="Estos son los planes de ejemplo. Cargalos en la base para poder editarlos." />}
      <ul className="grid gap-3">
        {planes.map((p) => (
          <EditorPlan key={p.id} plan={p} editable={editable} />
        ))}
      </ul>
      {editable && (
        <Tarjeta titulo="Nuevo plan">
          <NuevoPlan />
        </Tarjeta>
      )}
    </div>
  );
}
