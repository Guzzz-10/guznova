import { useId } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  error?: string;
  ayuda?: React.ReactNode;
  extra?: React.ReactNode;
};

/** Campo de formulario accesible con etiqueta, ayuda y error. */
export function Campo({ etiqueta, error, ayuda, extra, className = "", ...props }: Props) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="etiqueta">
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={[ayuda ? idAyuda : "", error ? idError : ""].filter(Boolean).join(" ") || undefined}
          className="campo"
          {...props}
        />
        {extra}
      </div>
      {ayuda && !error && (
        <p id={idAyuda} className="mt-1.5 text-sm text-mar-500">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="mt-1.5 text-sm font-semibold text-coral-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
