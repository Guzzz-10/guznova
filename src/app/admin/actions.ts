"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type LoginState = { error: string; username?: string } | null;

// Hash válido para comparar cuando el usuario no existe (evita revelar usuarios por tiempo de respuesta).
const DUMMY_HASH = "$2b$12$bJWIFywVK3ynZpEUxQsvv.KPS0j5yCzRMJWWp5Mc4xribTowH1b/.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!username || !password) return { error: "Completá usuario y contraseña.", username };

  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) {
    return { error: "Demasiados intentos. Esperá 15 minutos y probá de nuevo.", username };
  }

  const user = await prisma.adminUser.findUnique({ where: { username } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return { error: "Usuario o contraseña incorrectos.", username };

  await createSession(user);
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
