/** Íconos de marcas (no incluidos en lucide). */
type P = { className?: string };

export const IconoWhatsApp = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="currentColor">
    <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.98L4 29l8.27-1.6a12.1 12.1 0 0 0 3.77.6C22.68 28 28 22.64 28 16.03 28 9.4 22.68 3 16.04 3Zm0 22.6c-1.2 0-2.39-.2-3.5-.6l-.25-.09-4.9.95.97-4.73-.17-.26a9.9 9.9 0 0 1-1.58-5.4c0-5.5 4.48-9.98 9.99-9.98 5.5 0 9.95 4.47 9.95 9.98 0 5.66-4.46 10.13-10.51 10.13Zm5.55-7.47c-.3-.15-1.8-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49a9.02 9.02 0 0 1-1.67-2.07c-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.24-.24-.58-.5-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.27.5 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.8-.73 2.04-1.44.26-.7.26-1.31.18-1.44-.07-.12-.27-.2-.57-.35Z" />
  </svg>
);

export const IconoInstagram = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconoFacebook = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.86.25-1.45 1.5-1.45h1.6V4.5c-.28-.04-1.22-.12-2.32-.12-2.3 0-3.88 1.4-3.88 3.98v2.14H8v3h2.4V21h3.1Z" />
  </svg>
);

export const IconoTikTok = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M16.6 3c.3 2.3 1.6 3.8 3.9 4v2.7c-1.4.1-2.6-.3-3.9-1.1v5.6c0 3.6-2.9 5.8-5.9 5.8-3.5 0-6.1-3.1-5.3-6.7.6-2.6 3-4.4 5.9-4.1v2.9c-.5-.1-.9-.2-1.4-.1-1.3.2-2.2 1.3-2 2.6.2 1.3 1.3 2.2 2.6 2 1.2-.1 2.1-1.2 2.1-2.4V3h3.9Z" />
  </svg>
);
