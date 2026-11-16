-- Nordy Tech E-Commerce — Supabase/PostgreSQL schema (MVP)
-- Acuan: PRD bagian I (Data Model). Uang = integer Rupiah.

create extension if not exists "pgcrypto";

-- ============ CORE TABLES ============
create table products (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null check (char_length(name) between 3 and 120),
  slug varchar(140) not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text not null,
  specifications jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete restrict,
  name varchar(80) not null,
  sku varchar(40) not null unique,
  price integer not null check (price > 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text varchar(160) not null,
  sort_order integer not null default 0 check (sort_order >= 0)
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null check (char_length(name) between 2 and 100),
  whatsapp varchar(16) not null check (whatsapp ~ '^62[0-9]{9,13}$'),
  email varchar(120) null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

create table shipping_options (
  id uuid primary key default gen_random_uuid(),
  courier_name varchar(60) not null,
  service_name varchar(60) not null,
  estimate_text varchar(60) not null default '',
  cost integer not null check (cost >= 0),
  is_active boolean not null default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number varchar(20) not null unique,
  customer_id uuid not null references customers(id) on delete restrict,
  shipping_name varchar(100) not null,
  shipping_phone varchar(16) not null,
  shipping_address text not null check (char_length(shipping_address) between 10 and 300),
  shipping_city varchar(80) not null,
  shipping_province varchar(80) not null,
  shipping_postal_code varchar(10) not null check (shipping_postal_code ~ '^[0-9]{5}$'),
  shipping_option_id uuid not null references shipping_options(id) on delete restrict,
  shipping_courier_snapshot varchar(120) not null default '',
  subtotal integer not null check (subtotal >= 0),
  shipping_cost integer not null check (shipping_cost >= 0),
  total integer not null check (total >= 0),
  status text not null default 'menunggu_pembayaran'
    check (status in ('menunggu_pembayaran','diproses','dikirim','selesai','dibatalkan')),
  payment_method text not null default 'whatsapp_manual'
    check (payment_method in ('whatsapp_manual','gateway')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete restrict,
  variant_id uuid not null references product_variants(id) on delete restrict,
  product_name_snapshot varchar(120) not null,
  variant_name_snapshot varchar(80) not null,
  unit_price_snapshot integer not null check (unit_price_snapshot > 0),
  quantity integer not null check (quantity >= 1),
  line_total integer not null check (line_total >= 0)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete restrict,
  provider varchar(60) not null default 'manual',
  provider_reference varchar(120) null,
  amount integer not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending','paid','failed','expired','refunded')),
  verified_at timestamptz null,
  created_at timestamptz not null default now()
);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete restrict,
  from_status text null,
  to_status text not null,
  changed_by uuid null,
  note text not null default '',
  changed_at timestamptz not null default now()
);

create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar(120) not null unique,
  name varchar(80) not null default 'Admin',
  role varchar(20) not null default 'owner',
  is_active boolean not null default true,
  last_login_at timestamptz null
);

create table store_settings (
  key text primary key,
  value text not null default ''
);

-- ============ INDEXES ============
create index idx_products_slug on products(slug);
create index idx_variants_product on product_variants(product_id);
create index idx_variants_sku on product_variants(sku);
create index idx_images_product on product_images(product_id, sort_order);
create index idx_orders_number on orders(order_number);
create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);
create index idx_items_order on order_items(order_id);
create index idx_history_order on order_status_history(order_id);

-- ============ UPDATED_AT TRIGGER ============
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger trg_products_touch before update on products
  for each row execute function touch_updated_at();
create trigger trg_orders_touch before update on orders
  for each row execute function touch_updated_at();

-- ============ STOCK RPC (atomic, anti-oversell) ============
-- Mengurangi stok hanya bila stok >= qty. Return true bila berhasil.
create or replace function reserve_stock(p_variant_id uuid, p_qty int)
returns boolean language plpgsql security definer as $$
declare updated int;
begin
  update product_variants
    set stock = stock - p_qty
    where id = p_variant_id and is_active and stock >= p_qty
    returning 1 into updated;
  return found;
end $$;

create or replace function release_stock(p_variant_id uuid, p_qty int)
returns void language plpgsql security definer as $$
begin
  update product_variants set stock = stock + p_qty where id = p_variant_id;
end $$;

-- Buat pesanan secara atomik: header + item + reservasi stok.
-- Return nomor pesanan. Melempar exception bila stok tidak cukup (rollback).
create or replace function create_order(
  p_order_number text,
  p_customer_id uuid,
  p_shipping_name text,
  p_shipping_phone text,
  p_shipping_address text,
  p_shipping_city text,
  p_shipping_province text,
  p_shipping_postal_code text,
  p_shipping_option_id uuid,
  p_shipping_courier_snapshot text,
  p_subtotal int,
  p_shipping_cost int,
  p_total int,
  p_payment_method text,
  p_notes text,
  p_items jsonb
) returns jsonb language plpgsql security definer as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_stock int;
  v_qty int;
  v_variant uuid;
begin
  insert into orders (
    order_number, customer_id, shipping_name, shipping_phone, shipping_address,
    shipping_city, shipping_province, shipping_postal_code, shipping_option_id,
    shipping_courier_snapshot, subtotal, shipping_cost, total, status,
    payment_method, notes
  ) values (
    p_order_number, p_customer_id, p_shipping_name, p_shipping_phone, p_shipping_address,
    p_shipping_city, p_shipping_province, p_shipping_postal_code, p_shipping_option_id,
    p_shipping_courier_snapshot, p_subtotal, p_shipping_cost, p_total, 'menunggu_pembayaran',
    p_payment_method, coalesce(p_notes, '')
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_variant := (v_item->>'variant_id')::uuid;
    v_qty := (v_item->>'qty')::int;

    update product_variants
      set stock = stock - v_qty
      where id = v_variant and is_active and stock >= v_qty
      returning stock into v_stock;
    if not found then
      raise exception 'Stok tidak cukup untuk varian %', v_variant;
    end if;

    insert into order_items (
      order_id, variant_id, product_name_snapshot, variant_name_snapshot,
      unit_price_snapshot, quantity, line_total
    ) values (
      v_order_id, v_variant, v_item->>'product_name', v_item->>'variant_name',
      (v_item->>'unit_price')::int, v_qty, ((v_item->>'unit_price')::int * v_qty)
    );
  end loop;

  insert into order_status_history (order_id, from_status, to_status, note)
    values (v_order_id, null, 'menunggu_pembayaran', 'Pesanan dibuat');

  return jsonb_build_object('order_number', p_order_number, 'id', v_order_id, 'status', 'menunggu_pembayaran');
end $$;

-- Lookup status pesanan untuk publik (tanpa membuka tabel orders).
create or replace function lookup_order(p_number text, p_phone text)
returns jsonb language plpgsql security definer as $$
declare r record;
begin
  select o.order_number, o.status, o.total, o.created_at,
         o.shipping_courier_snapshot as courier
    into r from orders o
    where o.order_number = p_number and o.shipping_phone = p_phone;
  if not found then return null; end if;
  return to_jsonb(r);
end $$;

-- Cek apakah user login adalah admin aktif.
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and is_active
  );
$$;

-- ============ ROW LEVEL SECURITY ============
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table customers enable row level security;
alter table shipping_options enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table order_status_history enable row level security;
alter table admin_users enable row level security;
alter table store_settings enable row level security;

-- Publik: baca katalog aktif & opsi kirim aktif.
create policy "public read active products" on products
  for select to anon, authenticated using (is_active);
create policy "public read active variants" on product_variants
  for select to anon, authenticated using (is_active);
create policy "public read images" on product_images
  for select to anon, authenticated using (true);
create policy "public read shipping" on shipping_options
  for select to anon, authenticated using (is_active);
create policy "public read settings" on store_settings
  for select to anon, authenticated using (true);

-- Publik: guest checkout (insert saja, tanpa baca balik).
create policy "anon insert customers" on customers
  for insert to anon with check (true);
create policy "anon insert orders" on orders
  for insert to anon with check (true);
create policy "anon insert items" on order_items
  for insert to anon with check (true);

-- Admin: akses penuh bila is_admin().
create policy "admin all products" on products
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all variants" on product_variants
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all images" on product_images
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all customers" on customers
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all shipping" on shipping_options
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all orders" on orders
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all items" on order_items
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all payments" on payments
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all history" on order_status_history
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all settings" on store_settings
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin read self" on admin_users
  for select to authenticated using (id = auth.uid() or is_admin());

-- ============ STORAGE (bucket: product-images, public read) ============
-- Jalankan di Dashboard > Storage: buat bucket "product-images" (public).
-- Policy via SQL:
-- create policy "public read images" on storage.objects
--   for select using (bucket_id = 'product-images');
-- create policy "admin upload images" on storage.objects
--   for insert to authenticated with check (bucket_id = 'product-images' and is_admin());
-- create policy "admin delete images" on storage.objects
--   for delete to authenticated using (bucket_id = 'product-images' and is_admin());

-- ============ SEED (placeholder, bisa diubah via admin) ============
insert into store_settings (key, value) values
  ('seller_whatsapp', '6280000000000'),
  ('payment_instructions', 'Transfer ke rekening/e-wallet Nordy Tech, lalu konfirmasi via WhatsApp dengan nomor pesanan.'),
  ('low_stock_threshold', '5'),
  ('hero_title', 'Aksesori yang lahir dari komponen teknologi'),
  ('hero_subtitle', 'Jepit rambut PCB dan keychain RJ45 — dipakai sebagai gaya, dikenali sebagai identitas.')
on conflict (key) do nothing;

insert into shipping_options (courier_name, service_name, estimate_text, cost) values
  ('JNE', 'Reguler', '2-3 hari', 12000),
  ('JNE', 'Express', '1 hari', 25000),
  ('Ambil di Tempat', 'Pickup', 'Sesuai janji', 0)
on conflict do nothing;
