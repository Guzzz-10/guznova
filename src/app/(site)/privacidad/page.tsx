/*
 * ⚠️ PLANTILLA LEGAL: este texto es un modelo basado en la Ley N° 18.331 de Protección
 * de Datos Personales y su Decreto reglamentario N° 414/009. Debe ser revisado por un
 * profesional antes de su publicación. Recordá también evaluar la inscripción de las
 * bases de datos ante la URCDP.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Cómo tratamos tus datos personales según la Ley N° 18.331 de Protección de Datos Personales de Uruguay.",
  alternates: { canonical: "/privacidad" },
};

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <LegalPage
      title="Política de Privacidad"
      description="Cómo recogemos, usamos y protegemos tus datos personales, de acuerdo con la Ley N° 18.331 de Protección de Datos Personales."
    >
      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable de la base de datos es <strong>{s.legalName}</strong>, RUT <strong>{s.rut}</strong>, que opera comercialmente como{" "}
        <strong>{s.businessName}</strong>, con domicilio en {s.address}, {s.city}, Uruguay. Podés contactarnos en{" "}
        {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : "nuestros canales de contacto"}
        {s.phone ? ` o al teléfono ${s.phone}` : ""}.
      </p>

      <h2>2. Marco legal</h2>
      <p>
        Tratamos tus datos conforme a la Ley N° 18.331 de Protección de Datos Personales y Acción de Habeas Data, y a su Decreto
        reglamentario N° 414/009, aplicando los principios de legalidad, veracidad, finalidad, previo consentimiento informado,
        seguridad de los datos, reserva y responsabilidad.
      </p>

      <h2>3. Qué datos recogemos</h2>
      <ul>
        <li>
          <strong>Reseñas:</strong> nombre, calificación y comentario que ingresás voluntariamente en el formulario de reseñas.
        </li>
        <li>
          <strong>Datos técnicos de seguridad:</strong> una versión cifrada (hash) de tu dirección IP al enviar una reseña, usada
          únicamente para prevenir spam y abusos. No guardamos la IP en claro.
        </li>
        <li>
          <strong>Consultas por WhatsApp:</strong> si nos escribís por WhatsApp, recibimos tu número y los mensajes que nos envíes.
          Ese servicio es prestado por WhatsApp (Meta Platforms), que tiene su propia política de privacidad.
        </li>
        <li>
          <strong>Cookies:</strong> según lo detallado en nuestra <Link href="/cookies">Política de Cookies</Link>.
        </li>
      </ul>
      <p>No recogemos datos sensibles ni realizamos perfiles comerciales automatizados.</p>

      <h2>4. Para qué usamos tus datos (finalidad)</h2>
      <ul>
        <li>Publicar tu reseña en el sitio, una vez revisada y aprobada.</li>
        <li>Responder tus consultas sobre vehículos, financiación o toma de usados.</li>
        <li>Proteger el sitio contra spam, fraude o usos indebidos.</li>
        <li>Cumplir con obligaciones legales.</li>
      </ul>
      <p>Tus datos no serán utilizados para finalidades distintas o incompatibles con las que motivaron su obtención.</p>

      <h2>5. Consentimiento</h2>
      <p>
        Al enviar una reseña marcando la casilla de aceptación, otorgás tu consentimiento libre, previo, expreso e informado para el
        tratamiento de tus datos con las finalidades indicadas, conforme al artículo 9 de la Ley N° 18.331. Podés revocarlo en
        cualquier momento.
      </p>

      <h2>6. Comunicación de datos a terceros</h2>
      <p>
        No vendemos ni cedemos tus datos personales. Solo pueden acceder a ellos los proveedores que nos prestan servicios
        necesarios para el funcionamiento del sitio (por ejemplo, alojamiento web), bajo obligación de confidencialidad, o las
        autoridades cuando exista una obligación legal.
      </p>

      <h2>7. Plazo de conservación</h2>
      <p>
        Conservamos las reseñas mientras estén publicadas o hasta que solicites su eliminación. Los datos técnicos de seguridad se
        conservan por el tiempo mínimo necesario para cumplir su finalidad.
      </p>

      <h2>8. Tus derechos</h2>
      <p>En cualquier momento podés ejercer, en forma gratuita, los derechos que te otorga la Ley N° 18.331:</p>
      <ul>
        <li>
          <strong>Acceso:</strong> saber qué datos tuyos tenemos y cómo los usamos.
        </li>
        <li>
          <strong>Rectificación y actualización:</strong> corregir datos inexactos o incompletos.
        </li>
        <li>
          <strong>Inclusión:</strong> solicitar que se incluyan datos que corresponda.
        </li>
        <li>
          <strong>Supresión:</strong> pedir que eliminemos tus datos cuando corresponda.
        </li>
      </ul>
      <p>
        Para ejercerlos, escribinos a {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : "nuestro email de contacto"}{" "}
        indicando tu nombre, el derecho que querés ejercer y adjuntando una copia de tu documento de identidad. Responderemos dentro de
        los plazos previstos por la ley (cinco días hábiles).
      </p>
      <p>
        Si considerás que tus derechos no fueron atendidos, podés presentar una denuncia ante la{" "}
        <strong>Unidad Reguladora y de Control de Datos Personales (URCDP)</strong>, órgano de control en la materia, a través de{" "}
        <a href="https://www.gub.uy/unidad-reguladora-control-datos-personales" target="_blank" rel="noopener noreferrer">
          gub.uy/urcdp
        </a>
        .
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Adoptamos medidas técnicas y organizativas razonables para proteger tus datos contra pérdida, acceso no autorizado o
        alteración, como conexiones cifradas, acceso restringido al panel de administración y contraseñas protegidas.
      </p>

      <h2>10. Menores de edad</h2>
      <p>Este sitio no está dirigido a menores de 18 años. Si sos menor, no envíes datos personales sin autorización de tus padres o tutores.</p>

      <h2>11. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios legales o en nuestros servicios. La versión vigente siempre estará
        publicada en esta página con su fecha de actualización.
      </p>
    </LegalPage>
  );
}
