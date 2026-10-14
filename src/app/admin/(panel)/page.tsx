import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, CircleCheck, Clock, MessageSquare, Plus, Settings, Star } from "lucide-react";
import { PageTitle } from "@/components/admin/PageTitle";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Inicio" };

export default async function DashboardPage() {
  const user = await requireAdmin();
  const [byStatus, featured, pending, recent] = await Promise.all([
    prisma.car.groupBy({ by: ["status"], _count: true }),
    prisma.car.count({ where: { featured: true } }),
    prisma.review.count({ where: { status: "PENDIENTE" } }),
    prisma.car.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
  ]);
  const count = (s: string) => byStatus.find((b) => b.status === s)?._count ?? 0;
  const published = count("DISPONIBLE") + count("RESERVADO");

  const stats = [
    { label: "Autos publicados", value: published, hint: `${count("DISPONIBLE")} disponibles · ${count("RESERVADO")} reservados`, Icon: Car, color: "bg-nova-100 text-nova-700", href: "/admin/autos" },
    { label: "Autos vendidos", value: count("VENDIDO"), hint: "Siguen visibles con la etiqueta Vendido", Icon: CircleCheck, color: "bg-emerald-100 text-emerald-700", href: "/admin/autos?estado=VENDIDO" },
    { label: "Reseñas pendientes", value: pending, hint: pending ? "Esperando tu aprobación" : "Todo al día", Icon: MessageSquare, color: pending ? "bg-amber-100 text-amber-700" : "bg-ink-100 text-ink-600", href: "/admin/resenas" },
    { label: "Autos destacados", value: featured, hint: "Aparecen primero en el inicio", Icon: Star, color: "bg-sky-100 text-sky-700", href: "/admin/autos" },
  ];

  return (
    <>
      <PageTitle
        title={`¡Hola, ${user.name || user.username}!`}
        description="Este es el resumen de tu automotora."
        action={
          <Link href="/admin/autos/nuevo" className="a-btn-primary !py-3 text-base">
            <Plus className="h-5 w-5" aria-hidden /> Agregar un auto
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, hint, Icon, color, href }) => (
          <Link key={label} href={href} className="a-card group p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-4 text-3xl font-bold text-ink-900">{value}</p>
            <p className="font-semibold text-ink-700">{label}</p>
            <p className="mt-0.5 text-xs text-ink-500">{hint}</p>
          </Link>
        ))}
      </div>

      {pending > 0 && (
        <Link
          href="/admin/resenas"
          className="mt-6 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 transition hover:bg-amber-100"
        >
          <Clock className="h-6 w-6 shrink-0" aria-hidden />
          <span className="flex-1">
            <strong>
              Tenés {pending} {pending === 1 ? "reseña nueva" : "reseñas nuevas"} para revisar.
            </strong>{" "}
            Solo se publican en el sitio cuando las aprobás.
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </Link>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="a-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900">Últimos autos modificados</h2>
            <Link href="/admin/autos" className="text-sm font-semibold text-nova-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-ink-500">Todavía no cargaste autos.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recent.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/autos/${c.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                    <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                      {c.images[0] && <Image src={c.images[0].url} alt="" fill sizes="64px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink-900">
                        {c.brand} {c.model} {c.year}
                      </span>
                      <span className="text-sm text-ink-500">{formatPrice(c.price)}</span>
                    </span>
                    <AdminStatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">Accesos rápidos</h2>
          <div className="grid gap-2">
            {[
              { href: "/admin/autos/nuevo", label: "Publicar un auto nuevo", Icon: Plus },
              { href: "/admin/resenas", label: "Revisar reseñas", Icon: MessageSquare },
              { href: "/admin/configuracion", label: "Cambiar WhatsApp, horarios o redes", Icon: Settings },
            ].map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5 font-semibold text-ink-700 transition hover:border-nova-300 hover:bg-nova-50">
                <Icon className="h-5 w-5 text-nova-600" aria-hidden />
                <span className="flex-1">{label}</span>
                <ArrowRight className="h-4 w-4 text-ink-400" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
