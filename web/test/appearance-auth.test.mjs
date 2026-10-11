import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
async function load(file,deps){
 const source=await readFile(new URL(file,import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};vm.runInNewContext(code,{module,exports:module.exports,require:key=>{if(!(key in deps))throw Error(key);return deps[key];}});return module.exports;
}
test('font controls accept only the configured owner session or Basic credentials',async()=>{
 let session,authorization;const token=Buffer.from('owner:password').toString('base64');
 const auth=await load('../src/lib/appearance-auth.ts',{'server-only':{},'next/headers':{cookies:async()=>({get:()=>session?{value:session}:undefined}),headers:async()=>({get:()=>authorization})},'@/lib/admin-session':{ADMIN_SESSION_COOKIE:'session',encodeAdminSession:(u,p)=>Buffer.from(`${u}:${p}`).toString('base64')},'@/lib/env':{getAdminCredentials:()=>({username:'owner',password:'password'}),isAdminAuthBypassed:()=>false}});
 assert.equal(await auth.isAppearanceAdmin(),false);session='incorrect';assert.equal(await auth.isAppearanceAdmin(),false);session=token;assert.equal(await auth.isAppearanceAdmin(),true);session=undefined;authorization=`Basic ${token}`;assert.equal(await auth.isAppearanceAdmin(),true);authorization='Basic wrong';assert.equal(await auth.isAppearanceAdmin(),false);
});
test('font upload rejects non-owner before reading files or accessing storage',async()=>{
 let touched=false;const route=await load('../src/app/api/admin/upload-font/route.ts',{'node:crypto':{randomUUID:()=>{touched=true;}},'next/server':{NextResponse:{json:(data,options)=>({data,status:options.status})}},'next/cache':{revalidatePath:()=>{touched=true;}},'@/lib/appearance-auth':{isAppearanceAdmin:async()=>false},'@/lib/appearance':{mutateAppearance:()=>{touched=true;},readAppearanceRecord:()=>{touched=true;}},'@/lib/appearance-options':{},'@/lib/supabase/admin':{getSupabaseAdminClient:()=>{touched=true;}}});
 const result=await route.POST({formData:()=>{touched=true;}});assert.equal(result.status,401);assert.equal(touched,false);
});
