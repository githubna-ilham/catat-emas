import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyApiKey } from "@/lib/auth";
import { computeExpiresAt } from "@/lib/voucher";

export async function POST(request: NextRequest) {
  const authError = verifyApiKey(request);
  if (authError) return authError;

  let body: { code?: string; device_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body tidak valid" },
      { status: 400 }
    );
  }

  const { code, device_id } = body;

  if (!code || !device_id) {
    return NextResponse.json(
      { success: false, error: "Parameter code dan device_id wajib diisi" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Cari voucher
  const { data: voucher, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !voucher) {
    return NextResponse.json(
      { success: false, error: "Kode voucher tidak valid" },
      { status: 404 }
    );
  }

  // Cek kuota
  if (voucher.used_count >= voucher.max_usage) {
    return NextResponse.json(
      { success: false, error: "Kuota voucher sudah habis" },
      { status: 409 }
    );
  }

  // Cek expired
  if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    return NextResponse.json(
      { success: false, error: "Kode voucher sudah expired" },
      { status: 410 }
    );
  }

  // Cek apakah device ini sudah pernah redeem voucher yang sama
  const { data: existing } = await supabase
    .from("device_subscriptions")
    .select("id")
    .eq("device_id", device_id)
    .eq("voucher_id", voucher.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { success: false, error: "Device ini sudah pernah menggunakan voucher ini" },
      { status: 409 }
    );
  }

  const now = new Date();
  const subscriptionExpiresAt = computeExpiresAt(voucher.type, now);

  // Increment used_count dengan optimistic lock
  const { error: updateError, data: updated } = await supabase
    .from("vouchers")
    .update({ used_count: voucher.used_count + 1 })
    .eq("id", voucher.id)
    .lt("used_count", voucher.max_usage)
    .select("id");

  if (updateError || !updated || updated.length === 0) {
    return NextResponse.json(
      { success: false, error: "Kuota voucher sudah habis" },
      { status: 409 }
    );
  }

  // Create device subscription
  const { error: subError } = await supabase
    .from("device_subscriptions")
    .insert({
      device_id,
      voucher_id: voucher.id,
      type: voucher.type,
      is_active: true,
      activated_at: now.toISOString(),
      expires_at: subscriptionExpiresAt,
    });

  if (subError) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat subscription" },
      { status: 500 }
    );
  }

  const messages: Record<string, string> = {
    premium_lifetime: "Selamat! Akun Anda telah diaktifkan sebagai Premium Lifetime.",
    premium_30d: "Selamat! Akun Anda telah diaktifkan sebagai Premium 30 Hari.",
    premium_365d: "Selamat! Akun Anda telah diaktifkan sebagai Premium 365 Hari.",
  };

  return NextResponse.json({
    success: true,
    data: {
      type: voucher.type,
      expires_at: subscriptionExpiresAt,
      remaining_quota: voucher.max_usage - voucher.used_count - 1,
      message: messages[voucher.type] ?? "Selamat! Voucher berhasil digunakan.",
    },
  });
}
