"use client";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { FONT_CHOICES, type Appearance } from "@/lib/appearance-options";
export function AppearanceScope({appearance,children}:{appearance:Appearance;children:ReactNode}){
 const admin=usePathname()?.startsWith("/admin");
 const style=admin?undefined:{"--store-body":FONT_CHOICES[appearance.bodyFont].body,"--store-heading":FONT_CHOICES[appearance.headingFont].heading,"--store-body-size":`${appearance.bodySize}px`,"--store-body-ratio":appearance.bodySize / 16,"--store-heading-scale":appearance.headingScale} as CSSProperties;
 return <div className={admin?undefined:"storefront-appearance"} style={style}>{children}</div>;
}
