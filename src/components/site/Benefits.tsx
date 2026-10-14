import { HandCoins, Repeat, ShieldCheck, FileCheck2 } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/Motion";

const ITEMS = [
  {
    Icon: HandCoins,
    title: "Financiación a tu medida",
    text: "Cuotas en dólares o pesos con entrega mínima. Te armamos un plan que se adapte a tu bolsillo.",
  },
  {
    Icon: ShieldCheck,
    title: "Autos revisados",
    text: "Cada auto pasa por una revisión mecánica y estética completa antes de publicarse.",
  },
  {
    Icon: Repeat,
    title: "Tomamos tu usado",
    text: "Tasamos tu auto en el momento y lo tomamos como parte de pago, con un valor justo.",
  },
  {
    Icon: FileCheck2,
    title: "Trámites sin estrés",
    text: "Nos encargamos de la transferencia y la documentación para que solo te preocupes por manejar.",
  },
];

export function Benefits() {
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ITEMS.map(({ Icon, title, text }) => (
        <StaggerItem key={title} className="h-full">
          <div className="group card-surface relative h-full overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-nova-500/30 motion-reduce:hover:translate-y-0">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-nova-500/0 blur-2xl transition duration-500 group-hover:bg-nova-500/20" aria-hidden />
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-nova-500/10 text-nova-400 ring-1 ring-nova-500/20 transition group-hover:scale-110 group-hover:bg-nova-500 group-hover:text-ink-950">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">{text}</p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
