import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageTitle } from "@/components/admin/PageTitle";
import { CarForm } from "@/components/admin/CarForm";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Editar auto" };

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [car, brandRows] = await Promise.all([
    prisma.car.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } }),
    prisma.car.findMany({ select: { brand: true }, distinct: ["brand"] }),
  ]);
  if (!car) notFound();

  return (
    <>
      <Link href="/admin/autos" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a autos
      </Link>
      <PageTitle
        title={`${car.brand} ${car.model} ${car.year}`}
        description="Modificá lo que necesites y tocá “Guardar cambios”."
        action={
          <a href={`/autos/${car.slug}`} target="_blank" className="a-btn-secondary">
            <ExternalLink className="h-4 w-4" aria-hidden /> Ver en el sitio
          </a>
        }
      />
      <CarForm
        key={car.updatedAt.toISOString()}
        id={car.id}
        brands={brandRows.map((b) => b.brand).sort()}
        initialImages={car.images.map((i) => i.url)}
        initial={{
          brand: car.brand,
          model: car.model,
          version: car.version,
          year: String(car.year),
          price: String(car.price),
          km: String(car.km),
          fuel: car.fuel,
          transmission: car.transmission,
          bodyType: car.bodyType,
          color: car.color,
          engine: car.engine,
          doors: String(car.doors),
          description: car.description,
          equipment: car.equipment,
          status: car.status,
          featured: car.featured,
        }}
      />
    </>
  );
}
