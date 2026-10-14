import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { CatalogView } from "@/components/site/CatalogView";
import { getCatalog, getFilterOptions, parseFilters, SORTS } from "@/lib/cars";

export const metadata: Metadata = {
  title: "Catálogo de autos usados",
  description:
    "Mirá todos nuestros autos usados disponibles: filtrá por marca, modelo, año, precio, kilometraje, combustible y transmisión.",
  alternates: { canonical: "/autos" },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const [cars, options] = await Promise.all([getCatalog(filters), getFilterOptions()]);

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Encontrá tu próximo auto"
        description="Todos nuestros autos están revisados y con la documentación al día. Usá los filtros para encontrar el ideal."
      />
      <section className="pb-24">
        <div className="container">
          <CatalogView cars={cars} filters={filters} options={options} sorts={SORTS} />
        </div>
      </section>
    </>
  );
}
