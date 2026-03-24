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
