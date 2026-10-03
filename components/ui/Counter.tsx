"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ease } from "@/lib/motion";
import { num } from "@/lib/format";

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el) return;
    if (reduce) { el.textContent = num(to); return; }
    const c = animate(0, to, { duration: 2.2, ease, onUpdate: (v) => { el.textContent = num(v); } });
    return () => c.stop();
  }, [inView, to, reduce]);

  return <span><span ref={ref}>0</span>{suffix}</span>;
}
