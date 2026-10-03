import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { autos, getAuto, nombre } from "@/data/autos";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DetalleBody } from "@/components/DetalleBody";
import { WhatsAppButton } from "@/components/WhatsAppButton";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => autos.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const auto = getAuto((await params).slug);
  return auto ? { title: `${nombre(auto)} ${auto.version} ${auto.anio} · GuzNova`, description: auto.descripcion } : {};
}

export default async function AutoPage({ params }: Props) {
  const auto = getAuto((await params).slug);
  if (!auto) notFound();
  return (
    <>
      <Navbar overHero={false} />
      <main className="mx-auto max-w-5xl px-0 pt-24 pb-24 md:px-8 md:pt-28">
        <Link href="/#catalogo" className="mb-5 ml-5 inline-flex items-center gap-2 text-sm text-mute transition-colors hover:text-ink md:ml-0">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Volver al catálogo
        </Link>
        <div className="overflow-hidden bg-paper md:rounded-3xl md:border md:border-ink/10">
          <DetalleBody auto={auto} />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
