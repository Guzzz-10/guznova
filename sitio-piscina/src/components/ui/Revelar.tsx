"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __revealOk?: boolean;
  }
}

/**
 * Un único IntersectionObserver para todos los elementos con [data-reveal].
 * También detecta elementos que aparecen después (filtros, pasos, etc.).
 * Marca con un atributo (no una clase) para que React no lo borre al re-renderizar.
 */
export function Revelar() {
  const pathname = usePathname();

  useEffect(() => {
    window.__revealOk = true;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.visible = "";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const observarTodo = () =>
      document.querySelectorAll("[data-reveal]:not([data-visible])").forEach((el) => io.observe(el));

    observarTodo();
    let pendiente = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(observarTodo);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(pendiente);
    };
  }, [pathname]);

  return null;
}
