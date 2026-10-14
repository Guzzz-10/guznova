"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, CircleCheck, Loader2, Send, Star } from "lucide-react";
import { submitReview, type ReviewFormState } from "@/app/(site)/resenas/actions";
import { fieldErrors, REVIEW_LIMITS, reviewSchema } from "@/lib/validation";
import { cn } from "@/lib/cn";

const RATING_TEXT = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

export function ReviewForm() {
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(submitReview, null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => setStartedAt(Date.now()), []);
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setRating(0);
      setComment("");
      setStartedAt(Date.now());
    }
  }, [state]);

  const errors = { ...(state?.errors ?? {}), ...clientErrors };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const parsed = reviewSchema.safeParse({
      name: fd.get("name") ?? "",
      rating: fd.get("rating") ?? "",
      comment: fd.get("comment") ?? "",
      privacy: fd.get("privacy") ?? undefined,
    });
    if (!parsed.success) {
      e.preventDefault();
      const errs = fieldErrors(parsed.error);
      setClientErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setClientErrors({});
  }

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot anti-spam: invisible para personas */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No completar este campo
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />

      <div>
        <label htmlFor="r-name" className="field-label">
          Tu nombre
        </label>
        <input
          id="r-name"
          name="name"
          className="field"
          placeholder="Ej. Martín R."
          maxLength={REVIEW_LIMITS.name[1]}
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "r-name-err" : undefined}
        />
        <FieldError id="r-name-err" message={errors.name} />
      </div>

      <fieldset>
        <legend className="field-label">Calificación</legend>
        <div className="flex items-center gap-3">
          <div className="flex" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Calificación de 1 a 5 estrellas">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hover || rating) >= n;
              return (
                <label key={n} className="cursor-pointer p-1" onMouseEnter={() => setHover(n)}>
                  <input
                    type="radio"
                    name="rating"
                    value={n}
                    checked={rating === n}
                    onChange={() => setRating(n)}
                    className="peer sr-only"
                    aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                  />
                  <motion.span
                    className="block rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-nova-400"
                    whileTap={{ scale: 0.8 }}
                    animate={{ scale: rating === n ? [1, 1.3, 1] : 1 }}
                  >
                    <Star className={cn("h-8 w-8 transition-colors", active ? "fill-nova-400 text-nova-400" : "text-ink-600")} aria-hidden />
                  </motion.span>
                </label>
              );
            })}
          </div>
          <span className="text-sm font-medium text-ink-300">{RATING_TEXT[hover || rating]}</span>
        </div>
        <FieldError id="r-rating-err" message={errors.rating} />
      </fieldset>

      <div>
        <label htmlFor="r-comment" className="field-label">
          Tu comentario
        </label>
        <textarea
          id="r-comment"
          name="comment"
          rows={5}
          className="field resize-y"
          placeholder="¿Cómo fue tu experiencia con AutoNova?"
          maxLength={REVIEW_LIMITS.comment[1]}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          aria-invalid={!!errors.comment}
          aria-describedby="r-comment-help"
        />
        <div className="mt-1 flex justify-between gap-3 text-xs">
          <FieldError id="r-comment-err" message={errors.comment} />
          <span id="r-comment-help" className="ml-auto text-ink-400">
            {comment.length}/{REVIEW_LIMITS.comment[1]}
          </span>
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-300">
          <input
            type="checkbox"
            name="privacy"
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-nova-500"
            aria-invalid={!!errors.privacy}
          />
          <span>
            Leí y acepto la{" "}
            <Link href="/privacidad" target="_blank" className="text-nova-400 underline underline-offset-2">
              Política de Privacidad
            </Link>
            . Entiendo que mi nombre y comentario se publicarán una vez aprobados.
          </span>
        </label>
        <FieldError id="r-privacy-err" message={errors.privacy} />
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full !py-3.5 text-base">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {pending ? "Enviando…" : "Enviar reseña"}
      </button>

      <AnimatePresence mode="wait">
        {state && (
          <motion.div
            key={state.message + String(state.ok)}
            role={state.ok ? "status" : "alert"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "flex gap-3 rounded-xl border p-4 text-sm",
              state.ok ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-rose-400/30 bg-rose-400/10 text-rose-200",
            )}
          >
            {state.ok ? <CircleCheck className="h-5 w-5 shrink-0" aria-hidden /> : <CircleAlert className="h-5 w-5 shrink-0" aria-hidden />}
            {state.message}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-300">
      <CircleAlert className="h-3.5 w-3.5" aria-hidden /> {message}
    </p>
  );
}
