"use client";

import { useEffect, useState } from "react";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/** "Agregar a la pantalla de inicio" (Android/Chrome con prompt nativo; iPhone con instrucciones). */
export function useInstalar() {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [instalada, setInstalada] = useState(false);
  const [esIOS, setEsIOS] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- datos del navegador, solo existen en el cliente
    setEsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setInstalada(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const antes = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
    };
    const listo = () => setInstalada(true);
    window.addEventListener("beforeinstallprompt", antes);
    window.addEventListener("appinstalled", listo);
    return () => {
      window.removeEventListener("beforeinstallprompt", antes);
      window.removeEventListener("appinstalled", listo);
    };
  }, []);

  const instalar = async () => {
    if (!evento) return false;
    await evento.prompt();
    const r = await evento.userChoice;
    setEvento(null);
    return r.outcome === "accepted";
  };

  return { puedeInstalar: Boolean(evento), instalar, instalada, esIOS };
}
