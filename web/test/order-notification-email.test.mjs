import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function importTypeScriptModule(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(output.outputText).toString("base64")}`
  );
}

test("buildOrderNotificationEmail includes paid upload order details", async () => {
  const { buildOrderNotificationEmail } = await importTypeScriptModule(
    "../src/lib/order-notification-email.ts",
  );

  const email = buildOrderNotificationEmail({
    id: "12345678-90ab-cdef-1234-567890abcdef",
    created_at: "2026-06-04T15:30:00.000Z",
    customer_name: "Johanna Tester",
    customer_email: "customer@example.com",
    customer_phone: "318-555-0101",
    product_option: "single-transfer",
    quantity: 2,
    amount_cents: 5000,
    status: "paid",
    notes: "Needs it by Friday.",
    design_path: "2026-06-04/example-design.psd",
    paid_at: "2026-06-04T15:35:00.000Z",
    fileLink: "https://signed.example.com/download",
  });

  assert.equal(email.subject, "New paid order #12345678 - Johanna Tester");
  assert.match(email.html, /Johanna Tester/);
  assert.match(email.html, /customer@example.com/);
  assert.match(email.html, /318-555-0101/);
  assert.match(email.html, /single-transfer/);
  assert.match(email.html, />Qty</);
  assert.match(email.html, /\$50\.00/);
  assert.match(email.html, /Needs it by Friday\./);
  assert.match(email.html, /2026-06-04\/example-design\.psd/);
  assert.match(email.html, /https:\/\/signed\.example\.com\/download/);
  assert.match(email.text, /New paid order #12345678/);
  assert.match(email.text, /Qty: 2/);
  assert.match(email.text, /Download: https:\/\/signed\.example\.com\/download/);
});
