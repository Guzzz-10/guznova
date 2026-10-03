import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoInfo } from "@/components/AutoInfo";
import { Gallery } from "@/components/Gallery";
import { Reveal } from "@/components/ui/Reveal";
import { autos, getAuto } from "@/data/autos";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return autos.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const auto = getAuto((await params).slug);
  if (!auto) return {};
  return {
    title: `${auto.marca} ${auto.modelo} ${auto.version} ${auto.anio} · GuzNova`,
    description: auto.descripcion,
  };
}

export default async function AutoPage({ params }: Props) {
  const auto = getAuto((await params).slug);
  if (!auto) notFound();

  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <Reveal>
        <Link
          href="/#catalogo"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Volver al catálogo
        </Link>
      </Reveal>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <Reveal>
          <Gallery auto={auto} priority />
        </Reveal>
        <Reveal delay={0.12}>
          <AutoInfo auto={auto} />
        </Reveal>
      </div>
    </div>
  );
}
