// Nordy Tech — Detail Produk (galeri, varian, stok, jumlah, tambah keranjang)
(function () {
  const U = window.NORDY_UTILS;
  const Data = window.NORDY_DATA;
  window.NORDY_LAYOUT.mount("produk");

  const wrap = document.getElementById("productWrap");

  // Slug dibaca dari clean URL /produk/<slug>, fallback ke ?slug=<slug>.
  function deriveSlug() {
    const m = location.pathname.replace(/\/+$/, "").match(/\/produk\/([^/]+)$/i);
    if (m) return decodeURIComponent(m[1]);
    return U.qs("slug");
  }
  const slug = deriveSlug();
  let product = null;
  let selectedVariant = null;
  let qty = 1;
  let settings = { low_stock_threshold: "5" };

  function notFound() {
    document.title = "Produk tidak ditemukan — Nordy Tech";
    wrap.innerHTML = '<div class="empty"><div class="icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M21 21l-6-6"/></svg></div><h3 data-i18n="product.notfound.title">Produk tidak ditemukan</h3>' +
      '<p class="muted" data-i18n="product.notfound.desc">Slug produk tidak valid atau produk sudah tidak aktif.</p>' +
      '<a class="button mt-6" href="/produk" data-i18n="product.notfound.back">Kembali ke Katalog</a></div>';
  }

  function imagesOf(p) {
    if (p.images && p.images.length) {
      return p.images.map(function (im) {
        const url = window.NORDY_DB.isReady() ? window.NORDY_DB.publicUrl(im.url) : im.url;
        const webp = url.replace(/\.[a-z0-9]+$/i, ".webp");
        return { url: url, webp: webp, alt: im.alt_text || p.name };
      });
    }
    const arr = window.NORDY_PLACEHOLDERS?.[p.slug] || [];
    return arr.map(function (u, i) { return { url: u, alt: p.name + " " + (i + 1) }; });
  }

  function render() {
    const imgs = imagesOf(product);
    const variants = (product.variants || []).filter(function (v) { return v.is_active; });
    const specs = product.specifications || {};
    const specRows = Object.keys(specs).map(function (k) {
      return '<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--color-surface-muted)"><span class="muted">' + U.escapeHtml(k) + '</span><strong>' + U.escapeHtml(specs[k]) + '</strong></div>';
    }).join("");

    const galleryTop = imgs.length
      ? '<div class="thumb ' + (product.accent ? 'thumb--' + product.accent : '') + '" id="mainImage" style="border:2px solid var(--color-ink);border-radius:var(--radius-md);overflow:hidden;aspect-ratio:4/3;background:var(--color-surface-muted)"><img src="' + U.escapeHtml(imgs[0].url) + '" alt="' + U.escapeHtml(imgs[0].alt) + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy" decoding="async" srcset="' + U.escapeHtml(imgs[0].webp) + ' 1x"></div>'
      : '<div class="thumb ' + (product.accent ? 'thumb--' + product.accent : '') + '" style="display:grid;place-items:center;border:2px solid var(--color-ink);border-radius:var(--radius-md);aspect-ratio:4/3;font-size:96px">' + '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3z"/><path d="M7 7v14M12 7v14"/></svg>' + '</div>';

    const thumbs = imgs.length > 1 ? '<div class="thumb-strip" role="group" aria-label="Pilih foto">' + imgs.map(function (im, i) {
      const webp = im.webp ? im.webp : im.url.replace(/\.[a-z0-9]+$/i, ".webp");
      return '<button type="button" class="thumb-btn' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '" aria-label="' + U.escapeHtml(im.alt || ("Foto " + (i + 1))) + '"><img src="' + U.escapeHtml(im.url) + '" srcset="' + U.escapeHtml(webp) + ' 1x" alt=""></button>';
    }).join("") + '</div>' : '';

    const variantBtns = variants.map(function (v) {
      return '<button type="button" class="variant-option" data-variant="' + v.id + '" aria-pressed="false"' + (v.stock <= 0 ? ' disabled' : '') + '>' +
        U.escapeHtml(v.name) + ' — ' + U.rupiah(v.price) + (v.stock <= 0 ? ' (habis)' : '') + '</button>';
    }).join("");

    wrap.innerHTML = '' +
    '<nav class="mt-2 mb-6" aria-label="Breadcrumb"><a href="/produk" class="muted" data-i18n="common.backtocatalog">← Kembali ke katalog</a></nav>' +
    '<div class="grid-2">' +
      '<div>' + galleryTop + thumbs + '</div>' +
      '<div class="stack stack-4">' +
        '<div><span class="eyebrow" data-i18n="common.product">Produk</span><h1 style="font-size:clamp(28px,4vw,36px)">' + U.escapeHtml(product.name) + '</h1></div>' +
        '<div id="priceLine" class="price" style="font-size:30px;font-weight:800"></div>' +
        '<p class="muted">' + U.escapeHtml(product.description) + '</p>' +
        '<div><h3 style="font-size:16px" class="mb-2" data-i18n="common.variant">Varian</h3><div class="variant-options" id="variantOptions">' + (variantBtns || '<span class="muted" data-i18n="common.single.variant">Varian tunggal</span>') + '</div></div>' +
        '<div id="stockLine" class="meta"></div>' +
        '<div><h3 style="font-size:16px" class="mb-2" data-i18n="common.qty">Jumlah</h3>' +
          '<div class="qty"><button type="button" id="qtyMinus" aria-label="Kurangi">−</button>' +
          '<input type="number" id="qtyInput" value="1" min="1" inputmode="numeric" aria-label="Jumlah">' +
          '<button type="button" id="qtyPlus" aria-label="Tambah">+</button></div>' +
        '</div>' +
        '<button class="button button--block" id="addBtn" data-i18n="common.addtocart">Tambah ke Keranjang</button>' +
        '<div id="addMsg"></div>' +
        (specRows ? '<div class="card card--flat mt-4"><h3 style="font-size:16px" class="mb-2" data-i18n="common.specs">Spesifikasi</h3>' + specRows + '</div>' : '') +
      '</div>' +
    '</div>';

    // JSON-LD Product schema (dinamis, setelah data product ada)
    if (window.NORDY_DATA) {
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || "",
        "brand": { "@type": "Brand", "name": "Nordy Tech" },
        "image": imgs.length ? U.escapeHtml(imgs[0].url) : "",
        "price": variants.length ? variants[0].price : 0,
        "priceCurrency": "IDR",
        "availability": variants.length && variants[0].stock > 0 ? "InStock" : "OutOfStock",
        "seller": { "@type": "Organization", "name": "Nordy Tech" }
      };
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    bindEvents(imgs, variants);
    selectVariant(variants.length === 1 ? variants[0] : null);
  }

  function selectVariant(v) {
    selectedVariant = v;
    document.querySelectorAll(".variant-option").forEach(function (b) {
      b.setAttribute("aria-pressed", v && b.dataset.variant === v.id ? "true" : "false");
    });
    const priceLine = document.getElementById("priceLine");
    const stockLine = document.getElementById("stockLine");
    const addBtn = document.getElementById("addBtn");
    if (v) {
      priceLine.textContent = U.rupiah(v.price);
      const badge = U.stockBadge(v, Number(settings.low_stock_threshold) || 5);
      stockLine.innerHTML = 'Stok: <span class="badge ' + badge.cls + '">' + badge.label + '</span> ' + (v.stock > 0 ? '(' + v.stock + ' tersedia)' : '');
      addBtn.disabled = v.stock <= 0;
      addBtn.textContent = v.stock <= 0 ? "Stok Habis" : "Tambah ke Keranjang";
      qty = 1;
      const qi = document.getElementById("qtyInput");
      if (qi) { qi.value = 1; qi.max = Math.max(1, v.stock); }
    } else {
      const minP = Data.helpers.minPrice(product);
      priceLine.textContent = U.rupiah(minP) + " mulai";
      stockLine.textContent = "Pilih varian untuk melihat stok.";
      addBtn.disabled = false;
      addBtn.textContent = "Tambah ke Keranjang";
    }
  }

  function bindEvents(imgs, variants) {
    // gallery
    document.querySelectorAll(".thumb-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        const i = Number(b.dataset.idx);
        document.querySelectorAll(".thumb-btn").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        const im = imgs[i];
        const webp = im.webp ? im.webp : im.url.replace(/\.[a-z0-9]+$/i, ".webp");
        document.getElementById("mainImage").innerHTML = '<img src="' + U.escapeHtml(im.url) + '" srcset="' + U.escapeHtml(webp) + ' 1x" alt="' + U.escapeHtml(im.alt) + '" style="width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async">';
      });
    });
    // variants
    document.querySelectorAll(".variant-option").forEach(function (b) {
      b.addEventListener("click", function () {
        const v = variants.find(function (x) { return x.id === b.dataset.variant; });
        selectVariant(v);
      });
    });
    // qty
    const qi = document.getElementById("qtyInput");
    document.getElementById("qtyMinus").addEventListener("click", function () { setQty(qty - 1); });
    document.getElementById("qtyPlus").addEventListener("click", function () { setQty(qty + 1); });
    qi.addEventListener("change", function () { setQty(Number(qi.value)); });
    // add
    document.getElementById("addBtn").addEventListener("click", addToCart);
  }

  function setQty(n) {
    const max = selectedVariant ? Math.max(1, selectedVariant.stock) : 1;
    let v = Number(n) || 1;
    if (v < 1) v = 1;
    if (selectedVariant && v > max) { v = max; U.toast("Jumlah maksimal " + max + " sesuai stok.", "error"); }
    qty = v;
    const qi = document.getElementById("qtyInput");
    if (qi) qi.value = v;
  }

  function addToCart() {
    const msg = document.getElementById("addMsg");
    if (!selectedVariant) {
      msg.innerHTML = '<div class="alert alert--error">Pilih varian terlebih dahulu.</div>';
      U.toast("Pilih varian terlebih dahulu.", "error");
      return;
    }
    if (selectedVariant.stock <= 0) {
      msg.innerHTML = '<div class="alert alert--error">Stok varian ini habis.</div>';
      return;
    }
    const imgs = imagesOf(product);
    window.NORDY_CART.add({
      variant_id: selectedVariant.id, product_id: product.id, slug: product.slug,
      product_name: product.name, variant_name: selectedVariant.name,
      price: selectedVariant.price, qty: qty,
      image: imgs.length ? imgs[0].url : (product.emoji || ""),
      stock: selectedVariant.stock
    });
    msg.innerHTML = '<div class="alert alert--success">Ditambahkan ke keranjang. <a href="/keranjang">Lihat keranjang</a></div>';
    U.toast("Ditambahkan ke keranjang.");
  }

  async function init() {
    if (!slug) { location.replace("/produk"); return; }
    settings = await Data.settings();
    product = await Data.productBySlug(slug);
    if (!product || product.is_active === false) { notFound(); return; }
    document.title = product.name + " — Nordy Tech";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", (product.description || "").slice(0, 155));
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute("href", location.origin + "/produk/" + product.slug);
    render();
    window.NORDY_I18N.apply();
  }

  init();
})();
