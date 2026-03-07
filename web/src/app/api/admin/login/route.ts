import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, encodeAdminSession } from "@/lib/admin-session";
import { getAdminCredentials } from "@/lib/env";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
    }

    const admin = getAdminCredentials();
    if (!admin.username || !admin.password) {
      return NextResponse.json(
        { error: "Admin credentials are not configured." },
        { status: 500 },
      );
    }

    if (
      parsed.data.username !== admin.username ||
      parsed.data.password !== admin.password
    ) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const token = encodeAdminSession(admin.username, admin.password);
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
