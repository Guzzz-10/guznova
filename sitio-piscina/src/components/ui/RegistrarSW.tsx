"use client";

import { useEffect } from "react";

/** Registra el service worker (permite instalar el sitio y ver el carnet sin conexión). */
export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
