const usdFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const numFmt = new Intl.NumberFormat("es-AR");

export const usd = (n: number) => usdFmt.format(Math.round(n)).replace(/\s/g, " ");
export const km = (n: number) => (n === 0 ? "0 km" : `${numFmt.format(n)} km`);
export const num = (n: number) => numFmt.format(Math.round(n));
