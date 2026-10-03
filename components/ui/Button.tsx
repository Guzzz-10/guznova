"use client";

import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { HashLink } from "./HashLink";
import { Magnetic } from "./Magnetic";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "light";
  external?: boolean;
  type?: "button" | "submit";
  className?: string;
  arrow?: boolean;
};

const styles = {
  primary: "bg-accent text-ink hover:bg-[#d8bc92]",
  ghost: "border border-white/15 text-fg hover:bg-white/[0.06]",
  light: "bg-ink text-paper hover:bg-black",
};

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  external,
  type = "button",
  className,
  arrow = true,
}: Props) {
  const cls = cn(
    "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-medium tracking-tight transition-colors duration-500",
    styles[variant],
    className,
  );
  const inner = (
    <>
      {children}
      {arrow && (
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.75}
        />
      )}
    </>
  );

  return (
    <Magnetic>
      {href ? (
        external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
            {inner}
          </a>
        ) : (
          <HashLink href={href} className={cls} onClick={onClick}>
            {inner}
          </HashLink>
        )
      ) : (
        <button type={type} onClick={onClick} className={cls}>
          {inner}
        </button>
      )}
    </Magnetic>
  );
}
