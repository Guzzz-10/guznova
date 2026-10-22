import { Hero } from "@/components/secciones/Hero";
import { Piscinas } from "@/components/secciones/Piscinas";
import { SeccionClases } from "@/components/secciones/SeccionClases";
import { Historia } from "@/components/secciones/Historia";
import { Suscripcion } from "@/components/secciones/Suscripcion";
import { Consultas } from "@/components/secciones/Consultas";
import { urlSitio } from "@/config/sitio";
import { obtenerContenido, obtenerDisponibilidad } from "@/lib/contenido/obtener";
import type { Contenido } from "@/lib/contenido/tipos";

// La página se regenera sola cada 5 minutos y al instante cuando se edita algo en /admin.
export const revalidate = 300;

export const metadata = { alternates: { canonical: "/" } };

const diasSchema = { lun: "Monday", mar: "Tuesday", mie: "Wednesday", jue: "Thursday", vie: "Friday", sab: "Saturday", dom: "Sunday" };

function DatosEstructurados({ c }: { c: Contenido }) {
  const n = c.negocio;
  const datos = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: n.nombreCompleto,
    description: n.descripcion,
    url: urlSitio,
    image: c.hero.imagenUrl.startsWith("http") ? c.hero.imagenUrl : `${urlSitio}${c.hero.imagenUrl}`,
    telephone: n.telefono,
    email: n.email,
    foundingDate: String(n.anioFundacion),
    address: {
      "@type": "PostalAddress",
      streetAddress: n.direccion,
      addressLocality: n.ciudad,
      addressRegion: n.departamento,
      postalCode: n.codigoPostal,
      addressCountry: "UY",
    },
    hasMap: n.mapa.enlace,
    sameAs: Object.values(n.redes).filter(Boolean),
    makesOffer: c.planes
      .filter((p) => p.activo)
      .map((p) => ({ "@type": "Offer", name: p.nombre, price: p.precio, priceCurrency: "UYU", description: p.incluye.join(", ") })),
    event: c.clases
      .filter((cl) => cl.activa)
      .slice(0, 10)
      .map((cl) => ({
        "@type": "Course",
        name: cl.nombre,
        description: cl.descripcion,
        provider: { "@type": "Organization", name: n.nombreCompleto },
        hasCourseInstance: cl.horarios.slice(0, 3).map((h) => ({ "@type": "CourseInstance", courseSchedule: { "@type": "Schedule", byDay: diasSchema[h.dia], startTime: h.hora } })),
      })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }} />;
}

export default async function Inicio() {
  const c = await obtenerContenido();
  const disponibilidad = await obtenerDisponibilidad(c.clases);
  return (
    <>
      <DatosEstructurados c={c} />
      <Hero hero={c.hero} ciudad={c.negocio.ciudad} />
      <Piscinas piscinas={c.piscinas} galeria={c.galeria} />
      <SeccionClases clases={c.clases} whatsapp={c.whatsapp.numero} disponibilidad={disponibilidad} />
      <Historia historia={c.historia} hitos={c.hitos} nombre={c.negocio.nombre} ciudad={c.negocio.ciudad} anioFundacion={c.negocio.anioFundacion} />
      <Suscripcion planes={c.planes.filter((p) => p.activo)} />
      <Consultas contacto={c.contacto} whatsapp={c.whatsapp} nombre={c.negocio.nombre} telefono={c.negocio.telefono} email={c.negocio.email} />
    </>
  );
}
