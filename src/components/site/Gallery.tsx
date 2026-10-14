"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/cn";

type Img = { id: string; url: string; alt: string };

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export function Gallery({ images, title, sold = false }: { images: Img[]; title: string; sold?: boolean }) {
  const [[index, dir], setIndex] = useState<[number, number]>([0, 0]);
  const [open, setOpen] = useState(false);
  const count = images.length;

  const go = useCallback(
    (delta: number) => setIndex(([i]) => [(i + delta + count) % count, delta]),
    [count],
  );
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  if (count === 0) {
    return <div className="card-surface grid aspect-[16/10] place-items-center text-ink-500">Sin fotos por el momento</div>;
  }
  const current = images[index];

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-850">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={current.id}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            className="absolute inset-0 cursor-zoom-in"
            onClick={() => setOpen(true)}
          >
            <Image
              src={current.url}
              alt={current.alt || title}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 760px, 100vw"
              className={cn("pointer-events-none object-cover", sold && "grayscale-[50%]")}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/70 px-3 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-ink-950"
        >
          <Expand className="h-3.5 w-3.5" aria-hidden /> Ver en grande
        </button>

        {count > 1 && (
          <>
            <NavButton side="left" onClick={() => go(-1)} />
            <NavButton side="right" onClick={() => go(1)} />
            <span className="absolute bottom-3 right-3 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex([i, i > index ? 1 : -1])}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block h-16 w-24 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-32",
                  i === index ? "border-nova-500" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="128px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox open={open} onClose={() => setOpen(false)} images={images} index={index} dir={dir} go={go} title={title} />
    </div>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Foto anterior" : "Foto siguiente"}
      className={cn(
        "absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink-950/60 text-white backdrop-blur transition hover:bg-nova-500 hover:text-ink-950 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function Lightbox({
  open,
  onClose,
  images,
  index,
  dir,
  go,
  title,
}: {
  open: boolean;
  onClose: () => void;
  images: Img[];
  index: number;
  dir: number;
  go: (d: number) => void;
  title: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => setZoom(false), [index, open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose, go]);

  const setOriginFrom = (clientX: number, clientY: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setOrigin(`${((clientX - r.left) / r.width) * 100}% ${((clientY - r.top) / r.height) * 100}%`);
  };

  if (!mounted) return null;
  const img = images[index];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${title}`}
          className="fixed inset-0 z-[60] flex flex-col bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between gap-3 p-3 text-white sm:p-5">
            <p className="truncate text-sm text-ink-300">
              {title} · {index + 1} / {images.length}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => !z)}
                aria-label={zoom ? "Alejar" : "Acercar"}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                {zoom ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={img.id}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                drag={!zoom && images.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                className={cn("absolute inset-0", zoom ? "cursor-zoom-out touch-none" : "cursor-zoom-in")}
                onClick={(e) => {
                  setOriginFrom(e.clientX, e.clientY, e.currentTarget);
                  setZoom((z) => !z);
                }}
                onPointerMove={(e) => {
                  if (zoom) setOriginFrom(e.clientX, e.clientY, e.currentTarget);
                }}
              >
                <div
                  className="relative h-full w-full transition-transform duration-300 ease-out"
                  style={{ transform: zoom ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}
                >
                  <Image src={img.url} alt={img.alt || title} fill sizes="100vw" quality={90} className="pointer-events-none object-contain" draggable={false} />
                </div>
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && !zoom && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-nova-500 hover:text-ink-950"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Foto siguiente"
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-nova-500 hover:text-ink-950"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          <p className="p-3 text-center text-xs text-ink-500">
            {zoom ? "Mové el mouse o el dedo para recorrer la foto · tocá para alejar" : "Tocá la foto para hacer zoom · deslizá para cambiar de foto"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
