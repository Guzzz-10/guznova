/** Ilustraciones decorativas (SVG livianos). */
type P = { className?: string; style?: React.CSSProperties };

export const Salvavidas = ({ className = "size-24", style }: P) => (
  <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#fff" />
    {[0, 90, 180, 270].map((a) => (
      <path key={a} d="M50 4 A46 46 0 0 1 82.5 17.5 L64.1 35.9 A20 20 0 0 0 50 30 Z" fill="#f2563f" transform={`rotate(${a} 50 50)`} />
    ))}
    <circle cx="50" cy="50" r="20" fill="none" stroke="#e1effc" strokeWidth="2" />
    <circle cx="50" cy="50" r="46" fill="none" stroke="#0b2a4f" strokeOpacity=".08" strokeWidth="2" />
    <path d="M24 26 A36 36 0 0 1 44 15" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const PelotaPlaya = ({ className = "size-20", style }: P) => (
  <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#fff" />
    <path d="M50 4a46 46 0 0 1 39.8 23L50 50Z" fill="#ffc21f" />
    <path d="M89.8 73A46 46 0 0 1 50 96V50Z" fill="#1f7fd8" />
    <path d="M10.2 73A46 46 0 0 1 10.2 27L50 50Z" fill="#f2563f" />
    <circle cx="50" cy="50" r="7" fill="#fff" stroke="#0b2a4f" strokeOpacity=".1" />
    <ellipse cx="32" cy="24" rx="10" ry="5" fill="#fff" opacity=".6" transform="rotate(-30 32 24)" />
  </svg>
);

export const SolSonriente = ({ className = "size-20", style }: P) => (
  <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x="47" y="2" width="6" height="16" rx="3" fill="#ffc21f" transform={`rotate(${i * 36} 50 50)`} />
    ))}
    <circle cx="50" cy="50" r="28" fill="#ffd54a" />
    <circle cx="41" cy="46" r="3.2" fill="#0b2a4f" />
    <circle cx="59" cy="46" r="3.2" fill="#0b2a4f" />
    <path d="M39 57q11 10 22 0" fill="none" stroke="#0b2a4f" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="35" cy="56" r="4" fill="#ff8370" opacity=".6" />
    <circle cx="65" cy="56" r="4" fill="#ff8370" opacity=".6" />
  </svg>
);

export const Gota = ({ className = "size-8", style }: P) => (
  <svg viewBox="0 0 24 32" className={className} style={style} aria-hidden="true">
    <path d="M12 1C12 1 2 13 2 20a10 10 0 0 0 20 0C22 13 12 1 12 1Z" fill="currentColor" />
    <ellipse cx="8" cy="20" rx="2.2" ry="3.6" fill="#fff" opacity=".55" />
  </svg>
);
