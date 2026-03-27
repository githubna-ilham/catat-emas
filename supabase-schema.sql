-- Jalankan di Supabase SQL Editor

CREATE TABLE gold_price_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sell_price BIGINT,
  buy_price BIGINT,
  price_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert data awal
INSERT INTO gold_price_sources (key, name, url, is_active) VALUES
  ('anekalogam', 'Aneka Logam', 'https://www.anekalogam.co.id/id', true),
  ('galeri24', 'Galeri 24', 'https://galeri24.co.id/api/gold-prices', false),
  ('logammulia', 'Logam Mulia (Antam)', 'https://www.logammulia.com/id', true),
  ('harga-emas-org', 'Harga-Emas.org', 'https://harga-emas.org', true);

-- ============================================================
-- Voucher & Device Subscription System
-- ============================================================

CREATE TABLE vouchers (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('premium_lifetime', 'premium_30d', 'premium_365d')),
  is_used BOOLEAN DEFAULT false,
  used_by_device_id TEXT,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vouchers_code ON vouchers (code);

CREATE TABLE device_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  voucher_id BIGINT NOT NULL REFERENCES vouchers (id),
  type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_device_subscriptions_device_id ON device_subscriptions (device_id);
