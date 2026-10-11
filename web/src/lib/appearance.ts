import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { hasSupabaseServerEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_APPEARANCE, parseAppearance, type Appearance } from "@/lib/appearance-options";
const TITLE="site-setting::appearance";
export async function readAppearanceRecord(){
 if(!hasSupabaseServerEnv())throw new Error("Site settings connection is unavailable.");
 const result=await getSupabaseAdminClient().from("welcome_posts").select("id,body,updated_at").eq("title",TITLE).eq("active",false).order("updated_at",{ascending:false}).limit(1).maybeSingle();
 if(result.error)throw new Error("Could not read font settings. No changes were made.");
 let appearance=DEFAULT_APPEARANCE;
 if(result.data){try{appearance=parseAppearance(JSON.parse(result.data.body));}catch{throw new Error("Saved font settings could not be read. No changes were made.");}}
 return {record:result.data,appearance};
}
export async function getAppearance():Promise<Appearance>{noStore();try{return(await readAppearanceRecord()).appearance;}catch{return DEFAULT_APPEARANCE;}}
export async function mutateAppearance(change:(value:Appearance)=>Appearance){
 const {record,appearance}=await readAppearanceRecord();
 const next=parseAppearance(change(appearance));
 const payload={title:TITLE,body:JSON.stringify(next),active:false,sort_order:9000,cta_label:null,cta_href:null};
 const db=getSupabaseAdminClient();
 const result=record?await db.from("welcome_posts").update(payload).eq("id",record.id).eq("body",record.body).eq("updated_at",record.updated_at).select("id"):await db.from("welcome_posts").insert(payload).select("id");
 if(result.error||!result.data?.length)throw new Error("Settings changed elsewhere or could not save. Refresh and try again.");
 return next;
}
export async function saveAppearance(value:Partial<Appearance>){return mutateAppearance(current=>parseAppearance({...current,...value,fonts:current.fonts}));}
