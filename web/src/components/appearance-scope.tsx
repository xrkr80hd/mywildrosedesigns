"use client";
import { usePathname } from "next/navigation";
import type { CSSProperties,ReactNode } from "react";
import { fontFamily,type Appearance } from "@/lib/appearance-options";
export function AppearanceScope({appearance,children}:{appearance:Appearance;children:ReactNode}){
 const admin=usePathname()?.startsWith("/admin");
 const style=admin?undefined:{"--store-body":fontFamily(appearance.bodyFont,appearance.fonts),"--store-heading":fontFamily(appearance.headingFont,appearance.fonts,"heading"),"--store-subheading":fontFamily(appearance.subheadingFont,appearance.fonts,"heading"),"--store-body-size":`${appearance.bodySize}px`,"--store-body-ratio":appearance.bodySize/16,"--store-heading-size":`${appearance.headingSize}px`,"--store-subheading-size":`${appearance.subheadingSize}px`,"--store-heading-scale":appearance.customTypography?1:appearance.headingScale,"--store-body-color":appearance.bodyColor,"--store-heading-color":appearance.headingColor,"--store-subheading-color":appearance.subheadingColor} as CSSProperties;
 return <div data-custom-typography={!admin&&appearance.customTypography?"true":undefined} className={admin?undefined:"storefront-appearance"} style={style}>{children}</div>;
}
