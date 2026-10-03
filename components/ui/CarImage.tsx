"use client";

import Image from "next/image";
import { Car } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Sin ícono en el placeholder (p. ej. hero) */
  bare?: boolean;
};

/** next/image con un placeholder elegante si la foto no carga. */
export function CarImage({ src, alt, label, className, sizes, priority, bare }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden bg-[radial-gradient(120%_90%_at_30%_10%,#24221f_0%,#121214_55%,#0b0b0c_100%)]",
          className,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_100%,rgb(200_169_126/0.14),transparent)]" />
        {!bare && <Car className="relative h-10 w-10 text-accent/70" strokeWidth={0.8} />}
        {label && (
          <span className="relative px-4 text-center text-[11px] uppercase tracking-[0.22em] text-muted">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailedSrc(src)}
      className={cn("object-cover", className)}
    />
  );
}
