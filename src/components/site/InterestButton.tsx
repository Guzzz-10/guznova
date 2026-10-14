import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { cn } from "@/lib/cn";

/** Botón "Me interesa": abre WhatsApp con el mensaje precargado del auto. */
export function InterestButton({ href, sold, className }: { href: string; sold?: boolean; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("btn-whatsapp group relative overflow-hidden !py-4 text-base", className)}
    >
      <span
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent motion-safe:group-hover:animate-shimmer"
        aria-hidden
      />
      <WhatsAppIcon className="relative h-5 w-5" />
      <span className="relative">{sold ? "Consultar por uno similar" : "Me interesa"}</span>
    </a>
  );
}
