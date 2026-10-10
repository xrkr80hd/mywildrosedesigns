import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
async function load(result) {
  let source = await readFile(new URL("../src/lib/media-management.ts", import.meta.url), "utf8");
  source = source.replace('import "server-only";', '').replace('import { getSupabaseAdminClient } from "@/lib/supabase/admin";', `const getSupabaseAdminClient = () => ({ from: () => ({ select(){ return this; }, eq(){ return this; }, limit(){ return this; }, maybeSingle: async () => (${JSON.stringify(result)}) }) });`);
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}
test("media read failures preserve storefront default but reject admin writes", async () => {
  const media = await load({ error: { message: "Unavailable" }, data: null });
  assert.deepEqual(await media.getMediaRegistry(), media.emptyMediaRegistry());
  await assert.rejects(media.getMediaRegistry(true), /Unable to read/);
});
test("media URLs reject scripts and external hosts; slot reset uses original", async () => {
  const media = await load({ error: null, data: null });
  assert.equal(media.isSafeMediaUrl("javascript:alert(1)"), false);
  assert.equal(media.isSafeMediaUrl("https://evil.example/image.png"), false);
  assert.equal(media.isSafeMediaUrl("https://project.supabase.co/storage/v1/object/public/a.png"), true);
  assert.equal(media.mediaSlotUrl(media.emptyMediaRegistry(), "hero"), media.DEFAULT_SITE_IMAGE);
});
test("missing assignments and malformed stored image URLs are filtered", async () => {
  const media = await load({ error: null, data: { body: JSON.stringify({ items: [{ id: "one", name: "Unsafe", url: "javascript:alert(1)" }], logo: "one", hero: "missing" }) } });
  assert.deepEqual(await media.getMediaRegistry(true), media.emptyMediaRegistry());
});
test("media server action rejects unauthenticated writes before reading storage", async () => {
  let source = await readFile(new URL("../src/app/admin/media/actions.ts", import.meta.url), "utf8");
  source = source.replace(/^import .*;$/gm, '');
  source = `const cookies = async () => ({ get: () => undefined });
const getAdminCredentials = () => ({username: "admin", password: "secret"});
const isAdminAuthBypassed = () => false;
const ADMIN_SESSION_COOKIE = "session";
const encodeAdminSession = () => "valid-session";
const getMediaRegistry = async () => { throw new Error("Storage was accessed"); };
${source}`;
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }}).outputText;
  const actions = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  await assert.rejects(actions.updateMedia(new FormData()), /Unauthorized/);
});
