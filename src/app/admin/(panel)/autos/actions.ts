"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteImage } from "@/lib/storage";
import { CAR_STATUS, type CarStatus } from "@/lib/constants";
import { slugify } from "@/lib/format";
import { carSchema, fieldErrors, type CarInput } from "@/lib/validation";

export type ActionResult = { ok: boolean; message: string; errors?: Record<string, string>; id?: string };

function refresh() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "auto";
  for (let i = 2; ; i++) {
    const found = await prisma.car.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

const isStoredImage = (url: string) => url.startsWith("/uploads/") || /^https:\/\//.test(url);

export async function saveCar(input: { id?: string; data: CarInput; images: string[] }): Promise<ActionResult> {
  await requireAdmin();

  const parsed = carSchema.safeParse(input.data);
  if (!parsed.success) {
    return { ok: false, message: "Revisá los campos marcados en rojo.", errors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;
  const images = input.images.filter(isStoredImage).slice(0, 40);
  const title = `${data.brand} ${data.model} ${data.year}`;
  const imageRows = images.map((url, position) => ({ url, position, alt: `${title} — foto ${position + 1}` }));

  try {
    if (input.id) {
      const existing = await prisma.car.findUnique({ where: { id: input.id }, include: { images: true } });
      if (!existing) return { ok: false, message: "El auto ya no existe." };

      const removed = existing.images.filter((img) => !images.includes(img.url));
      await prisma.$transaction([
        prisma.carImage.deleteMany({ where: { carId: input.id } }),
        prisma.car.update({
          where: { id: input.id },
          data: {
            ...data,
            soldAt: data.status === "VENDIDO" ? existing.soldAt ?? new Date() : null,
            images: { create: imageRows },
          },
        }),
      ]);
      await Promise.all(removed.map((img) => deleteImage(img.url)));
      refresh();
      return { ok: true, message: "¡Cambios guardados!", id: input.id };
    }

    const slug = await uniqueSlug(slugify(`${data.brand} ${data.model} ${data.version} ${data.year}`));
    const car = await prisma.car.create({
      data: {
        ...data,
        slug,
        soldAt: data.status === "VENDIDO" ? new Date() : null,
        images: { create: imageRows },
      },
    });
    refresh();
    return { ok: true, message: "¡Auto publicado!", id: car.id };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "No se pudo guardar. Probá de nuevo." };
  }
}

export async function deleteCar(id: string): Promise<ActionResult> {
  await requireAdmin();
  const car = await prisma.car.findUnique({ where: { id }, include: { images: true } });
  if (!car) return { ok: false, message: "El auto ya no existe." };
  await prisma.car.delete({ where: { id } });
  await Promise.all(car.images.map((img) => deleteImage(img.url)));
  refresh();
  return { ok: true, message: `Se eliminó el ${car.brand} ${car.model}.` };
}

export async function setCarStatus(id: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  if (!(CAR_STATUS as readonly string[]).includes(status)) return { ok: false, message: "Estado inválido." };
  const car = await prisma.car.update({
    where: { id },
    data: { status: status as CarStatus, soldAt: status === "VENDIDO" ? new Date() : null },
  });
  refresh();
  const labels: Record<string, string> = { DISPONIBLE: "disponible", RESERVADO: "reservado", VENDIDO: "vendido" };
  return { ok: true, message: `${car.brand} ${car.model} marcado como ${labels[status]}.` };
}

export async function setCarFeatured(id: string, featured: boolean): Promise<ActionResult> {
  await requireAdmin();
  const car = await prisma.car.update({ where: { id }, data: { featured } });
  refresh();
  return {
    ok: true,
    message: featured ? `${car.brand} ${car.model} ahora es destacado.` : `${car.brand} ${car.model} ya no es destacado.`,
  };
}

/** Borra una foto recién subida que se quitó antes de guardar (si no la usa ningún auto). */
export async function discardUpload(url: string): Promise<void> {
  await requireAdmin();
  if (!url.startsWith("/uploads/") || url.startsWith("/uploads/demo/")) return;
  const used = await prisma.carImage.count({ where: { url } });
  if (used === 0) await deleteImage(url);
}
