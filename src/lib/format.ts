const nf = new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 });

export function formatNumber(n: number): string {
  return nf.format(n);
}

export function formatPrice(n: number): string {
  return `USD ${nf.format(n)}`;
}

export function formatKm(n: number): string {
  return n === 0 ? "0 km" : `${nf.format(n)} km`;
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("es-UY", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function carTitle(c: { brand: string; model: string; year?: number }): string {
  return `${c.brand} ${c.model}${c.year ? ` ${c.year}` : ""}`;
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
