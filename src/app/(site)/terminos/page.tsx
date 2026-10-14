/*
 * ⚠️ PLANTILLA LEGAL: estos Términos y Condiciones son un modelo con referencia a la
 * Ley N° 17.250 de Relaciones de Consumo (Defensa del Consumidor). Deben ser revisados
 * por un profesional antes de su publicación, en particular lo relativo a la oferta,
 * reservas, garantías y financiación.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Condiciones de uso del sitio y de las publicaciones de vehículos de AutoNova.",
  alternates: { canonical: "/terminos" },
};

export default async function TermsPage() {
  const s = await getSettings();
  return (
    <LegalPage
      title="Términos y Condiciones"
      description="Condiciones generales de uso del sitio web y de las publicaciones de vehículos."
    >
      <h2>1. Identificación</h2>
      <p>
        Este sitio es operado por <strong>{s.legalName}</strong>, RUT <strong>{s.rut}</strong> (en adelante, “{s.businessName}”), con
        domicilio en {s.address}, {s.city}, Uruguay. Al navegar el sitio aceptás estos términos.
      </p>

      <h2>2. Objeto del sitio</h2>
      <p>
        El sitio tiene carácter informativo: muestra los vehículos usados que {s.businessName} ofrece a la venta y facilita el contacto
        con nuestro equipo comercial. Las operaciones de compraventa se concretan exclusivamente en forma presencial o por los canales
        que la automotora indique, mediante la documentación correspondiente.
      </p>

      <h2>3. Precios y disponibilidad</h2>
      <ul>
        <li>Los precios se expresan en dólares estadounidenses (USD), salvo indicación en contrario.</li>
        <li>
          Los precios y la disponibilidad de los vehículos están <strong>sujetos a cambios sin previo aviso</strong> y a la venta previa
          de la unidad.
        </li>
        <li>
          Salvo que se indique lo contrario, los precios no incluyen gastos de transferencia, empadronamiento, seguros ni otros costos
          asociados, que serán informados antes de concretar la operación.
        </li>
        <li>Los estados “Disponible”, “Reservado” y “Vendido” son orientativos y se actualizan periódicamente.</li>
      </ul>

      <h2>4. Fotografías e información de los vehículos</h2>
      <p>
        Las fotografías son <strong>ilustrativas</strong> y pueden no reflejar con exactitud el color, el equipamiento o el estado
        actual de la unidad. Ponemos el mayor cuidado en que la información publicada (año, kilometraje, equipamiento, etc.) sea
        correcta, pero puede contener errores involuntarios. Te recomendamos verificar todos los datos al visitar el vehículo.
      </p>

      <h2>5. Carácter de las publicaciones</h2>
      <p>
        En la medida permitida por la normativa vigente, las publicaciones del sitio constituyen una invitación a contactarnos y{" "}
        <strong>no una oferta vinculante</strong>. Las condiciones definitivas de cada operación (precio, forma de pago, entrega y
        garantía) quedan sujetas a la <strong>confirmación expresa de la automotora</strong>, que será informada de forma clara y
        veraz antes de la contratación, conforme a la Ley N° 17.250.
      </p>

      <h2>6. Reservas y señas</h2>
      <p>
        Una unidad solo se considera reservada cuando la automotora lo confirma y se cumplen las condiciones de reserva acordadas (por
        ejemplo, el pago de una seña), las que se documentarán por escrito.
      </p>

      <h2>7. Estado de los vehículos y garantía</h2>
      <p>
        Los vehículos ofrecidos son usados. Antes de la compra podés inspeccionarlos personalmente o con el mecánico de tu confianza.
        La garantía aplicable será la que se acuerde por escrito en cada operación y, en todo caso, la que corresponda según la
        normativa vigente.
      </p>

      <h2>8. Financiación y toma de usados</h2>
      <p>
        Las opciones de financiación están sujetas a la aprobación de la entidad financiera correspondiente y a sus propias condiciones.
        La tasación de vehículos entregados como parte de pago se realiza previa inspección y no es vinculante hasta ser confirmada por
        escrito.
      </p>

      <h2>9. Derechos del consumidor</h2>
      <p>
        Nada de lo establecido en estos términos limita los derechos que te reconoce la{" "}
        <strong>Ley N° 17.250 de Relaciones de Consumo</strong> y su reglamentación, entre ellos el derecho a recibir información clara,
        veraz y suficiente sobre los productos ofrecidos. En los casos de contratación fuera del local comercial o a distancia, el
        consumidor podrá ejercer el derecho de rescisión previsto en el artículo 16 de dicha ley, dentro de los cinco días hábiles
        siguientes a la formalización del contrato o a la entrega del producto, según corresponda.
      </p>
      <p>
        Por consultas o reclamos podés contactarnos directamente o dirigirte al Área de Defensa del Consumidor del Ministerio de
        Economía y Finanzas a través de{" "}
        <a href="https://www.gub.uy/ministerio-economia-finanzas/defensa-consumidor" target="_blank" rel="noopener noreferrer">
          gub.uy/defensa-consumidor
        </a>
        .
      </p>

      <h2>10. Reseñas de usuarios</h2>
      <p>
        Las reseñas son opiniones de los usuarios y no representan necesariamente la opinión de {s.businessName}. Nos reservamos el
        derecho de no publicar, ocultar o eliminar reseñas ofensivas, falsas, con datos personales de terceros, publicidad o contenido
        ilegal. El tratamiento de los datos se rige por nuestra <Link href="/privacidad">Política de Privacidad</Link>.
      </p>

      <h2>11. Propiedad intelectual</h2>
      <p>
        Los textos, diseños, logotipos y demás contenidos del sitio pertenecen a {s.businessName} o a sus licenciantes, y no pueden ser
        reproducidos sin autorización.
      </p>

      <h2>12. Ley aplicable y jurisdicción</h2>
      <p>
        Estos términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier controversia será sometida a los
        tribunales competentes de la República, sin perjuicio de los derechos que la ley reconoce al consumidor.
      </p>

      <h2>13. Contacto</h2>
      <p>
        Por cualquier consulta sobre estos términos, escribinos a {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : "nuestro email"} o
        visitanos en {s.address}, {s.city}.
      </p>
    </LegalPage>
  );
}
