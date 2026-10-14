import { cn } from "@/lib/cn";

/** Logo de texto AutoNova hecho con SVG + CSS. */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFB066" />
            <stop offset="1" stopColor="#E87300" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#logo-g)" />
        {/* "N" estilizada como ruta */}
        <path d="M11 29V11l18 18V11" fill="none" stroke="#07080B" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* destello (nova) */}
        <path d="M31 6.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#fff" />
      </svg>
      <span className={cn("font-display text-xl font-bold leading-none tracking-tight", light ? "text-ink-900" : "text-white")}>
        Auto<span className="bg-gradient-to-r from-nova-300 to-nova-600 bg-clip-text text-transparent">Nova</span>
      </span>
    </span>
  );
}
