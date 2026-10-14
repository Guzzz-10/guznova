export function BrandMarquee({ brands }: { brands: string[] }) {
  if (brands.length === 0) return null;
  const list = [...brands, ...brands, ...brands];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-ink-900/50 py-6" aria-label="Marcas disponibles">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent" />
      <ul className="flex w-max motion-safe:animate-[marquee_40s_linear_infinite] motion-reduce:flex-wrap motion-reduce:justify-center">
        {list.map((b, i) => (
          <li
            key={`${b}-${i}`}
            aria-hidden={i >= brands.length}
            className="pr-14 font-display text-2xl font-bold uppercase tracking-wider text-white/20 transition hover:text-nova-400 sm:text-3xl"
          >
            {b}
          </li>
        ))}
      </ul>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
    </div>
  );
}
