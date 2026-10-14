"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SETTING_KEYS } from "@/lib/settings-defaults";
import { fieldErrors, settingsSchema } from "@/lib/validation";

type Result = { ok: boolean; message: string; errors?: Record<string, string> };

export async function saveSettings(values: Record<string, string>): Promise<Result> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Revisá los campos marcados en rojo.", errors: fieldErrors(parsed.error) };
  }
  const data = parsed.data as Record<string, string>;
  await prisma.$transaction(
    SETTING_KEYS.map((key) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: data[key] ?? "" },
        update: { value: data[key] ?? "" },
      }),
    ),
  );
  revalidatePath("/", "layout");
  return { ok: true, message: "¡Configuración guardada! Los cambios ya se ven en el sitio." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Ingresá tu contraseña actual."),
    next: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres.").max(100),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "Las contraseñas no coinciden.", path: ["confirm"] });

export async function changePassword(values: { current: string; next: string; confirm: string }): Promise<Result> {
  const user = await requireAdmin();
  const parsed = passwordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Revisá los campos.", errors: fieldErrors(parsed.error) };
  const full = await prisma.adminUser.findUnique({ where: { id: user.id } });
  if (!full || !(await bcrypt.compare(parsed.data.current, full.passwordHash))) {
    return { ok: false, message: "La contraseña actual no es correcta.", errors: { current: "La contraseña actual no es correcta." } };
  }
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 12) },
  });
  return { ok: true, message: "Contraseña actualizada." };
}
