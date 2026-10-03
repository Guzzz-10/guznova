import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

/** Scroll suave a un ancla de la home. Devuelve false si no existe. */
export function scrollToHash(hash: string): boolean {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return false;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -64, duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth" });
  return true;
}
