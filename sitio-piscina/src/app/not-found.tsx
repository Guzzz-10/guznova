import Link from "next/link";

export default function NoEncontrado() {
  return (
    <main id="contenido" className="grid min-h-screen place-items-center bg-gradient-to-b from-agua-50 to-white p-6 text-center">
      <div>
        <p className="text-7xl" aria-hidden="true">
          🐠
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold text-mar-900">¡Ups! Esta página se fue nadando</h1>
        <p className="mt-2 text-mar-600">No encontramos lo que buscabas.</p>
        <Link href="/" className="btn btn-coral mt-6">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
