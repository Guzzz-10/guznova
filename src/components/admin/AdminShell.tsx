"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, ExternalLink, LayoutDashboard, LogOut, MessageSquare, Settings } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Inicio", Icon: LayoutDashboard },
  { href: "/admin/autos", label: "Autos", Icon: Car },
  { href: "/admin/resenas", label: "Reseñas", Icon: MessageSquare },
  { href: "/admin/configuracion", label: "Configuración", Icon: Settings },
];

export function AdminShell({ children, pendingReviews, userName }: { children: React.ReactNode; pendingReviews: number; userName: string }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      {/* Barra lateral (escritorio) */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ink-100 bg-white p-5 lg:flex">
        <Link href="/admin" className="mb-8 px-2">
          <Logo light />
        </Link>
        <nav aria-label="Panel" className="flex-1 space-y-1">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold transition",
                active(href) ? "bg-nova-50 text-nova-800" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
              )}
            >
              <Icon className={cn("h-5 w-5", active(href) ? "text-nova-600" : "text-ink-400")} aria-hidden />
              {label}
              {href === "/admin/resenas" && pendingReviews > 0 && (
                <span className="ml-auto rounded-full bg-nova-500 px-2 py-0.5 text-xs font-bold text-ink-950">{pendingReviews}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-ink-100 pt-4">
          <p className="px-3 pb-2 text-xs text-ink-400">
            Sesión: <span className="font-semibold text-ink-600">{userName}</span>
          </p>
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">
            <ExternalLink className="h-4 w-4 text-ink-400" aria-hidden /> Ver sitio
          </a>
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="h-4 w-4" aria-hidden /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Barra superior (celular) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin">
          <Logo light className="scale-90 origin-left" />
        </Link>
        <div className="flex items-center gap-1">
          <a href="/" target="_blank" className="grid h-10 w-10 place-items-center rounded-xl text-ink-500 hover:bg-ink-50" aria-label="Ver sitio">
            <ExternalLink className="h-5 w-5" />
          </a>
          <form action={logout}>
            <button type="submit" className="grid h-10 w-10 place-items-center rounded-xl text-ink-500 hover:bg-red-50 hover:text-red-700" aria-label="Cerrar sesión">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="min-w-0 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Navegación inferior (celular) */}
      <nav aria-label="Panel" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-ink-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={cn("relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold", active(href) ? "text-nova-700" : "text-ink-500")}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label === "Configuración" ? "Ajustes" : label}
            {href === "/admin/resenas" && pendingReviews > 0 && (
              <span className="absolute right-[calc(50%-22px)] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-nova-500 px-1 text-[10px] font-bold text-ink-950">
                {pendingReviews}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
