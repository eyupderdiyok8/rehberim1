import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// Use service role key server-side so we can upload without RLS issues
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/admin/download-image
 * Downloads an image from an external URL and uploads it to Supabase Storage.
 * Returns the new public URL.
 *
 * Body: { url: string, filename: string }
 */
export async function POST(req: Request) {
  try {
    const { url, filename } = await req.json();

    if (!url || !filename) {
      return NextResponse.json({ error: "url and filename are required" }, { status: 400 });
    }

    // Fetch the remote image
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (AquaRehber/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Remote image fetch failed: ${response.status}` },
        { status: 422 }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let finalBuffer = buffer;
    let finalContentType = contentType;
    let ext = "webp";

    if (contentType.includes("svg")) {
      ext = "svg";
      finalContentType = "image/svg+xml";
    } else {
      try {
        const metadata = await sharp(buffer).metadata();
        const width = metadata.width || 800;
        const height = metadata.height || 600;

        // Dynamic watermark font sizing based on width
        const fontSize = Math.max(10, Math.round(width * 0.03)); // 3% of width
        const x = Math.round(width * 0.96); // 96% from left (align right text-anchor)
        const y = Math.round(height * 0.94); // 94% from top

        const watermarkSvg = Buffer.from(`
          <svg width="${width}" height="${height}">
            <style>
              .watermark {
                font-family: Arial, sans-serif;
                font-weight: bold;
                font-size: ${fontSize}px;
                text-anchor: end;
              }
            </style>
            <!-- Shadow for readability on light backgrounds -->
            <text x="${x + 1}" y="${y + 1}" fill="rgba(0, 0, 0, 0.25)" class="watermark">suaritmarehberi.com.tr</text>
            <!-- White text -->
            <text x="${x}" y="${y}" fill="rgba(255, 255, 255, 0.55)" class="watermark">suaritmarehberi.com.tr</text>
          </svg>
        `);

        finalBuffer = await sharp(buffer)
          .composite([
            {
              input: watermarkSvg,
              top: 0,
              left: 0,
            },
          ])
          .webp({ quality: 85 })
          .toBuffer();

        finalContentType = "image/webp";
        ext = "webp";
      } catch (err: any) {
        console.error("Sharp conversion to WebP/Watermark failed, falling back to original", err);
        ext = contentType.includes("png")
          ? "png"
          : contentType.includes("webp")
          ? "webp"
          : contentType.includes("gif")
          ? "gif"
          : "jpg";
      }
    }

    const storagePath = `logos/${filename}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("firm_images")
      .upload(storagePath, finalBuffer, {
        contentType: finalContentType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage
      .from("firm_images")
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: publicData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
