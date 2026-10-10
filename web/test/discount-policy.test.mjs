import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/discount-policy.ts', import.meta.url), 'utf8');
const out = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
const {buildDiscountOptions,resolveStripeDiscount,DiscountCodeError} = await import(`data:text/javascript;base64,${Buffer.from(out.outputText).toString('base64')}`);
const coupon = {id:'ztIV16of', name:'TREATYOURSELF', amount_off:400, percent_off:null,currency:'usd',valid:true};
function stripe({active=true,promotion=null}={}) {return {
 coupons:{retrieve:async()=>({...coupon,valid:active}),list:()=>({async *[Symbol.asyncIterator](){yield coupon;}})},
 promotionCodes:{list:async()=>({data:promotion?[promotion]:[]})}
};}
const saved=[{code:'treatyourself',couponId:coupon.id,label:'$4.00 off'}];
test('named Stripe coupon resolves exactly without inventing amount',async()=>assert.deepEqual(await resolveStripeDiscount(stripe(),'treatyourself'),saved[0]));
test('case insensitive registered coupon is applied server-side',async()=>assert.deepEqual(await buildDiscountOptions(stripe(),saved,' TREATYOURSELF '),{discounts:[{coupon:coupon.id}]}));
test('deleted website code rejected even if Stripe still has it',async()=>assert.rejects(buildDiscountOptions(stripe(),[],'treatyourself'),DiscountCodeError));
test('invalid/expired coupon rejected',async()=>assert.rejects(buildDiscountOptions(stripe({active:false}),saved,'treatyourself'),DiscountCodeError));
test('managed checkout never exposes unrestricted Stripe code entry',async()=>assert.deepEqual(await buildDiscountOptions(stripe(),saved,''),{}));
test('pre-existing checkout behavior preserved until registry initialized',async()=>assert.deepEqual(await buildDiscountOptions(stripe(),null,''),{allow_promotion_codes:true}));
test('registered promotion uses promotion ID with no allow_promotion_codes',async()=>assert.deepEqual(await buildDiscountOptions(stripe({promotion:{id:'promo_a',code:'SAVE',customer:null,expires_at:null}}),[{code:'SAVE',promotionCodeId:'promo_a',label:'discount'}],'save'),{discounts:[{promotion_code:'promo_a'}]}));
test('promotion ID replacement is rejected',async()=>assert.rejects(buildDiscountOptions(stripe({promotion:{id:'promo_b',code:'SAVE',customer:null}}),[{code:'SAVE',promotionCodeId:'promo_a',label:'discount'}],'SAVE'),DiscountCodeError));

test('pickup is the safe default for both request schemas', async()=>{
 const schemaSource=await readFile(new URL('../src/lib/checkout-schema.ts',import.meta.url),'utf8');
 const absoluteZod = new URL('../node_modules/zod/index.js',import.meta.url).href;
 const transpiled=ts.transpileModule(schemaSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace('"zod"',JSON.stringify(absoluteZod));
 const {checkoutRequestSchema,cartCheckoutRequestSchema}=await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`);
 const base={customerName:'Test User',customerEmail:'test@example.com'};
 assert.equal(checkoutRequestSchema.parse({...base,productOptionId:'transfer',quantity:1}).shippingMethod,'pickup');
 assert.equal(cartCheckoutRequestSchema.parse({...base,items:[{id:'test',quantity:1}]}).shippingMethod,'pickup');
 assert.equal(cartCheckoutRequestSchema.parse({...base,shippingMethod:'shipping',items:[{id:'test',quantity:1}]}).shippingMethod,'shipping');
});
