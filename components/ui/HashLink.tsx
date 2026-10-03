"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { scrollToHash } from "@/lib/lenis";

/** Link a "/#seccion" que hace scroll suave si ya estamos en la home. */
export function HashLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const h = typeof href === "string" ? href : "";
  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (pathname === "/" && h.startsWith("/#") && scrollToHash(h.slice(1))) {
          e.preventDefault();
        }
      }}
    />
  );
}
