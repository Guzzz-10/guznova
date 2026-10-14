"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CircleAlert, Loader2, Save, Star, Trash2 } from "lucide-react";
import { PhotoManager } from "./PhotoManager";
import { useConfirm, useToast } from "./Feedback";
import { deleteCar, discardUpload, saveCar } from "@/app/admin/(panel)/autos/actions";
import {
  BODY_TYPES,
  CAR_STATUS,
  FUELS,
  FUEL_LABEL,
  STATUS_LABEL,
  TRANSMISSIONS,
  TRANSMISSION_LABEL,
} from "@/lib/constants";
import { carSchema, fieldErrors } from "@/lib/validation";
import { cn } from "@/lib/cn";

export type CarFormValues = {
  brand: string;
  model: string;
  version: string;
  year: string;
  price: string;
  km: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  engine: string;
  doors: string;
  description: string;
  equipment: string;
  status: string;
  featured: boolean;
};

export const EMPTY_CAR: CarFormValues = {
  brand: "",
  model: "",
  version: "",
  year: String(new Date().getFullYear()),
  price: "",
  km: "",
  fuel: "NAFTA",
  transmission: "MANUAL",
  bodyType: "",
  color: "",
  engine: "",
  doors: "5",
  description: "",
  equipment: "",
  status: "DISPONIBLE",
  featured: false,
};

const STATUS_COLORS: Record<string, string> = {
  DISPONIBLE: "peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-800",
  RESERVADO: "peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-800",
  VENDIDO: "peer-checked:border-rose-500 peer-checked:bg-rose-50 peer-checked:text-rose-800",
};

export function CarForm({
  id,
  initial,
  initialImages = [],
  brands,
}: {
  id?: string;
  initial: CarFormValues;
  initialImages?: string[];
  brands: string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [values, setValues] = useState(initial);
  const [images, setImages] = useState<string[]>(initialImages);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [dirty, setDirty] = useState(false);
  const original = useRef(new Set(initialImages));

  // Aviso si se intenta salir con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = <K extends keyof CarFormValues>(key: K, value: CarFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const updateImages: typeof setImages = (next) => {
    setImages(next);
    setDirty(true);
  };

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
    setDirty(true);
    // Si la foto se subió recién (todavía no estaba guardada), la borramos del servidor.
    if (!original.current.has(url)) discardUpload(url).catch(() => {});
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = carSchema.safeParse({ ...values });
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      toast("error", "Revisá los campos marcados en rojo.");
      document.getElementById(`car-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    if (images.length === 0 && !id) {
      toast("error", "Agregá al menos una foto antes de publicar.");
      document.getElementById("fotos")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    startSaving(async () => {
      try {
        const r = await saveCar({ id, data: parsed.data, images });
        if (!r.ok) {
          if (r.errors) setErrors(r.errors);
          toast("error", r.message);
          return;
        }
        setDirty(false);
        original.current = new Set(images);
        toast("success", r.message);
        if (!id) router.push("/admin/autos");
        else router.refresh();
      } catch {
        toast("error", "No se pudo guardar. Revisá tu conexión y probá de nuevo.");
      }
    });
  }

  async function onDelete() {
    if (!id) return;
    const ok = await confirm({
      title: "¿Eliminar este auto?",
      message: "Se borrará del sitio junto con todas sus fotos. Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
      danger: true,
    });
    if (!ok) return;
    startDeleting(async () => {
      const r = await deleteCar(id);
      toast(r.ok ? "success" : "error", r.message);
      if (r.ok) {
        setDirty(false);
        router.push("/admin/autos");
      }
    });
  }

  const field = (key: keyof CarFormValues) => ({
    id: `car-${key}`,
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `car-${key}-err` : undefined,
    className: cn("a-field", errors[key] && "border-red-400 focus:border-red-500 focus:ring-red-500/20"),
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 pb-24">
      <Section title="Fotos" description="Subí todas las fotos que quieras. La primera es la que se ve en el catálogo." id="fotos">
        <PhotoManager images={images} onChange={updateImages} onRemove={removeImage} />
      </Section>

      <Section title="Datos principales">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Marca" error={errors.brand} name="brand">
            <input {...field("brand")} list="brand-list" value={values.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Ej. Toyota" />
            <datalist id="brand-list">
              {brands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </Field>
          <Field label="Modelo" error={errors.model} name="model">
            <input {...field("model")} value={values.model} onChange={(e) => set("model", e.target.value)} placeholder="Ej. Corolla" />
          </Field>
          <Field label="Versión" error={errors.version} name="version" optional>
            <input {...field("version")} value={values.version} onChange={(e) => set("version", e.target.value)} placeholder="Ej. XEI 2.0 CVT" />
          </Field>
          <Field label="Año" error={errors.year} name="year">
            <input {...field("year")} inputMode="numeric" value={values.year} onChange={(e) => set("year", e.target.value.replace(/\D/g, "").slice(0, 4))} />
          </Field>
          <Field label="Precio (USD)" error={errors.price} name="price" help="Solo números, sin puntos.">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-400">USD</span>
              <input {...field("price")} inputMode="numeric" value={values.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} className={cn(field("price").className, "pl-14")} placeholder="18900" />
            </div>
          </Field>
          <Field label="Kilómetros" error={errors.km} name="km" help="Solo números, sin puntos.">
            <input {...field("km")} inputMode="numeric" value={values.km} onChange={(e) => set("km", e.target.value.replace(/\D/g, ""))} placeholder="45000" />
          </Field>
        </div>
      </Section>

      <Section title="Características">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Combustible" error={errors.fuel} name="fuel">
            <select {...field("fuel")} value={values.fuel} onChange={(e) => set("fuel", e.target.value)}>
              {FUELS.map((f) => (
                <option key={f} value={f}>
                  {FUEL_LABEL[f]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Transmisión" error={errors.transmission} name="transmission">
            <select {...field("transmission")} value={values.transmission} onChange={(e) => set("transmission", e.target.value)}>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {TRANSMISSION_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Carrocería" error={errors.bodyType} name="bodyType" optional>
            <select {...field("bodyType")} value={values.bodyType} onChange={(e) => set("bodyType", e.target.value)}>
              <option value="">Sin especificar</option>
              {BODY_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Motor" error={errors.engine} name="engine">
            <input {...field("engine")} value={values.engine} onChange={(e) => set("engine", e.target.value)} placeholder="Ej. 1.6 nafta 110 HP" />
          </Field>
          <Field label="Color" error={errors.color} name="color">
            <input {...field("color")} value={values.color} onChange={(e) => set("color", e.target.value)} placeholder="Ej. Gris plata" />
          </Field>
          <Field label="Puertas" error={errors.doors} name="doors">
            <select {...field("doors")} value={values.doors} onChange={(e) => set("doors", e.target.value)}>
              {[2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Descripción y equipamiento">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Descripción" error={errors.description} name="description" optional help="Contá el estado del auto, services, dueños, etc.">
            <textarea {...field("description")} rows={7} value={values.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Equipamiento" error={errors.equipment} name="equipment" optional help="Escribí un ítem por renglón (Enter para pasar al siguiente).">
            <textarea {...field("equipment")} rows={7} value={values.equipment} onChange={(e) => set("equipment", e.target.value)} placeholder={"Aire acondicionado\nDirección asistida\n6 airbags"} />
          </Field>
        </div>
      </Section>

      <Section title="Publicación">
        <fieldset>
          <legend className="a-label">Estado</legend>
          <div className="grid grid-cols-3 gap-2 sm:max-w-lg">
            {CAR_STATUS.map((s) => (
              <label key={s} className="cursor-pointer">
                <input type="radio" name="status" value={s} checked={values.status === s} onChange={() => set("status", s)} className="peer sr-only" />
                <span
                  className={cn(
                    "block rounded-xl border-2 border-ink-200 bg-white px-3 py-3 text-center text-sm font-bold text-ink-600 transition peer-focus-visible:ring-2 peer-focus-visible:ring-nova-400",
                    STATUS_COLORS[s],
                  )}
                >
                  {STATUS_LABEL[s]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="mt-5 flex cursor-pointer items-center gap-4 rounded-2xl border border-ink-200 p-4 sm:max-w-lg">
          <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} className="peer sr-only" />
          <span className="relative h-7 w-12 shrink-0 rounded-full bg-ink-200 transition peer-checked:bg-nova-500 peer-focus-visible:ring-2 peer-focus-visible:ring-nova-400 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
          <span>
            <span className="flex items-center gap-1.5 font-semibold text-ink-900">
              <Star className="h-4 w-4 text-nova-500" aria-hidden /> Auto destacado
            </span>
            <span className="text-sm text-ink-500">Aparece primero en la página de inicio.</span>
          </span>
        </label>
      </Section>

      {/* Barra de acciones fija */}
      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-ink-100 bg-white/95 p-3 backdrop-blur lg:bottom-0 lg:left-[260px]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 lg:px-6">
          {id && (
            <button type="button" onClick={onDelete} disabled={deleting || saving} className="a-btn border border-red-200 bg-white text-red-600 hover:bg-red-50">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          )}
          {Object.keys(errors).length > 0 && (
            <p className="hidden items-center gap-1.5 text-sm font-medium text-red-600 md:flex">
              <CircleAlert className="h-4 w-4" aria-hidden /> Hay campos para revisar
            </p>
          )}
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => router.push("/admin/autos")} className="a-btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving || deleting} className="a-btn-primary min-w-40 !py-3 text-base">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
              {saving ? "Guardando…" : id ? "Guardar cambios" : "Publicar auto"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Section({ title, description, children, id }: { title: string; description?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="a-card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  error,
  help,
  optional,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  help?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`car-${name}`} className="a-label">
        {label} {optional && <span className="font-normal text-ink-400">(opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`car-${name}-err`} className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600">
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden /> {error}
        </p>
      ) : (
        help && <p className="a-help">{help}</p>
      )}
    </div>
  );
}
