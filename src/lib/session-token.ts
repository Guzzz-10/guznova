// Firma y verificación del token de sesión (compatible con Edge, se usa en el middleware).
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "autonova_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export type SessionPayload = { sub: string; username: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET debe estar definido y tener al menos 32 caracteres.");
    }
    return new TextEncoder().encode("dev-only-secret-autonova-cambiar-en-produccion");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.username !== "string") return null;
    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}
