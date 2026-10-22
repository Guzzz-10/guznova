import { describe, expect, it } from "vitest";
import { digitoVerificador, validarCedula } from "./cedula";

describe("cédula uruguaya", () => {
  it("calcula el dígito verificador", () => {
    expect(digitoVerificador("1234567")).toBe(2);
    expect(digitoVerificador("123456")).toBe(digitoVerificador("0123456"));
  });
  it("valida con y sin formato", () => {
    expect(validarCedula("1.234.567-2")).toBe(true);
    expect(validarCedula("12345672")).toBe(true);
    expect(validarCedula("1.234.567-3")).toBe(false);
    expect(validarCedula("123")).toBe(false);
  });
});
