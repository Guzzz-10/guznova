import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session-token";

export async function createSession(user: { id: string; username: string }) {
  const token = await signSession({ sub: user.id, username: user.username });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    select: { id: true, username: true, name: true },
  });
  return user;
}

/** Usar al inicio de cada página y server action del panel. */
export async function requireAdmin() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  return user;
}
