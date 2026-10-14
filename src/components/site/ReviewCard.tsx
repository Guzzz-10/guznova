import { Quote } from "lucide-react";
import { Stars } from "@/components/ui/Stars";
import { formatDate } from "@/lib/format";

export function ReviewCard({ review }: { review: { name: string; rating: number; comment: string; createdAt: Date } }) {
  const initials = review.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <figure className="card-surface relative flex h-full flex-col p-6">
      <Quote className="absolute right-5 top-5 h-8 w-8 text-white/5" aria-hidden />
      <Stars rating={review.rating} />
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-200">“{review.comment}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-nova-400 to-nova-700 text-sm font-bold text-ink-950">
          {initials}
        </span>
        <span>
          <span className="block font-semibold text-white">{review.name}</span>
          <span className="block text-xs text-ink-500">{formatDate(review.createdAt)}</span>
        </span>
      </figcaption>
    </figure>
  );
}
