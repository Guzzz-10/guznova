"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { REVIEW_STATUS } from "@/lib/constants";

type Result = { ok: boolean; message: string };

export async function setReviewStatus(id: string, status: string): Promise<Result> {
  await requireAdmin();
  if (!(REVIEW_STATUS as readonly string[]).includes(status)) return { ok: false, message: "Estado inválido." };
  await prisma.review.update({ where: { id }, data: { status } });
  revalidatePath("/", "layout");
  const msg: Record<string, string> = {
    APROBADA: "Reseña publicada en el sitio.",
    OCULTA: "Reseña ocultada. Ya no se ve en el sitio.",
    PENDIENTE: "Reseña marcada como pendiente.",
  };
  return { ok: true, message: msg[status] };
}

export async function deleteReview(id: string): Promise<Result> {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Reseña eliminada." };
}
