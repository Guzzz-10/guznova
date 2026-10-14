import { Reveal } from "@/components/ui/Motion";

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="relative isolate overflow-hidden pb-10 pt-28 sm:pb-14 sm:pt-36">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-b" aria-hidden />
      <div className="absolute -top-32 right-0 -z-10 h-96 w-96 rounded-full bg-nova-500/15 blur-[110px]" aria-hidden />
      <div className="container">
        <Reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 text-4xl font-extrabold text-white text-balance sm:text-5xl lg:text-6xl">{title}</h1>
          {description && <p className="mt-4 max-w-2xl text-base text-ink-300 sm:text-lg">{description}</p>}
        </Reveal>
      </div>
    </section>
  );
}
