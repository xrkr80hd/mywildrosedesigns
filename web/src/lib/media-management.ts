import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
const TITLE = "site-setting::media_registry";
export const DEFAULT_SITE_IMAGE = "/assets/img/MyWRDLogo.png";
export type MediaItem = { id: string; name: string; url: string };
export type MediaRegistry = { items: MediaItem[]; logo: string | null; hero: string | null };
export function emptyMediaRegistry(): MediaRegistry { return { items: [], logo: null, hero: null }; }
export function isSafeMediaUrl(value: string): boolean {
  try {
    if (value.startsWith("/assets/") && !value.includes("\\")) return true;
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && /\.(supabase\.co|supabase\.in)$/.test(url.hostname);
  } catch { return false; }
}
export async function getMediaRegistry(strict = false): Promise<MediaRegistry> {
  try {
    const result = await getSupabaseAdminClient().from("welcome_posts").select("body").eq("title", TITLE).eq("active", false).limit(1).maybeSingle();
    if (result.error) throw new Error("Unable to read media settings.");
    if (!result.data) return emptyMediaRegistry();
    const parsed = JSON.parse(result.data.body) as MediaRegistry;
    const items = Array.isArray(parsed.items) ? parsed.items.filter(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.url === "string" && isSafeMediaUrl(item.url)).slice(0, 200) : [];
    return { items, logo: items.some(item => item.id === parsed.logo) ? parsed.logo : null, hero: items.some(item => item.id === parsed.hero) ? parsed.hero : null };
  } catch (error) { if (strict) throw error; return emptyMediaRegistry(); }
}
export function mediaSlotUrl(registry: MediaRegistry, slot: "logo" | "hero"): string {
  return registry.items.find(item => item.id === registry[slot])?.url ?? DEFAULT_SITE_IMAGE;
}
export async function saveMediaRegistry(registry: MediaRegistry): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const existing = await supabase.from("welcome_posts").select("id").eq("title", TITLE).eq("active", false).limit(1).maybeSingle();
  if (existing.error) throw new Error("Unable to read media settings.");
  const payload = { title: TITLE, body: JSON.stringify(registry), active: false, sort_order: 9000, cta_label: null, cta_href: null };
  const result = existing.data ? await supabase.from("welcome_posts").update(payload).eq("id", existing.data.id) : await supabase.from("welcome_posts").insert(payload);
  if (result.error) throw new Error("Unable to save media settings.");
}
