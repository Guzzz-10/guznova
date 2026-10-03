import { SplitText } from "./SplitText";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/cn";

type Props = {
  kicker: string;
  lines: string[];
  sub?: string;
  className?: string;
  tone?: "dark" | "light";
};

export function SectionHeading({ kicker, lines, sub, className, tone = "dark" }: Props) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Reveal>
        <p
          className={cn(
            "mb-5 text-[12px] font-medium uppercase tracking-[0.24em]",
            tone === "dark" ? "text-accent" : "text-ink/50",
          )}
        >
          {kicker}
        </p>
      </Reveal>
      <SplitText
        lines={lines}
        className="display text-[clamp(2.25rem,6.2vw,4.75rem)]"
      />
      {sub && (
        <Reveal delay={0.25}>
          <p
            className={cn(
              "mt-6 max-w-xl text-[17px] leading-relaxed",
              tone === "dark" ? "text-muted" : "text-ink/60",
            )}
          >
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}
