import { Reveal } from "@/components/ui/Motion";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  action?: React.ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        "mb-10 flex flex-col gap-4 sm:mb-14",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div className={cn(align === "center" && "flex flex-col items-center")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-3 text-3xl font-bold text-white text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        {description && <p className="mt-4 max-w-2xl text-ink-300">{description}</p>}
      </div>
      {action}
    </Reveal>
  );
}
