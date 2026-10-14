"use client";

import { useState, useTransition } from "react";
import { CircleAlert, ExternalLink, Loader2, Save } from "lucide-react";
import { saveSettings } from "@/app/admin/(panel)/configuracion/actions";
import { useToast } from "./Feedback";
import type { SettingKey, Settings } from "@/lib/settings-defaults";
import { carMessage, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

type FieldDef = {
  key: SettingKey;
  label: string;
  help?: string;
  placeholder?: string;
  textarea?: boolean;
  inputMode?: "numeric" | "tel" | "email" | "url";
};

const SECTIONS: { title: string; description?: string; fields: FieldDef[] }[] = [
  {
    title: "Datos de contacto",
    fields: [
      { key: "phone", label: "Teléfono", placeholder: "099 123 456", inputMode: "tel" },
      { key: "email", label: "Email", placeholder: "ventas@tuautomotora.com.uy", inputMode: "email" },
      { key: "address", label: "Dirección", placeholder: "Av. Italia 4520" },
      { key: "city", label: "Ciudad", placeholder: "Montevideo" },
      { key: "mapQuery", label: "Ubicación en el mapa", help: "Lo que escribirías en Google Maps para encontrar el local." },
      { key: "hours", label: "Horario de atención", textarea: true, help: "Un renglón por día o grupo de días." },
    ],
  },
  {
    title: "Redes sociales",
    description: "Pegá el link completo. Si dejás un campo vacío, ese ícono no se muestra.",
    fields: [
      { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tuautomotora", inputMode: "url" },
      { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/tuautomotora", inputMode: "url" },
      { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@tuautomotora", inputMode: "url" },
    ],
  },
  {
    title: "Números de la página de inicio",
    description: "Se muestran con un contador animado.",
    fields: [
      { key: "statsCarsSold", label: "Autos vendidos", inputMode: "numeric" },
      { key: "statsYears", label: "Años en el rubro", inputMode: "numeric" },
      { key: "statsClients", label: "% de clientes satisfechos", inputMode: "numeric" },
    ],
  },
  {
    title: "Datos de la empresa",
    description: "Aparecen en el pie de página y en las páginas legales.",
    fields: [
      { key: "businessName", label: "Nombre comercial" },
      { key: "legalName", label: "Razón social" },
      { key: "rut", label: "RUT" },
    ],
  },
];

export function SettingsForm({ initial, sampleLink }: { initial: Settings; sampleLink: string }) {
  const [values, setValues] = useState<Settings>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, start] = useTransition();
  const toast = useToast();

  const set = (key: SettingKey, v: string) => {
    setValues((s) => ({ ...s, [key]: v }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        const r = await saveSettings(values);
        setErrors(r.errors ?? {});
        toast(r.ok ? "success" : "error", r.message);
        if (r.errors) document.getElementById(`s-${Object.keys(r.errors)[0]}`)?.focus();
      } catch {
        toast("error", "No se pudo guardar. Probá de nuevo.");
      }
    });
  }

  const preview = carMessage(values.whatsappCarMessage, { brand: "Chevrolet", model: "Onix", year: 2021, price: 18900 }, sampleLink);
  const cleanNumber = values.whatsapp.replace(/\D/g, "");

  const input = (f: FieldDef) => {
    const common = {
      id: `s-${f.key}`,
      value: values[f.key],
      placeholder: f.placeholder,
      "aria-invalid": !!errors[f.key],
      className: cn("a-field", errors[f.key] && "border-red-400"),
    };
    return f.textarea ? (
      <textarea {...common} rows={3} onChange={(e) => set(f.key, e.target.value)} />
    ) : (
      <input {...common} inputMode={f.inputMode === "url" ? "url" : f.inputMode} onChange={(e) => set(f.key, e.target.value)} />
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 pb-24">
      <section className="a-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-ink-900">WhatsApp</h2>
        <p className="mt-0.5 text-sm text-ink-500">A este número llegan las consultas de los botones “Me interesa” y el botón flotante.</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <Label htmlFor="s-whatsapp">Número de WhatsApp</Label>
            <div className="flex gap-2">
              <input
                id="s-whatsapp"
                inputMode="tel"
                value={values.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                className={cn("a-field", errors.whatsapp && "border-red-400")}
                aria-invalid={!!errors.whatsapp}
              />
              <a href={waLink(cleanNumber, "Prueba desde el panel de AutoNova")} target="_blank" rel="noopener noreferrer" className="a-btn-secondary shrink-0" title="Abrir WhatsApp con este número">
                <ExternalLink className="h-4 w-4" aria-hidden /> Probar
              </a>
            </div>
            <Help error={errors.whatsapp}>
              Con código de país y sin espacios ni “+”. Ej: <strong>59899123456</strong> (598 + 99 123 456).
            </Help>
          </div>
          <div>
            <Label htmlFor="s-whatsappGenericMessage">Mensaje del botón general</Label>
            <textarea
              id="s-whatsappGenericMessage"
              rows={2}
              value={values.whatsappGenericMessage}
              onChange={(e) => set("whatsappGenericMessage", e.target.value)}
              className={cn("a-field", errors.whatsappGenericMessage && "border-red-400")}
            />
            <Help error={errors.whatsappGenericMessage}>Se usa en el botón flotante y en “Escribinos”.</Help>
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor="s-whatsappCarMessage">Mensaje automático de “Me interesa”</Label>
            <textarea
              id="s-whatsappCarMessage"
              rows={3}
              value={values.whatsappCarMessage}
              onChange={(e) => set("whatsappCarMessage", e.target.value)}
              className={cn("a-field", errors.whatsappCarMessage && "border-red-400")}
            />
            <Help error={errors.whatsappCarMessage}>
              Podés usar: <code className="rounded bg-ink-100 px-1">{"{auto}"}</code> (marca, modelo y año),{" "}
              <code className="rounded bg-ink-100 px-1">{"{precio}"}</code> y <code className="rounded bg-ink-100 px-1">{"{link}"}</code> (link a la ficha).
            </Help>
            <div className="mt-3 rounded-2xl bg-[#e7ffdb] p-4 text-sm text-ink-800">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">Vista previa</p>
              <p className="whitespace-pre-line break-words">{preview}</p>
            </div>
          </div>
        </div>
      </section>

      {SECTIONS.map((s) => (
        <section key={s.title} className="a-card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-ink-900">{s.title}</h2>
          {s.description && <p className="mt-0.5 text-sm text-ink-500">{s.description}</p>}
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {s.fields.map((f) => (
              <div key={f.key} className={cn(f.textarea && "sm:col-span-2 lg:col-span-1")}>
                <Label htmlFor={`s-${f.key}`}>{f.label}</Label>
                {input(f)}
                <Help error={errors[f.key]}>{f.help}</Help>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-ink-100 bg-white/95 p-3 backdrop-blur lg:bottom-0 lg:left-[260px]">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 lg:px-6">
          {Object.keys(errors).length > 0 && (
            <p className="mr-auto flex items-center gap-1.5 text-sm font-medium text-red-600">
              <CircleAlert className="h-4 w-4" aria-hidden /> Hay campos para revisar
            </p>
          )}
          <button type="submit" disabled={saving} className="a-btn-primary min-w-44 !py-3 text-base">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="a-label">
      {children}
    </label>
  );
}

function Help({ error, children }: { error?: string; children?: React.ReactNode }) {
  if (error)
    return (
      <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600">
        <CircleAlert className="h-4 w-4 shrink-0" aria-hidden /> {error}
      </p>
    );
  return children ? <p className="a-help">{children}</p> : null;
}
