"use client";

import Image from "next/image";
import { useState } from "react";
import { Car } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  label?: string;
  quiet?: boolean;
};

/** Foto con placeholder elegante detrás: si la imagen no carga, el sitio sigue viéndose bien. */
export function SafeImage({ src, alt, sizes, priority, className = "", label, quiet }: Props) {
  const [error, setError] = useState(false);
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(120%_100%_at_30%_20%,#2a2a2d_0%,#141416_55%,#0b0b0c_100%)] text-white/25"
      >
        {!quiet && <Car strokeWidth={1} className="h-10 w-10" />}
        {label && !quiet && <span className="text-xs tracking-[0.2em] uppercase">{label}</span>}
      </div>
      {!error && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setError(true)}
          className={`object-cover ${className}`}
        />
      )}
    </>
  );
}
