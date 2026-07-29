const DEFAULT_WHATSAPP_NUMBER = "5493562435884";

/** Floating button only — rest of the site keeps getWhatsAppNumber(). */
const FLOATING_NUMBER_BY_PATH: Record<string, string> = {
  "/autonomia-motriz-adultos-mayores-cordoba": "5492617138395",
};

export function getWhatsAppNumber() {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    DEFAULT_WHATSAPP_NUMBER
  );
}

export function getFloatingWhatsAppNumber(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return FLOATING_NUMBER_BY_PATH[path] ?? getWhatsAppNumber();
}

export function buildWhatsAppUrl(message?: string, number?: string) {
  const phone = (number ?? getWhatsAppNumber()).replace(/\D/g, "");
  if (!phone) return null;
  const base = `https://wa.me/${phone}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export function getWhatsAppUrl(message?: string, number?: string) {
  return buildWhatsAppUrl(message, number);
}
