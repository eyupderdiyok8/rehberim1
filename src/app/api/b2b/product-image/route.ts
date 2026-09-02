import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const BUCKET = "b2b-product-images";
const MAX_FILE_SIZE = 6 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function clients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return null;
  return {
    auth: createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } }),
    admin: createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }),
  };
}

async function authorize(request: Request) {
  const available = clients();
  if (!available) return { error: "Sunucu yapılandırması eksik.", status: 500 } as const;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: "Oturum gerekli.", status: 401 } as const;

  const { data, error } = await available.auth.auth.getUser(token);
  if (error || !data.user) return { error: "Oturum geçersiz.", status: 401 } as const;
  const { data: member } = await available.admin.from("b2b_members").select("account_type").eq("user_id", data.user.id).maybeSingle();
  if (!member || !["wholesaler", "admin"].includes(member.account_type)) {
    return { error: "Yalnızca onaylı toptancı hesapları görsel yükleyebilir.", status: 403 } as const;
  }
  return { available, user: data.user } as const;
}

async function ensureBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: Object.keys(allowedTypes),
  });
  if (error && !error.message.toLocaleLowerCase("tr-TR").includes("already exists")) throw error;
}

export async function POST(request: Request) {
  const authorization = await authorize(request);
  if ("error" in authorization) return Response.json({ error: authorization.error }, { status: authorization.status });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Görsel seçilmedi." }, { status: 400 });
  if (!allowedTypes[file.type]) return Response.json({ error: "Yalnızca JPG, PNG veya WebP yüklenebilir." }, { status: 415 });
  if (file.size > MAX_FILE_SIZE) return Response.json({ error: "Görsel en fazla 6 MB olabilir." }, { status: 413 });

  try {
    await ensureBucket(authorization.available.admin);
    const path = `${authorization.user.id}/${crypto.randomUUID()}.${allowedTypes[file.type]}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await authorization.available.admin.storage.from(BUCKET).upload(path, bytes, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = authorization.available.admin.storage.from(BUCKET).getPublicUrl(path);
    return Response.json({ path, url: data.publicUrl });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Görsel yüklenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authorization = await authorize(request);
  if ("error" in authorization) return Response.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => null) as { path?: string } | null;
  if (!body?.path || !body.path.startsWith(`${authorization.user.id}/`)) {
    return Response.json({ error: "Geçersiz görsel yolu." }, { status: 400 });
  }
  const { error } = await authorization.available.admin.storage.from(BUCKET).remove([body.path]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
