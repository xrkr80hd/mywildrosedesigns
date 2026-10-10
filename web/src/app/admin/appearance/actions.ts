"use server";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE, encodeAdminSession } from "@/lib/admin-session";
import { getAdminCredentials, isAdminAuthBypassed } from "@/lib/env";
import { saveAppearance } from "@/lib/appearance";
import { parseAppearance } from "@/lib/appearance-options";
export async function updateAppearance(form: FormData) {
  if (!isAdminAuthBypassed()) {
    const { username, password } = getAdminCredentials();
    const token = encodeAdminSession(username, password);
    const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
    const basic = (await headers()).get("authorization");
    if (!username || !password || (session !== token && basic !== `Basic ${token}`)) return { error: "Please sign in to admin again." };
  }
  try {
    await saveAppearance(parseAppearance({ bodyFont: form.get("bodyFont"), headingFont: form.get("headingFont"), bodySize: Number(form.get("bodySize")), headingScale: Number(form.get("headingScale")) }));
    revalidatePath("/", "layout");
    return { success: "Fonts saved. Your storefront now uses these settings." };
  } catch { return { error: "Settings could not be saved. Please try again." }; }
}
