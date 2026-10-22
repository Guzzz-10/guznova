import Link from "next/link";
import type { Metadata } from "next";
import { modoDemo } from "@/lib/entorno";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { esClaimAdmin } from "@/lib/admin/auth";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { TarjetaResultado, type ResultadoIngreso } from "@/components/admin/Escaner";
import { LogoIcono } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Validar carnet", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Destino del QR del carnet. Si lo escanea el administrador (con su sesión),
 * valida el ingreso; cualquier otra persona solo ve un mensaje.
 */
export default async function ValidarCarnet({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { negocio, planes } = await obtenerContenido();
  const nombrePlan = (id: string) => planes.find((p) => p.id === id)?.nombre ?? id;

  let resultado: ResultadoIngreso | null = null;
  let foto: string | null = null;
  if (!modoDemo) {
    const supabase = await supabaseServidor();
    const { data } = await supabase.auth.getClaims();
    if (esClaimAdmin(data?.claims)) {
      const r = await supabase.rpc("validar_ingreso", { p_codigo: token });
      resultado = (r.data as ResultadoIngreso) ?? { resultado: "desconocido" };
      if (resultado.socio?.foto_path) foto = (await supabase.storage.from("fotos-socios").createSignedUrl(resultado.socio.foto_path, 600)).data?.signedUrl ?? null;
    }
  }

  return (
    <main id="contenido" className="grid min-h-screen place-items-center bg-mar-50 p-4">
      <div className="w-full max-w-xl">
        {resultado ? (
          <>
            <TarjetaResultado r={resultado} foto={foto} plan={resultado.socio ? nombrePlan(resultado.socio.plan) : ""} />
            <Link href="/admin/ingresos" className="btn btn-mar mt-4 w-full">
              Ir al escáner
            </Link>
          </>
        ) : (
          <div className="rounded-4xl bg-white p-8 text-center shadow-flotante">
            <LogoIcono className="mx-auto size-14" />
            <h1 className="mt-4 text-2xl font-bold text-mar-900">Carnet de socio de {negocio.nombre}</h1>
            <p className="mt-2 text-mar-600">Este código lo valida el personal en la entrada. Si sos el socio, mostralo desde Mi Carnet.</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/mi-carnet" className="btn btn-agua">
                Ir a Mi Carnet
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
