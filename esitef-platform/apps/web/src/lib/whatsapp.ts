const DEFAULT_WHATSAPP_NUMBER = "5493562670042";

export function getWhatsAppNumber() {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    DEFAULT_WHATSAPP_NUMBER
  );
}

export function buildWhatsAppUrl(message?: string, number?: string) {
  const phone = (number ?? getWhatsAppNumber()).replace(/\D/g, "");
  if (!phone) return null;
  const base = `https://wa.me/${phone}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export function getWhatsAppUrl(message?: string) {
  return buildWhatsAppUrl(message);
}
