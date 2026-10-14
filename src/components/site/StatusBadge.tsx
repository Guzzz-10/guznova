import { STATUS_LABEL, type CarStatus } from "@/lib/constants";
import { cn } from "@/lib/cn";

const STYLES: Record<CarStatus, string> = {
  DISPONIBLE: "bg-ink-950/75 text-emerald-300 ring-emerald-400/40",
  RESERVADO: "bg-ink-950/75 text-amber-300 ring-amber-400/40",
  VENDIDO: "bg-ink-950/75 text-rose-300 ring-rose-400/40",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = (status in STYLES ? status : "DISPONIBLE") as CarStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 backdrop-blur-md",
        STYLES[s],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s === "DISPONIBLE" ? "bg-emerald-400" : s === "RESERVADO" ? "bg-amber-400" : "bg-rose-400")} />
      {STATUS_LABEL[s]}
    </span>
  );
}
