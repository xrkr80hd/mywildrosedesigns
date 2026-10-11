import { randomUUID } from "node:crypto";
import { NextRequest,NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAppearanceAdmin } from "@/lib/appearance-auth";
import { mutateAppearance,readAppearanceRecord } from "@/lib/appearance";
import { detectFont,FONT_BUCKET,MAX_FONT_BYTES,type UploadedFont } from "@/lib/appearance-options";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
const MIME_TYPES=["font/woff2","font/woff","font/ttf","font/otf"];
export async function POST(request:NextRequest){
 if(!await isAppearanceAdmin())return NextResponse.json({error:"Please sign in to admin."},{status:401});
 const origin=request.headers.get("origin");if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
 const length=Number(request.headers.get("content-length")??0);if(length>MAX_FONT_BYTES+65536)return NextResponse.json({error:"Font must be 4 MB or smaller."},{status:413});
 let uploadedPath:string|undefined;
 try{
 const form=await request.formData();const file=form.get("file");
 if(!(file instanceof File)||file.size<12||file.size>MAX_FONT_BYTES)return NextResponse.json({error:"Choose a valid font, up to 4 MB."},{status:400});
 const ext=file.name.split(".").pop()?.toLowerCase()??"";const bytes=new Uint8Array(await file.arrayBuffer());const detected=detectFont(bytes,ext);
 if(!detected)return NextResponse.json({error:"Unsupported or invalid font. Use WOFF2, WOFF, TTF, or OTF."},{status:400});
 const {appearance}=await readAppearanceRecord();if(appearance.fonts.length>=50)return NextResponse.json({error:"Your collection holds up to 50 fonts. Remove one before adding another."},{status:400});
 const db=getSupabaseAdminClient();const bucket=await db.storage.getBucket(FONT_BUCKET);
 if(bucket.error){if(!["404","Bucket not found"].includes(String(bucket.error.message))&&String((bucket.error as {status?:number}).status)!=="404")throw new Error("Font storage could not be read. Please try again.");const created=await db.storage.createBucket(FONT_BUCKET,{public:true,fileSizeLimit:MAX_FONT_BYTES,allowedMimeTypes:MIME_TYPES});if(created.error)throw new Error("Font storage is not ready. Please contact your website administrator.");}
 else if(!bucket.data.public)throw new Error("Font storage must allow public reading before fonts can display.");
 const id=randomUUID();const path=`fonts/${id}.${detected.extension}`;
 const upload=await db.storage.from(FONT_BUCKET).upload(path,bytes,{contentType:detected.contentType,upsert:false,cacheControl:"31536000"});if(upload.error)throw new Error("Font upload failed. Please try again.");uploadedPath=path;
 const name=String(form.get("name")||file.name.replace(/\.[^.]+$/,"" )).replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,80)||"Uploaded font";
 const font:UploadedFont={id,name,path,url:db.storage.from(FONT_BUCKET).getPublicUrl(path).data.publicUrl,format:detected.format};
 const next=await mutateAppearance(current=>{if(current.fonts.length>=50)throw new Error("Font collection is full.");return {...current,fonts:[...current.fonts,font]};});
 revalidatePath("/","layout");return NextResponse.json({font,appearance:next});
 }catch(error){if(uploadedPath)await getSupabaseAdminClient().storage.from(FONT_BUCKET).remove([uploadedPath]);return NextResponse.json({error:error instanceof Error?error.message:"Unable to upload font."},{status:500});}
}
