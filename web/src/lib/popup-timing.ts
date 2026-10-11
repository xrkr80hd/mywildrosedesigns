import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_POPUP_TIMING, parsePopupTiming, type PopupTiming } from "@/lib/popup-timing-options";
const TITLE = "site-setting::popup_timing";
export async function readPopupTimingRecord() {
  const result = await getSupabaseAdminClient().from("welcome_posts").select("id,body,updated_at").eq("title", TITLE).eq("active", false).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (result.error) throw new Error("Popup settings are unavailable. No changes were made.");
  try { return { record: result.data, timing: result.data ? parsePopupTiming(JSON.parse(result.data.body)) : DEFAULT_POPUP_TIMING }; }
  catch { throw new Error("Saved popup settings could not be read. No changes were made."); }
}
export async function getPopupTiming() { try { return (await readPopupTimingRecord()).timing; } catch { return DEFAULT_POPUP_TIMING; } }
export async function savePopupTiming(value: PopupTiming) {
  const { record } = await readPopupTimingRecord();
  const payload = { title: TITLE, body: JSON.stringify(parsePopupTiming(value)), active: false, sort_order: 9000, cta_label: null, cta_href: null };
  const db = getSupabaseAdminClient();
  const result = record ? await db.from("welcome_posts").update(payload).eq("id", record.id).eq("body", record.body).eq("updated_at", record.updated_at).select("id") : await db.from("welcome_posts").insert(payload).select("id");
  if (result.error || !result.data?.length) throw new Error("Popup settings changed elsewhere or could not save. Refresh and try again.");
}
