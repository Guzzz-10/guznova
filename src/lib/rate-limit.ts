import "server-only";
import crypto from "node:crypto";
import { headers } from "next/headers";

// Limitador simple en memoria (suficiente para un único servidor).
// Si se despliega en varias instancias conviene moverlo a Redis/Upstash.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return true;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** Hash de la IP (no se guarda la IP en claro, por privacidad). */
export function hashIp(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(`${ip}:${process.env.AUTH_SECRET ?? "autonova"}`)
    .digest("hex")
    .slice(0, 32);
}
