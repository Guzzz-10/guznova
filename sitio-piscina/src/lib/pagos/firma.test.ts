import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { crearReferencia, estadoLocal, leerReferencia, verificarFirmaMP } from "./firma";

describe("verificarFirmaMP", () => {
  const secreto = "secreto-de-prueba";
  const firmar = (manifiesto: string) => createHmac("sha256", secreto).update(manifiesto).digest("hex");

  it("acepta una firma válida", () => {
    const v1 = firmar("id:123456;request-id:abc-1;ts:1700000000;");
    expect(verificarFirmaMP({ xSignature: `ts=1700000000,v1=${v1}`, xRequestId: "abc-1", dataId: "123456", secreto })).toBe(true);
  });

  it("pasa a minúsculas los ids alfanuméricos", () => {
    const v1 = firmar("id:abc123;request-id:r;ts:1;");
    expect(verificarFirmaMP({ xSignature: `ts=1,v1=${v1}`, xRequestId: "r", dataId: "ABC123", secreto })).toBe(true);
  });

  it("rechaza firmas alteradas o incompletas", () => {
    const v1 = firmar("id:1;request-id:r;ts:1;");
    expect(verificarFirmaMP({ xSignature: `ts=1,v1=${v1}`, xRequestId: "r", dataId: "2", secreto })).toBe(false);
    expect(verificarFirmaMP({ xSignature: "ts=1", xRequestId: "r", dataId: "1", secreto })).toBe(false);
    expect(verificarFirmaMP({ xSignature: null, xRequestId: "r", dataId: "1", secreto })).toBe(false);
  });
});

describe("referencias y estados", () => {
  it("arma y lee la referencia externa", () => {
    const id = "6f1c2a8e-1111-4222-8333-944455556666";
    expect(leerReferencia(crearReferencia(id, "full"))).toEqual({ socioId: id, planId: "full" });
    expect(leerReferencia("cualquier-cosa")).toBeNull();
  });

  it("traduce los estados de Mercado Pago", () => {
    expect(estadoLocal("approved")).toBe("aprobado");
    expect(estadoLocal("in_process")).toBe("pendiente");
    expect(estadoLocal("rejected")).toBe("rechazado");
    expect(estadoLocal("refunded")).toBe("reembolsado");
  });
});
