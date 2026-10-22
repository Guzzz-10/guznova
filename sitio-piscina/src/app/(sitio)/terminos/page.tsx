import type { Metadata } from "next";
import Link from "next/link";
import { obtenerContenido } from "@/lib/contenido/obtener";

export const metadata: Metadata = { title: "Términos y condiciones", alternates: { canonical: "/terminos" } };

export default async function Terminos() {
  const { negocio: n } = await obtenerContenido();
  return (
    <article className="contenedor max-w-3xl pt-28 pb-36">
      <h1 className="titulo-seccion text-mar-900">Términos y condiciones</h1>
      <p className="mt-2 text-mar-600">
        {n.nombreCompleto} · {n.ciudad}, {n.pais}. Este texto es un modelo: revisalo con tu asesor antes de publicarlo.
      </p>
      <div className="mt-8 grid gap-6 text-mar-800 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-mar-900 [&_li]:ml-5 [&_li]:list-disc">
        <section>
          <h2>1. La suscripción</h2>
          <p>La membresía es mensual, personal e intransferible. Cada plan incluye los beneficios que se detallan en el sitio al momento de contratarlo.</p>
        </section>
        <section>
          <h2>2. Pagos y renovación</h2>
          <ul>
            <li>Los pagos online se procesan con Mercado Pago. {n.nombre} no recibe ni guarda los datos de tu tarjeta.</li>
            <li>Con débito automático, Mercado Pago cobra el precio del plan cada mes. Podés cancelarlo en cualquier momento desde Mi Carnet o desde tu cuenta de Mercado Pago; tu plan sigue vigente hasta la fecha de vencimiento.</li>
            <li>Si un pago no se acredita, la membresía pasa a estado “vencido” hasta que se regularice.</li>
            <li>Los precios pueden actualizarse; te avisaremos con anticipación.</li>
          </ul>
        </section>
        <section>
          <h2>3. Carnet digital e ingreso</h2>
          <ul>
            <li>Para ingresar tenés que mostrar tu carnet digital con el código QR. El personal puede pedirte tu cédula para verificar tu identidad.</li>
            <li>Prestar el carnet o el QR a otra persona puede implicar la suspensión de la membresía.</li>
            <li>Si perdés el celular o creés que alguien vio tu QR, generá uno nuevo desde Mi Carnet.</li>
          </ul>
        </section>
        <section>
          <h2>4. Clases y reservas</h2>
          <p>Las reservas de clases están sujetas a cupo. Si no podés asistir, cancelá tu reserva para liberar el lugar. Los horarios pueden modificarse por razones operativas.</p>
        </section>
        <section>
          <h2>5. Normas de uso</h2>
          <ul>
            <li>Respetá las normas de higiene (ducha previa, gorra si corresponde) y las indicaciones de los guardavidas y profesores.</li>
            <li>Los menores de edad deben ingresar acompañados según lo indique el reglamento interno.</li>
            <li>{n.nombre} puede suspender el acceso ante conductas que pongan en riesgo a otras personas.</li>
          </ul>
        </section>
        <section>
          <h2>6. Contacto</h2>
          <p>
            Por cualquier consulta escribinos a <a href={`mailto:${n.email}`} className="font-semibold text-agua-700 underline">{n.email}</a> o llamanos al {n.telefono}. Mirá también nuestra{" "}
            <Link href="/privacidad" className="font-semibold text-agua-700 underline">
              política de privacidad
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
