"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function getAdminRole(email?: string): Promise<"admin" | "firm" | null> {
  // If email is provided directly (e.g. after signIn), use it without reading cookies
  if (email) {
    return email === process.env.ADMIN_EMAIL ? "admin" : "firm";
  }
  // Otherwise read from session cookies (e.g. for layout auth checks)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return user.email === process.env.ADMIN_EMAIL ? "admin" : "firm";
}

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  let password = "";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    password += chars[arr[i] % chars.length];
  }
  return password;
}

export async function createFirmAccount(
  firmId: string,
  firmEmail: string,
  firmName: string,
  adminEmail?: string
): Promise<{ success: boolean; email?: string; password?: string; error?: string }> {
  try {
    // 1. Verify caller is admin
    const role = await getAdminRole(adminEmail);
    if (role !== "admin") {
      return { success: false, error: "Bu işlem için yetkiniz yok." };
    }

    if (!firmEmail) {
      return { success: false, error: "Firma e-posta adresi bulunamadı." };
    }

    // 2. Create admin-level Supabase client (service role bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 3. Generate random password
    const password = generatePassword(12);

    // 4. Create the auth user (auto-confirm so they can log in immediately)
    const { data: newUser, error: createUserErr } = await supabaseAdmin.auth.admin.createUser({
      email: firmEmail,
      password,
      email_confirm: true,
    });

    if (createUserErr) {
      // If user already exists, try to find them
      if (createUserErr.message.toLowerCase().includes("already registered") ||
          createUserErr.message.toLowerCase().includes("already exists")) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existing = existingUsers?.users?.find((u) => u.email === firmEmail);
        if (existing) {
          // Link this existing user to the firm
          await supabaseAdmin.from("firms").update({ user_id: existing.id }).eq("id", firmId);
          return {
            success: true,
            email: firmEmail,
            password: "(Mevcut hesap bağlandı — şifre sıfırlama gerekebilir)",
          };
        }
      }
      return { success: false, error: "Hesap oluşturulamadı: " + createUserErr.message };
    }

    if (!newUser?.user) {
      return { success: false, error: "Kullanıcı oluşturulamadı." };
    }

    // 5. Link user_id to firm
    const { error: updateErr } = await supabaseAdmin
      .from("firms")
      .update({ user_id: newUser.user.id })
      .eq("id", firmId);

    if (updateErr) {
      return { success: false, error: "Firma bağlantısı güncellenemedi: " + updateErr.message };
    }

    // 6. Send welcome email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://suaritmarehberi.com.tr";
        await resend.emails.send({
          from: "Su Arıtma Rehberi <noreply@suaritmarehberi.com.tr>",
          to: firmEmail,
          subject: `${firmName} — Panel Hesap Bilgileriniz`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f8fafc;">
              <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;">
                <h1 style="margin:0 0 8px;font-size:20px;color:#0f172a;">Su Arıtma Rehberi — Panel Erişim</h1>
                <p style="color:#475569;font-size:14px;margin:0 0 24px;">Merhaba ${firmName},</p>
                <p style="color:#475569;font-size:14px;margin:0 0 16px;">
                  Yönetim paneline erişim bilgileriniz aşağıdadır:
                </p>
                <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:0 0 24px;">
                  <p style="margin:0 0 8px;font-size:13px;color:#64748b;">E-posta</p>
                  <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#0f172a;">${firmEmail}</p>
                  <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Şifre</p>
                  <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;font-family:monospace;letter-spacing:1px;">${password}</p>
                </div>
                <a href="${siteUrl}/panel/login"
                   style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 24px;border-radius:8px;">
                  Panele Giriş Yap
                </a>
                <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">
                  ⚠️ Güvenliğiniz için bu şifreyi kimseyle paylaşmayın ve en kısa sürede değiştirmenizi öneririz.
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailErr: any) {
        console.error("Resend email send failed:", emailErr?.message);
        // Don't fail the whole operation if email fails — password is still returned
      }
    } else {
      console.warn("RESEND_API_KEY not set — welcome email skipped.");
    }

    return { success: true, email: firmEmail, password };
  } catch (err: any) {
    return { success: false, error: "Beklenmedik hata: " + err.message };
  }
}
