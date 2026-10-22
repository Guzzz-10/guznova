import { requerirAdmin } from "@/lib/admin/auth";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { Sidebar } from "@/components/admin/Sidebar";
import { Inactividad } from "@/components/admin/Inactividad";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Validación en el servidor: si no es el email autorizado (con Google), redirige al login.
  const admin = await requerirAdmin();
  const { negocio } = await obtenerContenido();
  return (
    <>
      <Sidebar nombre={negocio.nombre} email={admin.email} />
      <Inactividad />
      <div className="lg:pl-64">
        {admin.demo && (
          <p className="bg-sol-300 px-4 py-2 text-center text-sm font-semibold text-mar-950">
            🧪 Modo demo: datos ficticios y los cambios no se guardan. Configurá Supabase para usar el panel de verdad.
          </p>
        )}
        <main id="contenido" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </>
  );
}
