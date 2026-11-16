-- Nordy Tech — Seed produk katalog (idempotent, aman dijalankan berulang)
-- Jalankan di Supabase > SQL Editor setelah supabase/schema.sql.
-- Harga & stok di bawah PLACEHOLDER — ubah lewat Admin > Produk.

-- ============ PRODUK ============
insert into products (name, slug, description, specifications, is_active)
values
  (
    'Jepit Rambut PCB',
    'jepit-rambut-pcb',
    'Jepit rambut dengan kepingan PCB (printed circuit board) asli sebagai elemen desain utama. Ringan, unik, dan cocok untuk gaya harian maupun hadiah untuk penggemar teknologi.',
    '{"Bahan":"PCB FR-4 asli (hijau / hitam)","Jepit":"Logam stainless spring","Ukuran":"± 60 mm","Berat":"± 15 g","Finishing":"Sudut dibulatkan manual","Perawatan":"Lap kain kering"}'::jsonb,
    true
  ),
  (
    'Keychain RJ45',
    'keychain-rj45',
    'Gantungan kunci bertema konektor jaringan RJ45. Identitas untuk anak jaringan, IT, dan penggemar teknologi. Dilengkapi cincin stainless yang kuat.',
    '{"Konektor":"RJ45 8P8C standar","Cincin":"Stainless 304, diameter 25 mm","Panjang total":"± 55 mm","Berat":"± 20 g","Kemasan":"Pouch kertas kraft Nordy Tech"}'::jsonb,
    true
  )
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      specifications = excluded.specifications,
      is_active = true;

-- ============ VARIAN ============
insert into product_variants (product_id, name, sku, price, stock, is_active)
values
  ((select id from products where slug = 'jepit-rambut-pcb'), 'PCB Hijau', 'NORDY-PCB-GRN', 15000, 12, true),
  ((select id from products where slug = 'jepit-rambut-pcb'), 'PCB Hitam', 'NORDY-PCB-BLK', 15000, 3,  true),
  ((select id from products where slug = 'keychain-rj45'),    'Konektor Standar', 'NORDY-RJ45-STD', 10000, 20, true),
  ((select id from products where slug = 'keychain-rj45'),    'Dengan Kabel Pendek', 'NORDY-RJ45-CBL', 10000, 8, true)
on conflict (sku) do update
  set product_id = excluded.product_id,
      name = excluded.name,
      price = excluded.price,
      stock = excluded.stock,
      is_active = true;

-- ============ FOTO (pakai ilustrasi SVG lokal; ganti lewat Admin > Produk) ============
insert into product_images (product_id, url, alt_text, sort_order)
select p.id, v.url, v.alt, v.ord
from (values
  ('jepit-rambut-pcb', '/assets/products/jepit-rambut-pcb.svg',   'Jepit Rambut PCB varian PCB Hijau', 0),
  ('jepit-rambut-pcb', '/assets/products/jepit-rambut-pcb-2.svg', 'Jepit Rambut PCB varian PCB Hitam', 1),
  ('keychain-rj45',    '/assets/products/keychain-rj45.svg',      'Keychain RJ45 konektor jaringan',   0),
  ('keychain-rj45',    '/assets/products/keychain-rj45-2.svg',    'Keychain RJ45 dengan kabel pendek', 1)
) as v(slug, url, alt, ord)
join products p on p.slug = v.slug
where not exists (
  select 1 from product_images pi where pi.product_id = p.id and pi.url = v.url
);

-- ============ VERIFIKASI ============
select p.name, p.slug, p.is_active,
       (select count(*) from product_variants v where v.product_id = p.id) as varian,
       (select count(*) from product_images  i where i.product_id = p.id) as foto,
       (select coalesce(sum(stock),0) from product_variants v where v.product_id = p.id) as total_stok
from products p
order by p.name;
