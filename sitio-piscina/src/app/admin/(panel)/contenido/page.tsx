import Link from "next/link";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { modoDemo } from "@/lib/entorno";
import { BannerEjemplo } from "@/components/admin/BannerEjemplo";
import { EditorContacto, EditorHero } from "@/components/admin/contenido/EditorTextos";
import { EditorHistoriaTextos, EditorHitos } from "@/components/admin/contenido/EditorHistoria";
import { EditorGaleria } from "@/components/admin/contenido/EditorGaleria";
import { EditorPiscinas } from "@/components/admin/contenido/EditorPiscinas";
import { EditorWhatsApp } from "@/components/admin/contenido/EditorWhatsApp";

export const metadata = { title: "Contenido del sitio" };

const secciones = [
  { id: "textos", label: "📝 Textos y horarios" },
  { id: "galeria", label: "📸 Galería" },
  { id: "piscinas", label: "🏊 Piscinas" },
  { id: "historia", label: "📖 Historia" },
  { id: "whatsapp", label: "💬 WhatsApp" },
];

export default async function Contenido({ searchParams }: { searchParams: Promise<{ seccion?: string }> }) {
  const { seccion = "textos" } = await searchParams;
  const c = await obtenerContenido();
  const editable = (k: keyof typeof c.origen) => modoDemo || c.origen[k] === "db";

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-mar-950">Contenido del sitio</h1>
        <p className="text-mar-600">Cambiá textos y fotos sin tocar código. Al guardar, el sitio se actualiza solo.</p>
      </div>
      {c.usaEjemplo && <BannerEjemplo />}
      <nav aria-label="Secciones del contenido" className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {secciones.map((s) => (
          <Link
            key={s.id}
            href={`?seccion=${s.id}`}
            aria-current={seccion === s.id ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 font-semibold ring-1 transition ${seccion === s.id ? "bg-mar-900 text-white ring-mar-900" : "bg-white text-mar-800 ring-mar-100 hover:ring-agua-300"}`}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      {seccion === "textos" && (
        <>
          <EditorHero inicial={c.hero} />
          <EditorContacto inicial={c.contacto} negocio={c.negocio} />
        </>
      )}
      {seccion === "galeria" && <EditorGaleria fotos={c.galeria} editable={editable("galeria")} />}
      {seccion === "piscinas" && <EditorPiscinas piscinas={c.piscinas} editable={editable("piscinas")} />}
      {seccion === "historia" && (
        <>
          <EditorHistoriaTextos inicial={c.historia} />
          <EditorHitos hitos={c.hitos} editable={editable("hitos")} />
        </>
      )}
      {seccion === "whatsapp" && <EditorWhatsApp inicial={c.whatsapp} />}
    </div>
  );
}
