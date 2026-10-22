import { NextResponse, type NextRequest } from "next/server";
import { modoDemo } from "@/lib/entorno";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { esClaimAdmin } from "@/lib/admin/auth";
import { listarSocios } from "@/lib/admin/datos";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { formatoCedula, fecha } from "@/lib/formato";
import { etiquetaEstado, type EstadoSocio } from "@/lib/socio/tipos";

/** Descarga el listado de socios (con los filtros aplicados) como CSV para Excel. */
export async function GET(request: NextRequest) {
  // Los route handlers no pasan por el layout del panel: se valida acá también.
  if (!modoDemo) {
    const { data } = await (await supabaseServidor()).auth.getClaims();
    if (!esClaimAdmin(data?.claims)) return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
  }
  const p = request.nextUrl.searchParams;
  const [{ filas }, { planes }] = await Promise.all([
    listarSocios({ q: p.get("q") ?? undefined, estado: p.get("estado") ?? undefined, plan: p.get("plan") ?? undefined }, true),
    obtenerContenido(),
  ]);

  const celda = (v: unknown) => {
    const t = String(v ?? "");
    const seguro = /^[=+\-@]/.test(t) ? `'${t}` : t; // evita fórmulas en Excel
    return /[";\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
  };
  const encabezado = ["N.º socio", "Nombre completo", "Cédula", "Fecha de nacimiento", "Teléfono", "Email", "Plan", "Estado", "Vence", "Renovación automática", "Alta", "Notas"];
  const lineas = filas.map((s) =>
    [
      s.numero_socio ?? "",
      s.nombre_completo,
      formatoCedula(s.cedula),
      fecha(s.fecha_nacimiento),
      s.telefono,
      s.email,
      planes.find((x) => x.id === s.plan_id)?.nombre ?? s.plan_id,
      etiquetaEstado[s.estado_socio as EstadoSocio] ?? s.estado_socio,
      fecha(s.vence_el),
      s.renovacion_automatica ? "Sí" : "No",
      fecha(s.creado_el),
      s.notas ?? "",
    ]
      .map(celda)
      .join(";"),
  );
  // BOM + punto y coma: Excel en español lo abre con acentos y columnas bien.
  const csv = "﻿" + [encabezado.join(";"), ...lineas].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="socios-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
