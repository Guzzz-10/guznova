"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { login, type LoginState } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="username" className="a-label">
          Usuario
        </label>
        <input id="username" name="username" className="a-field" autoComplete="username" autoCapitalize="none" required autoFocus defaultValue={state?.username ?? ""} key={state?.username} />
      </div>
      <div>
        <label htmlFor="password" className="a-label">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            className="a-field pr-12"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-ink-400 hover:text-ink-700"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {state?.error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="a-btn-primary w-full !py-3 text-base">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogIn className="h-4 w-4" aria-hidden />}
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
