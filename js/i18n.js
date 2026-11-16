// Nordy Tech — i18n (ID/EN). Ringan, tanpa dependensi.
(function () {
  const DICT = {
    id: {
      "nav.home": "Beranda",
      "nav.products": "Produk",
      "nav.howto": "Cara Pesan",
      "nav.track": "Lacak Pesanan",
      "nav.cart": "Keranjang",
      "skip": "Lewati ke konten",
      "brand.aria": "Nordy Tech - Beranda",
      "logo.alt": "Logo Nordy Tech",
      "theme.aria": "Ubah tema gelap/terang",
      "theme.toggle": "Ubah tema",
      "theme.light": "Mode terang",
      "theme.dark": "Mode gelap",
      "lang.aria": "Ubah bahasa/Change language",
      "footer.tagline": "Aksesori yang lahir dari komponen teknologi: dipakai sebagai gaya, dikenali sebagai identitas.",
      "footer.nav": "Navigasi",
      "footer.help": "Bantuan",
      "footer.privacy": "Kebijakan Privasi",
      "footer.terms": "Syarat & Ketentuan",
      "footer.copyright": "Seluruh harga dalam Rupiah (IDR).",
      "common.starting": "mulai",
      "common.available": "Tersedia",
      "common.lowstock": "Stok Menipis",
      "common.outofstock": "Habis",
      "common.variants": "varian",
      "common.viewdetail": "Lihat Detail",
      "common.backtocatalog": "Kembali ke katalog",
      "common.price_tbd": "Harga TBD",
      "common.addtocart": "Tambah ke Keranjang",
      "common.pickvariant": "Pilih varian terlebih dahulu.",
      "common.addedcart": "Ditambahkan ke keranjang.",
      "common.viewcart": "Lihat keranjang",
      "common.qty": "Jumlah",
      "common.stock": "Stok",
      "common.specs": "Spesifikasi",
      "common.variant": "Varian",
      "common.single.variant": "Varian tunggal",
      "common.product": "Produk",
      "common.noProducts.title": "Belum ada produk",
      "common.noProducts.desc": "Produk akan muncul setelah ditambahkan di admin.",
      "product.notfound.title": "Produk tidak ditemukan",
      "product.notfound.desc": "Slug produk tidak valid atau produk sudah tidak aktif.",
      "product.notfound.back": "Kembali ke Katalog",
      "qty.max": "Jumlah maksimal {max} sesuai stok.",
      "home.ticker": "Harga mulai Rp 15.000",
      "home.hero.badge": "Aksesori komponen",
      "home.hero.title": "Aksesori yang lahir dari komponen teknologi",
      "home.hero.sub": "Jepit rambut PCB dan keychain RJ45 — dipakai sebagai gaya, dikenali sebagai identitas.",
      "home.cta.catalog": "Lihat Katalog",
      "home.cta.howto": "Cara pesan",
      "home.spec.material": "Bahan",
      "home.spec.variants": "Varian",
      "home.spec.price": "Harga mulai",
      "home.spec.order": "Pesan",
      "home.spec.order.val": "via WhatsApp",
      "home.spec.material.val": "PCB FR-4 · Konektor RJ45",
      "home.spec.variants.val": "4 pilihan",
      "home.spec.price.val": "Rp 15.000",
      "home.featured.index": "01 — Katalog",
      "home.featured.title": "Produk Unggulan",
      "home.featured.desc": "Dua produk inti kami. Klik baris untuk lihat detail.",
      "home.manifesto.1": "Bukan aksesori biasa.",
      "home.manifesto.2": "Ini komponen teknologi yang kamu pakai setiap hari.",
      "home.mats.index": "02 — Bahan",
      "home.mats.title": "Bahan & Spesifikasi",
      "home.mats.desc": "Setiap produk dibuat tangan dalam jumlah kecil. Detail bahan agar kamu tahu persis apa yang dibeli.",
      "home.steps.index": "03 — Alur",
      "home.steps.title": "Cara Pemesanan",
      "home.steps.desc": "Lima langkah dari memilih produk sampai pesanan terkonfirmasi.",
      "home.batch": "Batch kecil — stok terbatas",
      "home.cta.title": "Siap memesan?",
      "home.cta.desc": "Pilih produk, kirim pesanan lewat WhatsApp, selesai dalam hitungan menit.",
      "home.cta.shop": "Mulai Belanja",
      "home.step.1.title": "Pilih Produk",
      "home.step.1.sub": "Lihat katalog dan detailnya",
      "home.step.2.title": "Tambah ke Keranjang",
      "home.step.2.sub": "Atur varian dan jumlah",
      "home.step.3.title": "Isi Data",
      "home.step.3.sub": "Nama, WhatsApp, alamat lengkap",
      "home.step.4.title": "Pilih Kirim & Konfirmasi",
      "home.step.4.sub": "Lihat ongkir dan total akhir",
      "home.step.5.title": "WhatsApp & Bayar",
      "home.step.5.sub": "Pesan terkirim otomatis ke penjual",
      "catalog.eyebrow": "Katalog",
      "catalog.title": "Semua Produk",
      "catalog.desc": "Dua produk inti, dibuat dalam jumlah terbatas."
    },
    en: {
      "nav.home": "Home",
      "nav.products": "Products",
      "nav.howto": "How to Order",
      "nav.track": "Track Order",
      "nav.cart": "Cart",
      "skip": "Skip to content",
      "brand.aria": "Nordy Tech - Home",
      "logo.alt": "Nordy Tech Logo",
      "theme.aria": "Toggle dark/light theme",
      "theme.toggle": "Toggle theme",
      "theme.light": "Light mode",
      "theme.dark": "Dark mode",
      "lang.aria": "Change language/Ubah bahasa",
      "footer.tagline": "Accessories born from technology components: worn as style, known as identity.",
      "footer.nav": "Navigation",
      "footer.help": "Help",
      "footer.privacy": "Privacy Policy",
      "footer.terms": "Terms & Conditions",
      "footer.copyright": "All prices in Rupiah (IDR).",
      "common.starting": "from",
      "common.available": "In Stock",
      "common.lowstock": "Low Stock",
      "common.outofstock": "Out of Stock",
      "common.variants": "variants",
      "common.viewdetail": "View Details",
      "common.backtocatalog": "Back to catalog",
      "common.price_tbd": "Price TBD",
      "common.addtocart": "Add to Cart",
      "common.pickvariant": "Select a variant first.",
      "common.addedcart": "Added to cart.",
      "common.viewcart": "View cart",
      "common.qty": "Quantity",
      "common.stock": "Stock",
      "common.specs": "Specifications",
      "common.variant": "Variant",
      "common.single.variant": "Single variant",
      "common.product": "Product",
      "common.noProducts.title": "No products yet",
      "common.noProducts.desc": "Products will appear after they are added in admin.",
      "product.notfound.title": "Product not found",
      "product.notfound.desc": "The product slug is invalid or the product is no longer active.",
      "product.notfound.back": "Back to Catalog",
      "qty.max": "Maximum {max} based on stock.",
      "home.ticker": "Prices from Rp 15,000",
      "home.hero.badge": "Component accessories",
      "home.hero.title": "Accessories born from technology components",
      "home.hero.sub": "PCB hair clips and RJ45 keychains — worn as style, known as identity.",
      "home.cta.catalog": "View Catalog",
      "home.cta.howto": "How to order",
      "home.spec.material": "Material",
      "home.spec.variants": "Variants",
      "home.spec.price": "From",
      "home.spec.order": "Order",
      "home.spec.order.val": "via WhatsApp",
      "home.spec.material.val": "PCB FR-4 · RJ45 Connector",
      "home.spec.variants.val": "4 options",
      "home.spec.price.val": "Rp 15,000",
      "home.featured.index": "01 — Catalog",
      "home.featured.title": "Featured Products",
      "home.featured.desc": "Our two core products. Click a row for details.",
      "home.manifesto.1": "Not ordinary accessories.",
      "home.manifesto.2": "These are technology components you wear every day.",
      "home.mats.index": "02 — Materials",
      "home.mats.title": "Materials & Specifications",
      "home.mats.desc": "Each product is handmade in small batches. Details so you know exactly what you buy.",
      "home.steps.index": "03 — Flow",
      "home.steps.title": "How to Order",
      "home.steps.desc": "Five steps from choosing a product to a confirmed order.",
      "home.batch": "Small batch — limited stock",
      "home.cta.title": "Ready to order?",
      "home.cta.desc": "Pick a product, send your order via WhatsApp, done in minutes.",
      "home.cta.shop": "Start Shopping",
      "home.step.1.title": "Choose Product",
      "home.step.1.sub": "Browse catalog and details",
      "home.step.2.title": "Add to Cart",
      "home.step.2.sub": "Select variant and quantity",
      "home.step.3.title": "Fill Details",
      "home.step.3.sub": "Name, WhatsApp, full address",
      "home.step.4.title": "Select Shipping & Confirm",
      "home.step.4.sub": "View shipping cost and final total",
      "home.step.5.title": "WhatsApp & Pay",
      "home.step.5.sub": "Order sent automatically to seller",
      "catalog.eyebrow": "Catalog",
      "catalog.title": "All Products",
      "catalog.desc": "Two core products, made in limited quantities."
    }
  };

  let lang = "id";

  function t(key, vars) {
    let s = (DICT[lang] && DICT[lang][key]) || (DICT.id[key]) || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
      });
    }
    return s;
  }

  function apply(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (el.hasAttribute("data-i18n-attr")) {
        el.setAttribute(el.getAttribute("data-i18n-attr"), val);
      } else {
        el.textContent = val;
      }
    });
  }

  function setLang(next) {
    lang = next === "en" ? "en" : "id";
    document.documentElement.lang = lang;
    apply();
    document.dispatchEvent(new CustomEvent("nordy:lang-applied", { detail: { lang: lang } }));
  }

  function getLang() { return lang; }

  // Init from storage / html lang
  const stored = (typeof localStorage !== "undefined") && localStorage.getItem("nordy-lang");
  lang = stored === "en" ? "en" : (document.documentElement.lang === "en" ? "en" : "id");

  window.NORDY_I18N = { t: t, apply: apply, setLang: setLang, getLang: getLang };

  document.addEventListener("nordy:lang-changed", function (e) {
    setLang(e.detail && e.detail.lang);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { apply(); });
  } else {
    apply();
  }
})();
