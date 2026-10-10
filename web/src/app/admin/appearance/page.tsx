import Link from "next/link";
import { getAppearance } from "@/lib/appearance";
import { AppearanceEditor } from "./editor";
export default async function AppearancePage(){return <main className="mx-auto max-w-4xl px-5 py-8 text-foreground"><Link href="/admin" className="text-sm font-semibold text-rose">← Back to admin</Link><header className="my-6"><p className="text-xs font-bold uppercase tracking-widest text-rose">Website style</p><h1 className="mt-2 text-4xl text-forest">Fonts & typography</h1><p className="mt-3 text-sm text-foreground/70">Choose your fonts, check the preview, and save when ready.</p></header><AppearanceEditor initial={await getAppearance()}/></main>;}
