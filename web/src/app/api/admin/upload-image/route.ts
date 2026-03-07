import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminCredentials } from "@/lib/env";
import { ADMIN_SESSION_COOKIE, encodeAdminSession } from "@/lib/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const PRODUCT_IMAGE_BUCKET = "product-images";
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isAuthorized(request: NextRequest): boolean {
  const { username, password } = getAdminCredentials();
  if (!username || !password) {
    return false;
  }

  const expectedToken = encodeAdminSession(username, password);
  const cookieToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return cookieToken === expectedToken;
}

async function ensureBucketExists() {
  const supabase = getSupabaseAdminClient();
  const bucketResult = await supabase.storage.getBucket(PRODUCT_IMAGE_BUCKET);
  if (!bucketResult.error) {
    return;
  }

  const createResult = await supabase.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: `${MAX_UPLOAD_BYTES}`,
    allowedMimeTypes: Array.from(ALLOWED_IMAGE_TYPES),
  });

  if (createResult.error) {
    throw new Error(createResult.error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Image must be between 1 byte and 12MB." },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use PNG, JPG, WEBP, or SVG." },
        { status: 400 },
      );
    }

    await ensureBucketExists();

    const supabase = getSupabaseAdminClient();
    const datePrefix = new Date().toISOString().slice(0, 10);
    const filePath = `products/${datePrefix}/${randomUUID()}-${sanitizeFileName(file.name)}`;
    const uploadResult = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(filePath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadResult.error) {
      throw new Error(uploadResult.error.message);
    }

    const publicUrlResult = supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrlResult.data.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Admin image upload failed", error);
    return NextResponse.json({ error: "Unable to upload image." }, { status: 500 });
  }
}
