-- Nordy Tech — Hardening & Storage (jalankan setelah schema.sql)
-- Aman dijalankan berulang.

-- 1) Tutup celah: anon tidak boleh insert langsung ke orders/order_items.
--    Pembuatan pesanan HANYA lewat RPC create_order (SECURITY DEFINER) yang
--    memvalidasi stok & total. Jika tidak ditutup, anon bisa bikin order palsu.
drop policy if exists "anon insert orders" on orders;
drop policy if exists "anon insert items" on order_items;

-- 2) Pastikan minimal query tetap bisa jalan (tidak ada perubahan lain).

-- 3) Storage policies untuk bucket "product-images" (buat bucket-nya dulu di
--    Dashboard > Storage, tanda Public). Unggah/hapus foto hanya oleh admin
--    (user authenticated di app ini = admin).
drop policy if exists "nordy read product images" on storage.objects;
create policy "nordy read product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "nordy upload product images" on storage.objects;
create policy "nordy upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "nordy update product images" on storage.objects;
create policy "nordy update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

drop policy if exists "nordy delete product images" on storage.objects;
create policy "nordy delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');

-- 4) Bersihkan baris uji dari diagnosis (opsional, aman dihapus):
delete from customers where name in ('TEST_NORDY_DIAG', 'TEST_NORDY_DIAG2');

-- 5) Verifikasi policy penting:
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('customers', 'orders', 'order_items')
order by tablename, cmd;
