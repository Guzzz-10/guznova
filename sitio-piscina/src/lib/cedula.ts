/**
 * Validación de cédula de identidad uruguaya (dígito verificador).
 * Acepta formatos con o sin puntos y guion: 1.234.567-2, 12345672.
 */
export function limpiarCedula(ci: string) {
  return ci.replace(/\D/g, "");
}

export function digitoVerificador(cuerpo: string) {
  const d = cuerpo.padStart(7, "0");
  const pesos = [2, 9, 8, 7, 6, 3, 4];
  const suma = pesos.reduce((acc, p, i) => acc + p * Number(d[i]), 0);
  return (10 - (suma % 10)) % 10;
}

export function validarCedula(ci: string) {
  const d = limpiarCedula(ci);
  if (d.length < 7 || d.length > 8) return false;
  const cuerpo = d.slice(0, -1);
  return digitoVerificador(cuerpo) === Number(d.slice(-1));
}
