import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/ui/BrandIcons";
import type { Settings } from "@/lib/settings-defaults";

export function SocialLinks({ settings }: { settings: Settings }) {
  const links = [
    { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.tiktok, label: "TikTok", Icon: TikTokIcon },
  ].filter((l) => l.href);
  if (!links.length) return null;
  return (
    <ul className="flex gap-2">
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} de AutoNova`}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-200 transition hover:-translate-y-0.5 hover:border-nova-500/50 hover:text-nova-400"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
