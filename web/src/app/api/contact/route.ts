import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = contactSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();
    const insertResult = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: "new",
    });

    if (insertResult.error) {
      throw new Error(insertResult.error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact request failed", error);
    return NextResponse.json(
      { error: "Unable to submit message right now." },
      { status: 500 },
    );
  }
}
