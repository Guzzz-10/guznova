import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Valida la firma `x-signature` de los webhooks de Mercado Pago.
 * Plantilla oficial: id:[data.id];request-id:[x-request-id];ts:[ts];
 */
export function verificarFirmaMP({
  xSignature,
  xRequestId,
  dataId,
  secreto,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secreto: string;
}) {
  if (!xSignature) return false;
  const partes = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  let manifiesto = "";
  if (dataId) manifiesto += `id:${/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId};`;
  if (xRequestId) manifiesto += `request-id:${xRequestId};`;
  manifiesto += `ts:${ts};`;

  const esperado = createHmac("sha256", secreto).update(manifiesto).digest("hex");
  const a = Buffer.from(esperado, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Estado de Mercado Pago → estado de nuestro registro de pagos. */
export function estadoLocal(estadoMP: string): "aprobado" | "pendiente" | "rechazado" | "reembolsado" {
  switch (estadoMP) {
    case "approved":
      return "aprobado";
    case "refunded":
    case "charged_back":
      return "reembolsado";
    case "rejected":
    case "cancelled":
      return "rechazado";
    default:
      return "pendiente"; // pending, in_process, authorized, in_mediation
  }
}

/** external_reference = "<id del socio>|<id del plan>" */
export const crearReferencia = (socioId: string, planId: string) => `${socioId}|${planId}`;

export function leerReferencia(ref: string | null | undefined) {
  if (!ref) return null;
  const [socioId, planId] = ref.split("|");
  if (!/^[0-9a-f-]{36}$/i.test(socioId ?? "")) return null;
  return { socioId, planId: planId || null };
}
