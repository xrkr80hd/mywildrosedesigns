import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const src=await readFile(new URL('../src/lib/appearance-options.ts',import.meta.url),'utf8');
const code=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {parseAppearance,DEFAULT_APPEARANCE,fontFaceCss,fontFamily,detectFont}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const id='aabbccdd-1234-4123-8123-aabbccddeeff';const font={id,name:'Custom',path:`fonts/${id}.woff2`,format:'woff2',url:`https://example.supabase.co/storage/v1/object/public/site-fonts/fonts/${id}.woff2`};
test('legacy appearance preserves typography without enabling overrides',()=>{const value=parseAppearance({headingFont:'classic',bodyFont:'modern',headingScale:1.1});assert.equal(value.customTypography,false);assert.equal(value.headingScale,1.1);assert.equal(value.subheadingFont,'classic');assert.equal(value.fonts.length,0);});
test('default and reset keep original design',()=>assert.deepEqual(parseAppearance(null),DEFAULT_APPEARANCE));
test('uploaded fonts usable in all roles with persisted colors and sizes',()=>{const value=parseAppearance({fonts:[font],headingFont:id,bodyFont:id,subheadingFont:id,headingSize:62,subheadingSize:32,bodySize:18,headingColor:'#123456',bodyColor:'#abcdef',customTypography:true});assert.equal(value.fonts.length,1);assert.equal(value.headingFont,id);assert.equal(value.subheadingFont,id);assert.equal(value.bodyFont,id);assert.equal(value.headingSize,62);assert.equal(value.customTypography,true);assert.match(fontFamily(id,value.fonts),/wr-aabbccdd/);});
test('reject injected CSS and external URL paths',()=>{assert.equal(parseAppearance({fonts:[{...font,url:'https://evil.example/font.woff2";color:red'}]}).fonts.length,0);assert.equal(parseAppearance({headingFont:'__proto__',bodyColor:'red;background:url(x)'}).headingFont,'original');assert.equal(parseAppearance({bodyColor:'red;background:url(x)'}).bodyColor,DEFAULT_APPEARANCE.bodyColor);assert.equal(fontFaceCss([{...font,id:'</style><script>'}]),'');});
test('deleted or unknown uploaded font safely falls back',()=>assert.equal(parseAppearance({bodyFont:id,fonts:[]}).bodyFont,'original'));
test('font envelope rejects fake, truncated, mismatch and invalid tables',()=>{assert.equal(detectFont(new TextEncoder().encode('wOF2fakefont!'),'woff2'),null);const b=new Uint8Array(52);b.set(new TextEncoder().encode('wOF2'));const v=new DataView(b.buffer);v.setUint32(8,52);v.setUint16(12,1);assert.equal(detectFont(b,'woff2').format,'woff2');assert.equal(detectFont(b,'woff'),null);v.setUint32(8,80);assert.equal(detectFont(b,'woff2'),null);const t=new Uint8Array(32);const tv=new DataView(t.buffer);tv.setUint32(0,0x00010000);tv.setUint16(4,1);tv.setUint32(20,28);tv.setUint32(24,4);assert.equal(detectFont(t,'ttf').format,'truetype');tv.setUint32(24,30);assert.equal(detectFont(t,'ttf'),null);});

test('save preserves font collection and DB read errors cannot wipe it',async()=>{
 const vm=await import('node:vm');const source=await readFile(new URL('../src/lib/appearance.ts',import.meta.url),'utf8');
 let readError=false,writes=0,saved;const existing={id:'row',body:JSON.stringify({...DEFAULT_APPEARANCE,fonts:[font]}),updated_at:'2026-10-11T00:00:00Z'};
 const db={from:()=>{const chain={select:()=>chain,eq:()=>chain,order:()=>chain,limit:()=>chain,maybeSingle:async()=>({data:readError?null:existing,error:readError?{message:'failure'}:null}),update:payload=>{writes++;saved=payload;return {eq(){return this;},select:async()=>({data:[{id:'row'}],error:null})};},insert:()=>{throw Error('unexpected insert');}};return chain;}};
 const module={exports:{}};const deps={'server-only':{},'next/cache':{unstable_noStore:()=>{}},'@/lib/env':{hasSupabaseServerEnv:()=>true},'@/lib/supabase/admin':{getSupabaseAdminClient:()=>db},'@/lib/appearance-options':{DEFAULT_APPEARANCE,parseAppearance}};
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(output,{module,exports:module.exports,require:key=>deps[key]});await module.exports.saveAppearance({headingFont:id,bodySize:18});assert.equal(JSON.parse(saved.body).fonts[0].id,id);assert.equal(JSON.parse(saved.body).headingFont,id);readError=true;await assert.rejects(module.exports.saveAppearance({bodySize:20}),/No changes/);assert.equal(writes,1);
});
