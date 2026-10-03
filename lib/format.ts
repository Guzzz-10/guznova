const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const usd = (n: number) => `USD ${miles(n)}`;
export const num = miles;
export const km = (n: number) => `${miles(n)} km`;
