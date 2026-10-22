import { ShieldCheck } from "lucide-react";
import { requerirAdmin } from "@/lib/admin/auth";
import { listarActividad } from "@/lib/admin/datos";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { credencialesMP } from "@/lib/pagos/mercadopago";
import { urlSitio } from "@/config/sitio";
import { MINUTOS_INACTIVIDAD_ADMIN, modoDemo } from "@/lib/entorno";
import { fechaYHora } from "@/lib/formato";
import { EditorNegocio } from "@/components/admin/EditorNegocio";
import { ConexionMP } from "@/components/admin/ConexionMP";
import { Tarjeta } from "@/components/admin/ui";

export const metadata = { title: "Configuración" };

export default async function Configuracion() {
  const admin = await requerirAdmin();
  const [{ negocio }, actividad, mp] = await Promise.all([
    obtenerContenido(),
    listarActividad(100),
    modoDemo ? Promise.resolve({ accessToken: "", webhookSecret: "", origen: null }) : credencialesMP(),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-mar-950">Configuración</h1>
        <p className="text-mar-600">Datos del negocio, conexión con Mercado Pago y registro de actividad.</p>
      </div>

      <EditorNegocio inicial={negocio} />

      <Tarjeta titulo="Mercado Pago">
        <ConexionMP webhook={`${urlSitio}/api/mercadopago/webhook`} origen={mp.origen} conSecreto={Boolean(mp.webhookSecret)} />
      </Tarjeta>

      <Tarjeta titulo="Seguridad del panel">
        <ul className="grid gap-2 text-mar-700">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>
              Solo puede entrar <strong className="text-mar-900">{admin.email}</strong> iniciando sesión con Google. Se verifica en el servidor y en las reglas de la base de datos.
            </span>
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>La sesión se cierra sola después de {MINUTOS_INACTIVIDAD_ADMIN} minutos sin actividad.</span>
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>Las fotos y cédulas de los socios son privadas: solo las ve cada socio y este panel.</span>
          </li>
        </ul>
        <p className="mt-3 text-sm text-mar-500">Para cambiar el email autorizado, modificá la variable ADMIN_EMAIL en el hosting y volvé a ingresar.</p>
      </Tarjeta>

      <Tarjeta titulo="Registro de actividad">
        {actividad.length === 0 ? (
          <p className="text-mar-600">Todavía no hay actividad registrada.</p>
        ) : (
          <ol className="max-h-[32rem] divide-y divide-mar-50 overflow-y-auto text-sm">
            {actividad.map((a) => (
              <li key={a.id} className="grid gap-0.5 py-2.5 sm:grid-cols-[9rem_1fr]">
                <span className="text-mar-500 tabular-nums">{fechaYHora(a.creado_el)}</span>
                <span>
                  <span className="font-semibold text-mar-900">{a.accion}</span>
                  {a.detalle && <span className="text-mar-600"> · {a.detalle}</span>}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Tarjeta>
    </div>
  );
}
