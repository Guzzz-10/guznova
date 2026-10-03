import Link from "next/link";
import type { ReactNode } from "react";
import { Magnetic } from "./Magnetic";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "light" | "outline" | "outline-light";
  external?: boolean;
  className?: string;
};

const styles = {
  solid: "bg-ink text-paper hover:bg-ink/85",
  light: "bg-paper text-ink hover:bg-white",
  outline: "border border-ink/20 text-ink hover:border-ink",
  "outline-light": "border border-white/25 text-white hover:border-white",
};

export function Button({ children, href, onClick, type = "button", variant = "solid", external, className = "" }: Props) {
  const cls = `inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium tracking-tight transition-colors duration-300 ${styles[variant]} ${className}`;
  return (
    <Magnetic>
      {href ? (
        external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
        ) : href.startsWith("#") ? (
          <a href={href} className={cls}>{children}</a>
        ) : (
          <Link href={href} className={cls}>{children}</Link>
        )
      ) : (
        <button type={type} onClick={onClick} className={cls}>{children}</button>
      )}
    </Magnetic>
  );
}
