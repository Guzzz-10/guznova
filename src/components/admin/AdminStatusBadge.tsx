import { STATUS_LABEL, label } from "@/lib/constants";
import { cn } from "@/lib/cn";

const STYLES: Record<string, string> = {
  DISPONIBLE: "bg-emerald-100 text-emerald-800",
  RESERVADO: "bg-amber-100 text-amber-800",
  VENDIDO: "bg-rose-100 text-rose-800",
};

export function AdminStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", STYLES[status] ?? "bg-ink-100 text-ink-700")}>
      {label(STATUS_LABEL, status)}
    </span>
  );
}
