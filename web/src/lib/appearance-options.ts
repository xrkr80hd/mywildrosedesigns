export const FONT_CHOICES = {
 original:{label:"Wild Rose original",body:"var(--font-body), sans-serif",heading:"var(--font-heading), serif"},
 modern:{label:"Modern sans",body:"Arial, Helvetica, sans-serif",heading:"Arial, Helvetica, sans-serif"},
 classic:{label:"Classic serif",body:'Georgia, "Times New Roman", serif',heading:'Georgia, "Times New Roman", serif'},
 friendly:{label:"Friendly rounded",body:'"Trebuchet MS", Arial, sans-serif',heading:'"Trebuchet MS", Arial, sans-serif'},
 editorial:{label:"Editorial",body:"Verdana, Geneva, sans-serif",heading:'Georgia, "Times New Roman", serif'},
} as const;
export const FONT_BUCKET = "site-fonts";
export const MAX_FONT_BYTES = 4 * 1024 * 1024;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export type UploadedFont={id:string;name:string;url:string;path:string;format:"woff2"|"woff"|"truetype"|"opentype"};
export type Appearance={customTypography:boolean;bodyFont:string;headingFont:string;subheadingFont:string;bodySize:number;headingScale:number;headingSize:number;subheadingSize:number;bodyColor:string;headingColor:string;subheadingColor:string;fonts:UploadedFont[]};
export const DEFAULT_APPEARANCE:Appearance={customTypography:false,bodyFont:"original",headingFont:"original",subheadingFont:"original",bodySize:16,headingScale:1,headingSize:48,subheadingSize:30,bodyColor:"#1c1a19",headingColor:"#2f4b3c",subheadingColor:"#2f4b3c",fonts:[]};
function bounded(value:unknown,fallback:number,min:number,max:number){return typeof value==="number"&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;}
function color(value:unknown,fallback:string){return typeof value==="string"&&/^#[0-9a-f]{6}$/i.test(value)?value:fallback;}
export function parseAppearance(value:unknown):Appearance {
 const item=value&&typeof value==="object"?value as Partial<Appearance>:{};
 const fonts:UploadedFont[]=Array.isArray(item.fonts)?item.fonts.filter((font):font is UploadedFont=>{
 if(!font||typeof font!=="object"||typeof font.id!=="string"||!UUID_PATTERN.test(font.id)||typeof font.name!=="string"||font.name.length>80||!font.name.trim()||!['woff2','woff','truetype','opentype'].includes(font.format))return false;
 if(!new RegExp(`^fonts/${font.id}\\.(woff2|woff|ttf|otf)$`).test(font.path))return false;
 if(typeof font.url!=="string"||!/^https:\/\/[a-z0-9.-]+(?::\d+)?\/storage\/v1\/object\/public\/site-fonts\/fonts\/[0-9a-f-]+\.(woff2|woff|ttf|otf)$/.test(font.url))return false;
 return font.url.endsWith(`/${font.path}`);
 }).slice(0,50):[];
 const choice=(value:unknown)=>typeof value==="string"&&(Object.hasOwn(FONT_CHOICES,value)||fonts.some(font=>font.id===value))?value:"original";
 const headingScale=bounded(item.headingScale,1,.9,1.2);
 return {customTypography:item.customTypography===true,bodyFont:choice(item.bodyFont),headingFont:choice(item.headingFont),subheadingFont:choice(item.subheadingFont??item.headingFont),bodySize:bounded(item.bodySize,16,12,28),headingScale,headingSize:bounded(item.headingSize,48*headingScale,24,80),subheadingSize:bounded(item.subheadingSize,30,18,48),bodyColor:color(item.bodyColor,DEFAULT_APPEARANCE.bodyColor),headingColor:color(item.headingColor,DEFAULT_APPEARANCE.headingColor),subheadingColor:color(item.subheadingColor,DEFAULT_APPEARANCE.subheadingColor),fonts};
}
export function fontFamily(id:string,fonts:UploadedFont[],role:"body"|"heading"="body") {if(fonts.some(f=>f.id===id))return `"wr-${id}", ${role==="body"?"sans-serif":"serif"}`;return FONT_CHOICES[id as keyof typeof FONT_CHOICES]?.[role]??FONT_CHOICES.original[role];}
export function fontFaceCss(fonts:UploadedFont[]){return parseAppearance({fonts}).fonts.map(f=>`@font-face{font-family:"wr-${f.id}";src:url("${f.url}") format("${f.format}");font-weight:100 900;font-style:normal;font-display:swap;}`).join("\n");}
export function detectFont(bytes:Uint8Array,extension:string){
 if(bytes.length<12)return null;
 const signature=String.fromCharCode(...bytes.slice(0,4));
 const format=signature==="wOF2"?"woff2":signature==="wOFF"?"woff":signature==="OTTO"?"otf":bytes[0]===0&&bytes[1]===1&&bytes[2]===0&&bytes[3]===0?"ttf":null;
 if(!format||format!==extension)return null;
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(format==="woff"||format==="woff2"){
  const minimum=format==="woff"?44:48;
  if(bytes.length<minimum||view.getUint32(8)!==bytes.length||view.getUint16(12)===0)return null;
  if(format==="woff"){
   const tables=view.getUint16(12);if(44+tables*20>bytes.length)return null;
   for(let index=0;index<tables;index++){const at=44+index*20;const offset=view.getUint32(at+4),length=view.getUint32(at+8);if(offset<44+tables*20||offset+length>bytes.length)return null;}
  }
 }else{
  const tables=view.getUint16(4);if(!tables||12+tables*16>bytes.length)return null;
  for(let index=0;index<tables;index++){const at=12+index*16;const offset=view.getUint32(at+8),length=view.getUint32(at+12);if(offset<12+tables*16||offset+length>bytes.length)return null;}
 }
 return {extension:format,format:format==="ttf"?"truetype":format==="otf"?"opentype":format,contentType:`font/${format}`} as const;
}
