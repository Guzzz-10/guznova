import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { FUELS, TRANSMISSIONS } from "./constants";

export const SORTS = {
  recientes: "Más recientes",
  "precio-asc": "Menor precio",
  "precio-desc": "Mayor precio",
  "anio-desc": "Más nuevos",
  "anio-asc": "Más antiguos",
  "km-asc": "Menos kilómetros",
} as const;
export type SortKey = keyof typeof SORTS;

export type CatalogFilters = {
  marca?: string;
  modelo?: string;
  desde?: number;
  hasta?: number;
  pmin?: number;
  pmax?: number;
  kmmax?: number;
  combustible?: string;
  caja?: string;
  orden: SortKey;
};

const cardSelect = {
  id: true,
  slug: true,
  brand: true,
  model: true,
  version: true,
  year: true,
  price: true,
  km: true,
  fuel: true,
  transmission: true,
  status: true,
  featured: true,
  images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
} satisfies Prisma.CarSelect;

type CardRow = Prisma.CarGetPayload<{ select: typeof cardSelect }>;
export type CarCardData = Omit<CardRow, "images"> & { cover: { url: string; alt: string } | null };

function toCard(row: CardRow): CarCardData {
  const { images, ...rest } = row;
  return { ...rest, cover: images[0] ?? null };
}

function num(v: string | string[] | undefined): number | undefined {
  if (typeof v !== "string" || v.trim() === "") return undefined;
  const n = Number(v.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, 60) : undefined;
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): CatalogFilters {
  const orden = str(sp.orden);
  const combustible = str(sp.combustible);
  const caja = str(sp.caja);
  return {
    marca: str(sp.marca),
    modelo: str(sp.modelo),
    desde: num(sp.desde),
    hasta: num(sp.hasta),
    pmin: num(sp.pmin),
    pmax: num(sp.pmax),
    kmmax: num(sp.kmmax),
    combustible: combustible && (FUELS as readonly string[]).includes(combustible) ? combustible : undefined,
    caja: caja && (TRANSMISSIONS as readonly string[]).includes(caja) ? caja : undefined,
    orden: orden && orden in SORTS ? (orden as SortKey) : "recientes",
  };
}

const ORDER: Record<SortKey, Prisma.CarOrderByWithRelationInput[]> = {
  recientes: [{ createdAt: "desc" }],
  "precio-asc": [{ price: "asc" }],
  "precio-desc": [{ price: "desc" }],
  "anio-desc": [{ year: "desc" }, { price: "desc" }],
  "anio-asc": [{ year: "asc" }],
  "km-asc": [{ km: "asc" }],
};

const STATUS_RANK: Record<string, number> = { DISPONIBLE: 0, RESERVADO: 1, VENDIDO: 2 };

export async function getCatalog(f: CatalogFilters): Promise<CarCardData[]> {
  const where: Prisma.CarWhereInput = {
    brand: f.marca,
    model: f.modelo,
    year: { gte: f.desde, lte: f.hasta },
    price: { gte: f.pmin, lte: f.pmax },
    km: { lte: f.kmmax },
    fuel: f.combustible,
    transmission: f.caja,
  };
  const rows = await prisma.car.findMany({ where, orderBy: ORDER[f.orden], select: cardSelect });
  // Los vendidos siempre al final (sort estable: mantiene el orden elegido).
  return rows
    .map(toCard)
    .sort((a, b) => (STATUS_RANK[a.status] ?? 0) - (STATUS_RANK[b.status] ?? 0));
}

export async function getFeaturedCars(limit = 6): Promise<CarCardData[]> {
  const rows = await prisma.car.findMany({
    where: { featured: true, status: { not: "VENDIDO" } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  if (rows.length >= limit) return rows.map(toCard);
  // Si hay pocos destacados, completamos la grilla con los más recientes disponibles.
  const extra = await prisma.car.findMany({
    where: { id: { notIn: rows.map((r) => r.id) }, status: "DISPONIBLE" },
    orderBy: { createdAt: "desc" },
    take: limit - rows.length,
    select: cardSelect,
  });
  return [...rows, ...extra].map(toCard);
}

export async function getCarBySlug(slug: string) {
  return prisma.car.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } } },
  });
}

export async function getSimilarCars(car: { id: string; brand: string; bodyType: string; price: number }) {
  const rows = await prisma.car.findMany({
    where: {
      id: { not: car.id },
      status: { not: "VENDIDO" },
      OR: [
        { brand: car.brand },
        { bodyType: car.bodyType },
        { price: { gte: Math.round(car.price * 0.7), lte: Math.round(car.price * 1.3) } },
      ],
    },
    select: { ...cardSelect, bodyType: true },
    take: 12,
  });
  const score = (r: (typeof rows)[number]) =>
    (r.bodyType === car.bodyType ? 2 : 0) +
    (r.brand === car.brand ? 1 : 0) -
    Math.abs(r.price - car.price) / car.price;
  return rows
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3)
    .map(({ bodyType: _b, ...r }) => toCard(r));
}

export async function getFilterOptions() {
  const [cars, agg] = await Promise.all([
    prisma.car.findMany({ select: { brand: true, model: true }, distinct: ["brand", "model"], orderBy: [{ brand: "asc" }, { model: "asc" }] }),
    prisma.car.aggregate({ _min: { year: true, price: true }, _max: { year: true, price: true, km: true } }),
  ]);
  const models: Record<string, string[]> = {};
  for (const c of cars) (models[c.brand] ??= []).push(c.model);
  const minYear = agg._min.year ?? 2010;
  const maxYear = agg._max.year ?? new Date().getFullYear();
  return {
    brands: Object.keys(models),
    models,
    years: Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
  };
}
