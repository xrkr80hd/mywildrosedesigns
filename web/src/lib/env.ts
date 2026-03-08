const DEFAULT_SITE_URL = "http://localhost:3000";

function readRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function hasEnvValue(key: string): boolean {
  const value = process.env[key];
  return Boolean(value && value.trim().length > 0);
}

export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getUploadBucket(): string {
  return process.env.SUPABASE_UPLOAD_BUCKET ?? "design-uploads";
}

export function getSupabaseServerEnv() {
  return {
    supabaseUrl: readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseServiceRoleKey: readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getStripeServerEnv() {
  return {
    stripeSecretKey: readRequiredEnv("STRIPE_SECRET_KEY"),
    stripeWebhookSecret: readRequiredEnv("STRIPE_WEBHOOK_SECRET"),
  };
}

export function hasStripeSecretKey(): boolean {
  return hasEnvValue("STRIPE_SECRET_KEY");
}

export function hasStripeWebhookSecret(): boolean {
  return hasEnvValue("STRIPE_WEBHOOK_SECRET");
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "",
    password: process.env.ADMIN_PASSWORD ?? "",
  };
}
