type Props = { nombre: string; eslogan?: string; logoUrl?: string | null; className?: string; claro?: boolean; soloIcono?: boolean };

export function LogoIcono({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="15" fill="#0eaebf" />
      <path d="M0 22c6-6 14-8 24-6s18 1 24-4v36H0z" fill="#1764b6" opacity=".55" />
      <circle cx="33.5" cy="14.5" r="6.5" fill="#ffc21f" />
      <path
        d="M5 29.5c3.4 0 3.4-2.7 6.8-2.7s3.4 2.7 6.8 2.7 3.4-2.7 6.8-2.7 3.4 2.7 6.8 2.7 3.4-2.7 6.8-2.7 2.5 1.6 4 2.3"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M5 37c3.4 0 3.4-2.7 6.8-2.7s3.4 2.7 6.8 2.7 3.4-2.7 6.8-2.7 3.4 2.7 6.8 2.7 3.4-2.7 6.8-2.7 2.5 1.6 4 2.3"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity=".7"
      />
    </svg>
  );
}

export function Logo({ nombre, eslogan, logoUrl, className = "", claro = false, soloIcono = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="size-10 shrink-0 rounded-[0.9rem] object-cover drop-shadow-sm" />
      ) : (
        <LogoIcono className="size-10 shrink-0 drop-shadow-sm" />
      )}
      {!soloIcono && (
        <span className="flex flex-col leading-none">
          <span className={`font-display text-2xl font-bold tracking-tight ${claro ? "text-white" : "text-mar-900"}`}>
            {nombre}
          </span>
          {eslogan && (
          <span
            className={`text-[0.65rem] font-semibold tracking-[0.18em] uppercase ${claro ? "text-agua-100" : "text-agua-700"}`}
          >
            {eslogan}
          </span>
          )}
        </span>
      )}
    </span>
  );
}
