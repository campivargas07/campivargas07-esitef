import { createHash } from "node:crypto";

export function normalizeMetaEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeMetaPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function hashMetaPii(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashMetaEmail(email: string): string {
  return hashMetaPii(normalizeMetaEmail(email));
}

export function hashMetaPhone(phone: string): string {
  const normalized = normalizeMetaPhone(phone);
  if (!normalized) return "";
  return hashMetaPii(normalized);
}
