import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import sharp from "sharp";

const BUCKET = "nick-images";
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 80;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: jpg, png, webp, svg" },
        { status: 400 },
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const isSvg = file.type === "image/svg+xml";
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    let uploadBuffer: Buffer;
    let contentType: string;
    let ext: string;

    if (isSvg) {
      // SVGs are kept as-is — no compression
      uploadBuffer = rawBuffer;
      contentType = file.type;
      ext = "svg";
    } else {
      // Resize to max width and convert to WebP
      uploadBuffer = await sharp(rawBuffer)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      contentType = "image/webp";
      ext = "webp";
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `services/${fileName}`;

    const db = getAdminClient();

    const { error } = await db.storage.from(BUCKET).upload(filePath, uploadBuffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Upload error:", error);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("Upload error:", e);
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
