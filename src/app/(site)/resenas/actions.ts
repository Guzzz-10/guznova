"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import { fieldErrors, reviewSchema } from "@/lib/validation";

export type ReviewFormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
} | null;

const SUCCESS = "¡Gracias por tu reseña! La vamos a revisar y publicar a la brevedad.";

export async function submitReview(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  // 1) Honeypot: campo oculto que solo completan los bots. Fingimos éxito.
  if (String(formData.get("website") ?? "") !== "") return { ok: true, message: SUCCESS };

  // 2) Trampa de tiempo: un humano tarda más de 3 segundos en completar el formulario.
  const startedAt = Number(formData.get("startedAt"));
  if (!startedAt || Date.now() - startedAt < 3000) {
    return { ok: false, message: "Enviaste el formulario demasiado rápido. Esperá unos segundos y probá de nuevo." };
  }

  // 3) Límite de envíos por IP (en memoria + en base de datos).
  const ipHash = hashIp(await clientIp());
  if (!rateLimit(`review:${ipHash}`, 3, 60 * 60 * 1000)) {
    return { ok: false, message: "Recibimos varias reseñas desde tu conexión. Probá de nuevo más tarde." };
  }
  const recent = await prisma.review.count({
    where: { ipHash, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  if (recent >= 5) {
    return { ok: false, message: "Recibimos varias reseñas desde tu conexión. Probá de nuevo mañana." };
  }

  // 4) Validación del lado del servidor.
  const parsed = reviewSchema.safeParse({
    name: formData.get("name") ?? "",
    rating: formData.get("rating") ?? "",
    comment: formData.get("comment") ?? "",
    privacy: formData.get("privacy") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Revisá los campos marcados.", errors: fieldErrors(parsed.error) };
  }

  await prisma.review.create({
    data: {
      name: parsed.data.name,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      status: "PENDIENTE", // nunca se publica automáticamente
      ipHash,
    },
  });
  revalidatePath("/admin");
  return { ok: true, message: SUCCESS };
}
