"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { changePassword } from "@/app/admin/(panel)/configuracion/actions";
import { useToast } from "./Feedback";

export function PasswordForm() {
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const toast = useToast();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await changePassword(v);
      setErrors(r.errors ?? {});
      toast(r.ok ? "success" : "error", r.message);
      if (r.ok) setV({ current: "", next: "", confirm: "" });
    });
  }

  const fields = [
    { key: "current" as const, label: "Contraseña actual", auto: "current-password" },
    { key: "next" as const, label: "Nueva contraseña", auto: "new-password" },
    { key: "confirm" as const, label: "Repetir nueva contraseña", auto: "new-password" },
  ];

  return (
    <form onSubmit={onSubmit} className="a-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
        <KeyRound className="h-5 w-5 text-nova-600" aria-hidden /> Cambiar contraseña
      </h2>
      <p className="mt-0.5 text-sm text-ink-500">Usá al menos 8 caracteres. Recomendado si todavía usás la contraseña de demo.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={`pw-${f.key}`} className="a-label">
              {f.label}
            </label>
            <input
              id={`pw-${f.key}`}
              type="password"
              autoComplete={f.auto}
              value={v[f.key]}
              onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value }))}
              className="a-field"
              aria-invalid={!!errors[f.key]}
            />
            {errors[f.key] && <p className="mt-1.5 text-sm font-medium text-red-600">{errors[f.key]}</p>}
          </div>
        ))}
      </div>
      <button type="submit" disabled={pending} className="a-btn-secondary mt-5">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Actualizar contraseña
      </button>
    </form>
  );
}
