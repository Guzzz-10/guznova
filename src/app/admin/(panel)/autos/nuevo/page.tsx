import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/admin/PageTitle";
import { CarForm, EMPTY_CAR } from "@/components/admin/CarForm";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Agregar auto" };

const COMMON_BRANDS = ["Chevrolet", "Citroën", "Fiat", "Ford", "Honda", "Hyundai", "Kia", "Nissan", "Peugeot", "Renault", "Suzuki", "Toyota", "Volkswagen"];

export default async function NewCarPage() {
  await requireAdmin();
  const existing = await prisma.car.findMany({ select: { brand: true }, distinct: ["brand"] });
  const brands = [...new Set([...existing.map((b) => b.brand), ...COMMON_BRANDS])].sort();
  return (
    <>
      <Link href="/admin/autos" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a autos
      </Link>
      <PageTitle title="Agregar un auto" description="Completá los datos y subí las fotos. Cuando termines, tocá “Publicar auto”." />
      <CarForm initial={EMPTY_CAR} brands={brands} />
    </>
  );
}
