# Nordy Tech E-Commerce

Website e-commerce vanilla **HTML + CSS + JS + Supabase** (tanpa build step, tanpa Node runtime).  
Didesain untuk MVP: 2 produk (Jepit Rambut PCB & Keychain RJ45), checkout via WhatsApp, admin dashboard lengkap.

## Stack & Arsitektur

- **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla ES6 Modules
- **Styling**: Neo-Brutalism design system (acuan `design.md`)
- **Backend & Auth**: Supabase (PostgreSQL, Auth, Storage, Realtime, RPC)
- **Hosting**: Static hosting (Vercel / Netlify / GitHub Pages / Cloudflare Pages)
- **Database**: PostgreSQL via Supabase (RLS, CHECK constraints, RPC transaksi atomik)

## Struktur Project

```
nordytech/
├── index.html              # Landing page
├── produk.html             # Katalog 2 produk
├── produk-detail.html      # Detail produk (galeri, varian, stok, tambah keranjang)
├── keranjang.html          # Keranjang (ubah/hapus, validasi stok server)
├── checkout.html           # Form checkout + ongkir + simpan pesanan + WA
├── konfirmasi.html         # Konfirmasi + nomor pesanan + WA + instruksi bayar
├── lacak.html              # Lacak pesanan (no. pesanan + WA)
├── css/
│   ├── tokens.css          # Design tokens (warna, radius, shadow, spacing)
│   ├── globals.css         # Reset, layout, grid, tipografi, utility
│   └── components.css      # Button, Input, Card, Badge, Header, Footer, Modal, Table, Admin shell
├── js/
│   ├── config.js           # Supabase URL + Anon Key (+ DEMO_MODE fallback)
│   ├── utils.js            # Format rupiah, phone normalize, toast, loading
│   ├── supabase-client.js  # Wrapper @supabase/supabase-js (CDN)
│   ├── demo-data.js        # Data contoh untuk preview tanpa Supabase
│   ├── data.js             # Data layer (Supabase first, fallback demo)
│   ├── cart.js             # Keranjang localStorage (TTL 7 hari)
│   ├── layout.js           # Header + Footer + cart badge
│   ├── index.js            # Landing page logic
│   ├── produk.js           # Katalog logic
│   ├── produk-detail.js    # Detail produk logic
│   ├── keranjang.js        # Keranjang logic
│   ├── checkout.js         # Checkout + create_order RPC + WA
│   ├── konfirmasi.js       # Konfirmasi page
│   ├── lacak.js            # Lacak pesanan (lookup_order RPC)
│   ├── admin-guard.js      # Auth guard + admin side nav
│   ├── admin-login.js      # Login page (rate limit client-side)
│   ├── admin-dashboard.js  # Dashboard stats + recent orders
│   ├── admin-produk.js     # CRUD produk, varian, foto (Storage)
│   ├── admin-pesanan.js    # Daftar pesanan, detail, state machine status
│   └── admin-pengaturan.js # Settings (toko, hero, ongkir)
├── admin/
│   ├── login.html
│   ├── index.html          # Dashboard
│   ├── produk.html
│   ├── pesanan.html
│   └── pengaturan.html
├── supabase/
│   └── schema.sql          # Full schema: tables, RLS, RPC, seed
└── README.md               # (file ini)
```

## Quick Start

### 1. Buat Proyek Supabase
1. Buka [supabase.com](https://supabase.com) → New Project.
2. Catat **Project URL** dan **anon public key** (Settings → API).

### 2. Jalankan Skema Database
- Buka **SQL Editor** di dashboard Supabase.
- Paste isi `supabase/schema.sql` → Run.
- Verifikasi tabel terbentuk: `products`, `product_variants`, `orders`, `order_items`, `admin_users`, `store_settings`, `shipping_options`, dll.
- Buat bucket Storage: **Storage → New bucket** → nama `product-images` → **Public bucket** ✓.

### 3. Buat Akun Admin
- Supabase Dashboard → **Authentication → Users → Add user** → email + password.
- Jalankan di SQL Editor:
  ```sql
  insert into admin_users (id, email, name, role, is_active)
  values ('<uuid-dari-auth-users>', 'email@admin.com', 'Admin', 'owner', true);
  ```

### 4. Konfigurasi Frontend
Edit `js/config.js`:
```js
window.NORDY_CONFIG = {
  SUPABASE_URL: "https://xxxxxxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  STORAGE_BUCKET: "product-images",
  // ...
};
```

### 5. Deploy Static
- Push ke GitHub → Import di Vercel/Netlify/Cloudflare Pages.
- **Build Command**: *(kosong)* — tidak ada build step.
- **Output Directory**: root (`/`) atau folder project.
- HTTPS otomatis.

### 6. Verifikasi
- Buka `/` → Landing page tampil.
- Buka `/produk.html` → 2 produk (demo mode jika Supabase belum diset).
- Buka `/admin/login.html` → Login admin → Dashboard, Produk, Pesanan, Pengaturan.

## Mode Demo (Tanpa Supabase)
Jika `SUPABASE_URL`/`ANON_KEY` kosong, aplikasi otomatis pakai `js/demo-data.js`.  
UI menampilkan badge **"Contoh"** dan data tidak tersimpan. Cocok untuk preview desain & alur.

## Fitur MVP (Sesuai PRD)

| Area | Fitur |
|---|---|
| **Publik** | Landing (hero, featured, fitur, langkah), Katalog, Detail (galeri, varian, stok, qty), Keranjang (validasi stok server), Checkout (form, ongkir manual, total server-side), Konfirmasi (nomor pesanan `NRD-YYMMDD-XXXX`, WA auto-filled), Lacak Pesanan |
| **Admin** | Login (Supabase Auth + rate limit), Dashboard (statistik hari/bulan, menunggu bayar, stok menipis), CRUD Produk (nama, slug, deskripsi, specs, foto, varian harga/stok), CRUD Varian (SKU, harga, stok), Upload foto ke Supabase Storage, Daftar Pesanan (cari, filter status), Detail Pesanan (item, riwayat status, ubah status via state machine), Pengaturan Toko (WA penjual, instruksi bayar, ambang stok, hero), CRUD Opsi Pengiriman (kurir, layanan, estimasi, biaya) |
| **Database** | Transaksi atomik `create_order` (header + item + reservasi stok), `reserve_stock` / `release_stock` RPC, RLS ketat (anon read katalog, admin full), CHECK `stock >= 0`, Snapshot harga di `order_items` |
| **Non-Fungsional** | Mobile-first, responsive 360/768/1280px, WCAG AA (kontras, focus, label, keyboard), SEO dasar (meta, OG, slug), CSP-ready (inline script hanya di HTML, CSP `script-src 'self' https://cdn.jsdelivr.net`), `prefers-reduced-motion` dihormati |

## Environment Variables (Production)

| Variable | Contoh | Keterangan |
|---|---|---|
| `SUPABASE_URL` | `https://xyz.supabase.co` | Project URL |
| `SUPABASE_ANON_KEY` | `eyJ...` | Anon public key |
| `STORAGE_BUCKET` | `product-images` | Nama bucket Storage |

> **Jangan commit `js/config.js` dengan kredensial asli.** Gunakan environment variable di platform hosting (Vercel: Project Settings → Environment Variables). `js/config.js` production bisa dibaca dari `window.ENV` yang di-inject saat build/deploy.

## Development Tips

- **Tanpa server lokal**: Buka `index.html` langsung via `file://` — demo mode aktif.
- **Dengan local server** (opsional, untuk Service Worker / CORS):
  ```bash
  npx serve .   # atau python -m http.server 8080
  ```
- **Lint CSS**: pakai `stylelint` (opsional). CSS pakai custom properties, tidak perlu preprocessor.
- **Type-check**: tidak ada (vanilla JS). Gunakan JSDoc di `js/*.js` jika perlu.

## Checklist Sebelum Launch (MVP)

- [ ] Supabase project dibuat, schema dijalankan, bucket `product-images` public.
- [ ] Akun admin dibuat & masuk tabel `admin_users`.
- [ ] `js/config.js` diisi kredensial production (via ENV hosting).
- [ ] Data produk asli dimasukkan via Admin → Produk (foto, varian, harga, stok).
- [ ] Opsi pengiriman diisi via Admin → Pengaturan (kurir, biaya, estimasi).
- [ ] Nomor WA penjual & instruksi pembayaran diisi.
- [ ] Domain custom + HTTPS aktif.
- [ ] Test end-to-end: beli → checkout → WA terbuka → admin terima pesanan → ubah status → stok berkurang.
- [ ] Lighthouse mobile: Performance, Accessibility, SEO ≥ 90.
- [ ] Backup database harian (Supabase → Settings → Database → Backups).

## Lisensi & Credit

- Design system: acuan `design.md` (Neo-Brutalism, referensi: task dashboard, link-saving, neo-brutalism UI library).
- Icons: Unicode emoji + Lucide (jika dipakai via CDN).
- Fonts: Inter / Plus Jakarta Sans (Google Fonts).
- Supabase JS client via jsDelivr CDN.

---

**Nordy Tech** — Aksesori yang lahir dari komponen teknologi. 💜🔌#   n o r d y t e x h c h  
 