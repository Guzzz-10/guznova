/** Burbujas que suben (decorativas, solo CSS). Valores fijos para que SSR y cliente coincidan. */
const semillas = [
  { x: 6, s: 14, dur: 13, delay: 0, deriva: 18 },
  { x: 14, s: 8, dur: 10, delay: 3, deriva: -12 },
  { x: 23, s: 22, dur: 16, delay: 6, deriva: 26 },
  { x: 31, s: 10, dur: 11, delay: 1.5, deriva: -20 },
  { x: 42, s: 16, dur: 14, delay: 8, deriva: 14 },
  { x: 53, s: 7, dur: 9, delay: 4.5, deriva: -10 },
  { x: 61, s: 26, dur: 18, delay: 2, deriva: 30 },
  { x: 70, s: 12, dur: 12, delay: 9, deriva: -16 },
  { x: 79, s: 18, dur: 15, delay: 5, deriva: 22 },
  { x: 88, s: 9, dur: 10, delay: 7, deriva: -14 },
  { x: 95, s: 13, dur: 13, delay: 11, deriva: 12 },
];

export function Burbujas({ cantidad = semillas.length, opacidad = 0.7, className = "" }: { cantidad?: number; opacidad?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {semillas.slice(0, cantidad).map((b, i) => (
        <span
          key={i}
          className="burbuja"
          style={
            {
              left: `${b.x}%`,
              width: b.s,
              height: b.s,
              "--dur": `${b.dur}s`,
              "--delay": `${b.delay}s`,
              "--deriva": `${b.deriva}px`,
              "--op": opacidad,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
