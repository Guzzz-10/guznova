import { cn } from "@/lib/cn";

/** Logo de texto AutoNova hecho con SVG + CSS. */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-nova-300 to-nova-600 shadow-[0_4px_14px_-4px_rgba(255,138,31,.6)]">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
          {/* "N" estilizada como una ruta */}
          <path d="M11 29V11l18 18V11" fill="none" stroke="#07080B" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* destello (nova) */}
          <path d="M31 6.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#fff" />
        </svg>
      </span>
      <span className={cn("font-display text-xl font-bold leading-none tracking-tight", light ? "text-ink-900" : "text-white")}>
        Auto<span className={light ? "text-nova-600" : "bg-gradient-to-r from-nova-300 to-nova-600 bg-clip-text text-transparent"}>Nova</span>
      </span>
    </span>
  );
}
