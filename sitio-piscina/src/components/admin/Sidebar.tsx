"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, CreditCard, ExternalLink, FileText, LayoutDashboard, LogOut, Menu, ScanLine, Settings, Users, Wallet, X } from "lucide-react";
import { LogoIcono } from "@/components/ui/Logo";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";

export const menuPanel = [
  { href: "/admin", label: "Dashboard", Icono: LayoutDashboard },
  { href: "/admin/socios", label: "Socios", Icono: Users },
  { href: "/admin/ingresos", label: "Control de ingreso", Icono: ScanLine },
  { href: "/admin/pagos", label: "Pagos", Icono: Wallet },
  { href: "/admin/planes", label: "Planes", Icono: CreditCard },
  { href: "/admin/clases", label: "Clases y horarios", Icono: CalendarDays },
  { href: "/admin/contenido", label: "Contenido del sitio", Icono: FileText },
  { href: "/admin/configuracion", label: "Configuración", Icono: Settings },
];

export function Sidebar({ nombre, email }: { nombre: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const activo = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cerrar el menú al navegar
    setAbierto(false);
  }, [pathname]);

  const salir = async () => {
    if (!modoDemo) await supabaseNavegador().auth.signOut();
    router.replace("/admin/ingresar");
  };

  const contenido = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <LogoIcono className="size-10" />
        <div className="min-w-0">
          <p className="truncate font-display text-xl leading-none font-bold text-white">{nombre}</p>
          <p className="text-xs font-semibold tracking-wider text-agua-200 uppercase">Panel</p>
        </div>
      </div>
      <nav aria-label="Panel" className="flex-1 overflow-y-auto px-3">
        <ul className="grid gap-1">
          {menuPanel.map(({ href, label, Icono }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo(href) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 font-semibold transition ${activo(href) ? "bg-white text-mar-900 shadow-suave" : "text-mar-100 hover:bg-white/10"}`}
              >
                <Icono className={`size-5 ${activo(href) ? "text-agua-600" : "text-agua-300"}`} aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-2 border-t border-white/10 p-4">
        <p className="truncate text-xs text-mar-300" title={email}>
          {email}
        </p>
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-mar-100 hover:bg-white/10">
          <ExternalLink className="size-4" aria-hidden="true" /> Ver el sitio
        </Link>
        <button type="button" onClick={salir} className="flex items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-semibold text-coral-200 hover:bg-white/10">
          <LogOut className="size-4" aria-hidden="true" /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-mar-950 lg:block">{contenido}</aside>

      {/* Celular / tablet */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-mar-950 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <LogoIcono className="size-9" />
          <span className="font-display text-lg font-bold text-white">Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/ingresos" className="inline-flex items-center gap-1.5 rounded-xl bg-agua-600 px-3 py-2 text-sm font-semibold text-white">
            <ScanLine className="size-4" aria-hidden="true" /> Escanear
          </Link>
          <button type="button" onClick={() => setAbierto(true)} aria-label="Abrir menú" aria-expanded={abierto} className="grid size-10 place-items-center rounded-xl bg-white/10 text-white">
            <Menu className="size-5" />
          </button>
        </div>
      </div>
      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú del panel">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-mar-950/60" onClick={() => setAbierto(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-[entrar_0.25s_both] bg-mar-950">
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar menú" className="absolute top-4 right-3 grid size-10 place-items-center rounded-xl bg-white/10 text-white">
              <X className="size-5" />
            </button>
            {contenido}
          </aside>
        </div>
      )}
    </>
  );
}
