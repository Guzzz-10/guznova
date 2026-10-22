import { CircleAlert, CircleCheck, Info } from "lucide-react";

const estilos = {
  info: { caja: "bg-agua-50 text-agua-900 ring-agua-200", Icono: Info, icono: "text-agua-600" },
  ok: { caja: "bg-emerald-50 text-emerald-900 ring-emerald-200", Icono: CircleCheck, icono: "text-emerald-600" },
  error: { caja: "bg-coral-50 text-coral-900 ring-coral-200", Icono: CircleAlert, icono: "text-coral-600" },
  alerta: { caja: "bg-sol-50 text-sol-900 ring-sol-300", Icono: CircleAlert, icono: "text-sol-600" },
};

export function Aviso({ tipo = "info", children, className = "" }: { tipo?: keyof typeof estilos; children: React.ReactNode; className?: string }) {
  const e = estilos[tipo];
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={`flex gap-3 rounded-2xl px-4 py-3 text-sm ring-1 ${e.caja} ${className}`}>
      <e.Icono className={`mt-0.5 size-5 shrink-0 ${e.icono}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
