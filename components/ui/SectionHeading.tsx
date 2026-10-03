import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow, title, children, dark = false,
}: { eyebrow: string; title: ReactNode; children?: ReactNode; dark?: boolean }) {
  return (
    <div className="max-w-2xl">
      <Reveal>
        <p className="mb-4 text-xs font-medium tracking-[0.22em] text-accent uppercase">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance">{title}</h2>
      </Reveal>
      {children && (
        <Reveal delay={0.16}>
          <p className={`mt-5 max-w-lg text-base leading-relaxed ${dark ? "text-white/60" : "text-mute"}`}>{children}</p>
        </Reveal>
      )}
    </div>
  );
}
