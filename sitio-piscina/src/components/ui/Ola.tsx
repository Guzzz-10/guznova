/**
 * Divisor de sección con forma de ola.
 * El color se controla con una clase text-* (usa currentColor).
 */
type Props = { className?: string; invertida?: boolean; variante?: 1 | 2 | 3 };

const caminos = {
  1: "M0,64 C180,112 360,16 540,48 C720,80 900,128 1080,96 C1260,64 1350,32 1440,40 L1440,120 L0,120 Z",
  2: "M0,80 C240,24 480,24 720,64 C960,104 1200,104 1440,56 L1440,120 L0,120 Z",
  3: "M0,96 C160,56 320,40 480,64 C640,88 800,112 960,88 C1120,64 1280,40 1440,72 L1440,120 L0,120 Z",
};

export function Ola({ className = "text-white", invertida = false, variante = 1 }: Props) {
  return (
    <div aria-hidden="true" className={`pointer-events-none relative -my-px leading-[0] ${invertida ? "rotate-180" : ""} ${className}`}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-12 w-full sm:h-16 lg:h-20">
        <path d={caminos[variante]} fill="currentColor" />
      </svg>
    </div>
  );
}

/** Olas animadas (para el hero): tres capas que se desplazan a distintas velocidades. */
export function OlasAnimadas({ className = "text-white" }: { className?: string }) {
  const ola = "M0,40 C120,70 240,10 360,40 C480,70 600,10 720,40 C840,70 960,10 1080,40 C1200,70 1320,10 1440,40 L1440,100 L0,100 Z";
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 overflow-hidden sm:h-32 ${className}`}>
      {[
        { op: 0.35, dur: "18s", y: "0px", rev: true },
        { op: 0.55, dur: "12s", y: "10px", rev: false },
        { op: 1, dur: "8s", y: "22px", rev: true },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute inset-y-0 left-0 flex w-[200%] animate-olas"
          style={{
            opacity: c.op,
            animationDuration: c.dur,
            animationDirection: c.rev ? "reverse" : "normal",
            top: c.y,
          }}
        >
          {[0, 1].map((k) => (
            <svg key={k} viewBox="0 0 1440 100" preserveAspectRatio="none" className="h-full w-1/2">
              <path d={ola} fill="currentColor" />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}
