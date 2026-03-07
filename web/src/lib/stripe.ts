import Stripe from "stripe";
import { getStripeServerEnv } from "@/lib/env";

let stripeClient: Stripe | undefined;

export function getStripeServerClient() {
  if (!stripeClient) {
    const { stripeSecretKey } = getStripeServerEnv();
    stripeClient = new Stripe(stripeSecretKey);
  }

  return stripeClient;
}
