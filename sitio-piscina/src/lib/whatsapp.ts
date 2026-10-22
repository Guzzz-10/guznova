/** Arma un enlace https://wa.me/ con el mensaje pre-escrito. */
export function enlaceWhatsApp(numero: string, mensaje?: string) {
  const limpio = numero.replace(/\D/g, "");
  return mensaje ? `https://wa.me/${limpio}?text=${encodeURIComponent(mensaje)}` : `https://wa.me/${limpio}`;
}
