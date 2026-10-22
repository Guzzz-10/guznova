import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRaiz({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-mar-50">{children}</div>;
}
