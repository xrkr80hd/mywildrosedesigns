import "server-only";
import { cookies, headers } from "next/headers";
import { ADMIN_SESSION_COOKIE, encodeAdminSession } from "@/lib/admin-session";
import { getAdminCredentials,isAdminAuthBypassed } from "@/lib/env";
export async function isAppearanceAdmin(){
 if(isAdminAuthBypassed())return true;
 const {username,password}=getAdminCredentials();if(!username||!password)return false;
 const token=encodeAdminSession(username,password);
 return (await cookies()).get(ADMIN_SESSION_COOKIE)?.value===token||(await headers()).get("authorization")===`Basic ${token}`;
}
