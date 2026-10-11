import Link from "next/link";
import { readAppearanceRecord } from "@/lib/appearance";
import { AppearanceEditor } from "./editor";
export default async function AppearancePage(){
 let appearance;
 let error="";
 try{appearance=(await readAppearanceRecord()).appearance;}catch{error="Your font settings could not be loaded. Refresh this page to try again. Editing is paused so your saved fonts stay protected.";}
 return <main className="mx-auto max-w-5xl px-5 py-8 text-foreground"><Link href="/admin" className="text-sm font-semibold text-rose">← Back to admin</Link><header className="my-6"><p className="text-xs font-bold uppercase tracking-widest text-rose">Website style</p><h1 className="mt-2 text-4xl text-forest">Fonts & typography</h1><p className="mt-3 text-sm text-foreground/70">Upload your fonts, style each text level, and preview before saving.</p></header>{appearance?<AppearanceEditor initial={appearance}/>:<p role="alert" className="border border-rose/25 bg-white p-5 text-rose">{error}</p>}</main>;
}
