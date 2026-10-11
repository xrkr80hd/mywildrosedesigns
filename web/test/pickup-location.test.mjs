import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/checkout-schema.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText.replace('"zod"', JSON.stringify(new URL('../node_modules/zod/index.js', import.meta.url).href));
const {checkoutRequestSchema, cartCheckoutRequestSchema} = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
for (const [name, schema, extras] of [
  ['cart', cartCheckoutRequestSchema, {items: [{id: 'product', quantity: 1}]}],
  ['upload', checkoutRequestSchema, {productOptionId: 'transfer', quantity: 1}],
]) {
  const base = {customerName: 'Test Customer', customerEmail: 'test@example.com', ...extras};
  test(`${name}: pickup requires a city, rejects arbitrary values and accepts all three cities`, () => {
    assert.equal(schema.safeParse(base).success, false);
    assert.equal(schema.safeParse({...base, pickupLocation: ''}).success, false);
    assert.equal(schema.safeParse({...base, pickupLocation: 'other'}).success, false);
    for (const pickupLocation of ['Alexandria', 'Pineville', 'Simpson']) {
      const parsed = schema.parse({...base, pickupLocation});
      assert.equal(parsed.shippingMethod, 'pickup');
      assert.equal(parsed.pickupLocation, pickupLocation);
    }
  });
  test(`${name}: shipping does not require a pickup city`, () => {
    assert.equal(schema.parse({...base, shippingMethod: 'shipping'}).shippingMethod, 'shipping');
  });
}
