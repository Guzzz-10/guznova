import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70svh] flex-col items-start justify-center">
      <p className="text-[12px] uppercase tracking-[0.24em] text-accent">404</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,7vw,5rem)]">Este auto ya se vendió.</h1>
      <Link href="/#catalogo" className="mt-8 text-muted underline-offset-4 hover:text-fg hover:underline">
        Ver el catálogo
      </Link>
    </div>
  );
}
