"use server";
import { savePopupTiming } from "@/lib/popup-timing";
import { parsePopupTiming } from "@/lib/popup-timing-options";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, encodeAdminSession } from "@/lib/admin-session";
import { getAdminCredentials, isAdminAuthBypassed } from "@/lib/env";
import { getMediaRegistry, isSafeMediaUrl, saveMediaRegistry } from "@/lib/media-management";

export async function updateMedia(form: FormData) {
  const { username, password } = getAdminCredentials();
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!isAdminAuthBypassed() && (!username || !password || token !== encodeAdminSession(username, password))) throw new Error("Unauthorized.");
  const operation = String(form.get("operation") ?? "");
  const id = String(form.get("id") ?? "");
  const slot = String(form.get("slot") ?? "");
  let message = "Media saved.";
  try {
    const registry = await getMediaRegistry(true);
    if (operation === "add") {
      const name = String(form.get("name") ?? "").trim();
      const url = String(form.get("url") ?? "").trim();
      if (!name || name.length > 120 || !isSafeMediaUrl(url) || registry.items.length >= 200) throw new Error("Enter a name and upload a valid image (maximum 200 images).");
      registry.items.push({ id: randomUUID(), name, url });
    } else if (operation === "replace") {
      const item = registry.items.find(item => item.id === id);
      const name = String(form.get("name") ?? "").trim();
      const url = String(form.get("url") ?? "").trim();
      if (!item || !name || name.length > 120 || !isSafeMediaUrl(url)) throw new Error("Choose an existing image and a valid replacement.");
      item.name = name;
      item.url = url;
      message = "Image replaced. Website assignments were preserved.";
    } else if (operation === "assign" && (slot === "logo" || slot === "hero")) {
      if (id && !registry.items.some(item => item.id === id)) throw new Error("Choose an image from the media collection.");
      registry[slot] = id || null;
    } else if (operation === "remove") {
      registry.items = registry.items.filter(item => item.id !== id);
      if (registry.logo === id) registry.logo = null;
      if (registry.hero === id) registry.hero = null;
      message = "Image removed from this collection. Assigned slots return to the original image. The stored file was preserved.";
    } else throw new Error("Invalid media action.");
    await saveMediaRegistry(registry);
  } catch (error) {
    redirect(`/admin/media?error=${encodeURIComponent(error instanceof Error ? error.message : "Unable to save media.")}`);
  }
  revalidatePath("/", "layout");
  redirect(`/admin/media?message=${encodeURIComponent(message)}`);
}

export async function updatePopupTiming(form: FormData) {
  const { username, password } = getAdminCredentials();
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!isAdminAuthBypassed() && (!username || !password || token !== encodeAdminSession(username, password))) throw new Error("Unauthorized.");
  try {
    const delaySeconds = Number(form.get("delaySeconds"));
    const fadeSeconds = Number(form.get("fadeSeconds"));
    if (!Number.isFinite(delaySeconds) || !Number.isFinite(fadeSeconds)) throw new Error("Enter valid timing values.");
    await savePopupTiming(parsePopupTiming({ delaySeconds, fadeSeconds }));
  } catch (error) { redirect(`/admin/media?error=${encodeURIComponent(error instanceof Error ? error.message : "Unable to save popup settings.")}`); }
  revalidatePath("/");
  redirect("/admin/media?message=Popup%20timing%20saved.");
}
