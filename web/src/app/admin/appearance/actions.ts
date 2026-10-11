"use server";
import { revalidatePath } from "next/cache";
import { isAppearanceAdmin } from "@/lib/appearance-auth";
import { mutateAppearance,saveAppearance } from "@/lib/appearance";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_APPEARANCE,UUID_PATTERN,FONT_BUCKET } from "@/lib/appearance-options";
export async function updateAppearance(form:FormData){
 if(!await isAppearanceAdmin())return {error:"Please sign in to admin again."};
 try{
 const fields=form.get("reset")==="true"?DEFAULT_APPEARANCE:{customTypography:form.get("customTypography")==="true",bodyFont:String(form.get("bodyFont")),headingFont:String(form.get("headingFont")),subheadingFont:String(form.get("subheadingFont")),bodySize:Number(form.get("bodySize")),headingSize:Number(form.get("headingSize")),subheadingSize:Number(form.get("subheadingSize")),bodyColor:String(form.get("bodyColor")),headingColor:String(form.get("headingColor")),subheadingColor:String(form.get("subheadingColor"))};
 const appearance=await saveAppearance(fields); revalidatePath("/","layout");return {success:"Website fonts, sizes, and colors saved.",appearance};
 }catch(error){return {error:error instanceof Error?error.message:"Could not save. Please try again."};}
}
export async function removeUploadedFont(id:string){
 if(!await isAppearanceAdmin())return {error:"Please sign in to admin again."};
 if(!UUID_PATTERN.test(id))return {error:"Invalid font."};
 try{let removedPath:string|undefined;const appearance=await mutateAppearance(current=>{removedPath=current.fonts.find(font=>font.id===id)?.path;return {...current,fonts:current.fonts.filter(f=>f.id!==id),bodyFont:current.bodyFont===id?"original":current.bodyFont,headingFont:current.headingFont===id?"original":current.headingFont,subheadingFont:current.subheadingFont===id?"original":current.subheadingFont};});
 if(removedPath)await getSupabaseAdminClient().storage.from(FONT_BUCKET).remove([removedPath]);
 revalidatePath("/","layout");return {success:"Font removed from your collection. Any saved use was restored to the original font.",appearance};
 }catch(error){return {error:error instanceof Error?error.message:"Could not remove font."};}
}
