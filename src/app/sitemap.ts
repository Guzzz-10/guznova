import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await prisma.car.findMany({
    where: { status: { not: "VENDIDO" } },
    select: { slug: true, updatedAt: true },
  });
  const pages = ["", "/autos", "/nosotros", "/resenas", "/contacto", "/privacidad", "/terminos", "/cookies"];
  return [
    ...pages.map((p) => ({
      url: siteUrl(p || "/"),
      changeFrequency: (p === "" || p === "/autos" ? "daily" : "monthly") as "daily" | "monthly",
      priority: p === "" ? 1 : p === "/autos" ? 0.9 : 0.5,
    })),
    ...cars.map((c) => ({
      url: siteUrl(`/autos/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
