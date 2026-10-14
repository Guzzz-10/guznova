"use client";

import { useSyncExternalStore } from "react";

export type Consent = "accepted" | "rejected" | null;
export const CONSENT_COOKIE = "autonova_consent";
const EVENT = "autonova:consent";

export function readConsent(): Consent {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  const v = m?.[1];
  return v === "accepted" || v === "rejected" ? v : null;
}

export function writeConsent(value: Exclude<Consent, null>) {
  const maxAge = 60 * 60 * 24 * 180; // 6 meses
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(EVENT));
}

export function resetConsent() {
  document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/`;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

/** undefined = todavía no se leyó (render del servidor). */
export function useConsent(): Consent | undefined {
  return useSyncExternalStore<Consent | undefined>(subscribe, readConsent, () => undefined);
}
