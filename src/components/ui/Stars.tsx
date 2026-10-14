import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-4 w-4", i <= rating ? "fill-nova-400 text-nova-400" : "text-ink-600")} aria-hidden />
      ))}
    </span>
  );
}
