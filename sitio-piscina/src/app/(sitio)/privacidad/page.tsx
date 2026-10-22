import type { Metadata } from "next";
import { obtenerContenido } from "@/lib/contenido/obtener";

export const metadata: Metadata = { title: "Política de privacidad", alternates: { canonical: "/privacidad" } };

export default async function Privacidad() {
  const { negocio: n } = await obtenerContenido();
  return (
    <article className="contenedor max-w-3xl pt-28 pb-36">
      <h1 className="titulo-seccion text-mar-900">Política de privacidad</h1>
      <p className="mt-2 text-mar-600">Cómo cuidamos tus datos personales, de acuerdo con la Ley N.º 18.331 de Protección de Datos Personales de Uruguay. Este texto es un modelo: revisalo con tu asesor.</p>
      <div className="mt-8 grid gap-6 text-mar-800 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-mar-900 [&_li]:ml-5 [&_li]:list-disc">
        <section>
          <h2>Qué datos guardamos</h2>
          <ul>
            <li>Nombre completo, cédula de identidad, fecha de nacimiento, teléfono y email.</li>
            <li>Tu foto tipo carnet, para verificar tu identidad en la entrada.</li>
            <li>Tu plan, pagos, reservas de clases e ingresos al local.</li>
          </ul>
        </section>
        <section>
          <h2>Para qué los usamos</h2>
          <p>Solo para gestionar tu membresía: generar tu carnet, validar tu ingreso, administrar tus reservas y pagos y comunicarnos con vos sobre tu suscripción.</p>
        </section>
        <section>
          <h2>Quién puede verlos</h2>
          <ul>
            <li>Vos, desde Mi Carnet.</li>
            <li>La administración de {n.nombreCompleto}, desde un panel privado protegido.</li>
            <li>Mercado Pago procesa tus pagos según su propia política de privacidad. No compartimos ni vendemos tus datos a terceros.</li>
          </ul>
        </section>
        <section>
          <h2>Cómo los protegemos</h2>
          <p>Los datos se guardan en servidores con cifrado y reglas de acceso estrictas: cada socio solo puede ver su propia información y tu foto se guarda en un almacenamiento privado.</p>
        </section>
        <section>
          <h2>Tus derechos</h2>
          <p>
            Podés pedir acceder, rectificar, actualizar o eliminar tus datos en cualquier momento escribiendo a{" "}
            <a href={`mailto:${n.email}`} className="font-semibold text-agua-700 underline">
              {n.email}
            </a>
            . Responsable de la base de datos: {n.nombreCompleto}, {n.direccion}, {n.ciudad}.
          </p>
        </section>
      </div>
    </article>
  );
}
