/** Encabezado estándar de sección: etiqueta + título + bajada. */
type Props = {
  etiqueta: string;
  titulo: React.ReactNode;
  bajada?: React.ReactNode;
  claro?: boolean;
  centrado?: boolean;
  id?: string;
};

export function Encabezado({ etiqueta, titulo, bajada, claro = false, centrado = true, id }: Props) {
  return (
    <div className={`${centrado ? "mx-auto text-center" : ""} max-w-2xl`} data-reveal>
      <p
        className={`chip mb-4 ${claro ? "bg-white/15 text-white ring-1 ring-white/30" : "bg-agua-50 text-agua-800 ring-1 ring-agua-200"}`}
      >
        {etiqueta}
      </p>
      <h2 id={id} className={`titulo-seccion ${claro ? "text-white" : "text-mar-900"}`}>
        {titulo}
      </h2>
      {bajada && <p className={`mt-4 text-lg ${claro ? "text-mar-100" : "text-mar-700"}`}>{bajada}</p>}
    </div>
  );
}
