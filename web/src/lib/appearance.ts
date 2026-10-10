import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { hasSupabaseServerEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_APPEARANCE, parseAppearance, type Appearance } from "@/lib/appearance-options";
const TITLE = "site-setting::appearance";
export async function getAppearance(): Promise<Appearance> {
  noStore();
  if (!hasSupabaseServerEnv()) return DEFAULT_APPEARANCE;
  try {
    const { data, error } = await getSupabaseAdminClient().from("welcome_posts").select("body").eq("title", TITLE).eq("active", false).order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (error || !data) return DEFAULT_APPEARANCE;
    return parseAppearance(JSON.parse(data.body));
  } catch { return DEFAULT_APPEARANCE; }
}
export async function saveAppearance(value: Appearance) {
  if (!hasSupabaseServerEnv()) throw new Error("Site settings connection is unavailable.");
  const db = getSupabaseAdminClient();
  const existing = await db.from("welcome_posts").select("id").eq("title", TITLE).eq("active", false).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (existing.error) throw new Error("Could not read appearance settings.");
  const payload = { title: TITLE, body: JSON.stringify(parseAppearance(value)), active: false, sort_order: 9000, cta_label: null, cta_href: null };
  const result = existing.data ? await db.from("welcome_posts").update(payload).eq("id", existing.data.id) : await db.from("welcome_posts").insert(payload);
  if (result.error) throw new Error("Could not save appearance settings.");
}
