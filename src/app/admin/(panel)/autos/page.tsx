import Link from "next/link";
import { Plus } from "lucide-react";
import { PageTitle } from "@/components/admin/PageTitle";
import { CarsList } from "@/components/admin/CarsList";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Autos" };

export default async function AdminCarsPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await requireAdmin();
  const { estado } = await searchParams;
  const cars = await prisma.car.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  return (
    <>
      <PageTitle
        title="Autos"
        description="Agregá, editá o cambiá el estado de tus autos. Los cambios se ven en el sitio al instante."
        action={
          <Link href="/admin/autos/nuevo" className="a-btn-primary !py-3 text-base">
            <Plus className="h-5 w-5" aria-hidden /> Agregar un auto
          </Link>
        }
      />
      <CarsList
        initialFilter={estado ?? "TODOS"}
        cars={cars.map((c) => ({
          id: c.id,
          slug: c.slug,
          title: `${c.brand} ${c.model}`,
          subtitle: `${c.version ? `${c.version} · ` : ""}${c.year}`,
          price: c.price,
          km: c.km,
          status: c.status,
          featured: c.featured,
          cover: c.images[0]?.url ?? null,
        }))}
      />
    </>
  );
}
