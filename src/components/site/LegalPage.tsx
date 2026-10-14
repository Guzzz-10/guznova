/*
 * ⚠️ IMPORTANTE: los textos legales de este sitio (Privacidad, Términos y Cookies)
 * son PLANTILLAS de referencia. Deben ser revisados y adaptados por un profesional
 * (abogado/escribano) antes de publicar el sitio, según la realidad del negocio.
 */
import { PageHeader } from "./PageHeader";
import { Reveal } from "@/components/ui/Motion";

export const LEGAL_UPDATED = "14 de octubre de 2026";

export function LegalPage({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} description={description} />
      <section className="pb-24">
        <div className="container">
          <Reveal>
            <article className="prose-legal">
              <p className="text-sm text-ink-400">Última actualización: {LEGAL_UPDATED}</p>
              {children}
            </article>
          </Reveal>
        </div>
      </section>
    </>
  );
}
