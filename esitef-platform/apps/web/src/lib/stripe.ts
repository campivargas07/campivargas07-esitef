import Stripe from "stripe";

let stripe: Stripe | undefined;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY no está configurada. Añádela en apps/web/.env.local (ver .env.example)."
    );
  }
  if (!stripe) {
    stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripe;
}
