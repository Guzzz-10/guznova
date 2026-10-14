import { PageTitle } from "@/components/admin/PageTitle";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";
import { siteUrl } from "@/lib/site";

export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <>
      <PageTitle title="Configuración del negocio" description="Cambiá el WhatsApp, la dirección, los horarios y las redes sin tocar código." />
      <SettingsForm initial={settings} sampleLink={siteUrl("/autos/ejemplo")} />
      <div className="mt-6">
        <PasswordForm />
      </div>
    </>
  );
}
