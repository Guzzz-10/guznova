"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* el usuario canceló */
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiá el link:", url);
    }
  }

  return (
    <button type="button" onClick={share} className="btn-ghost w-full !py-3.5">
      {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">{copied ? "¡Link copiado!" : "Compartir"}</span>
    </button>
  );
}
