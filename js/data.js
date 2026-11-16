// Nordy Tech — Data layer (Supabase dulu, fallback mode contoh)
(function () {
  const U = window.NORDY_UTILS;

  function demoMode() {
    return { demo: true, products: window.NORDY_DEMO.products, settings: window.NORDY_DEMO.settings, shipping: window.NORDY_DEMO.shipping };
  }

  function thumbOf(p) {
    const img = (p.images && p.images[0] && (p.images[0].url || p.images[0])) || "";
    if (img && window.NORDY_DB.isReady()) return window.NORDY_DB.publicUrl(img);
    if (img) return img;
    return placeholderFor(p.slug);
  }

  function minPrice(p) { return Math.min.apply(null, p.variants.filter(function (v) { return v.is_active; }).map(function (v) { return v.price; }).concat([Infinity])); }
  function totalStock(p) { return p.variants.reduce(function (s, v) { return s + (v.is_active ? v.stock : 0); }, 0); }

  // Fallback default bila produk di Supabase belum punya foto.
  const PLACEHOLDERS = {
    "jepit-rambut-pcb": ["assets/products/jepit-rambut-pcb.svg", "assets/products/jepit-rambut-pcb-2.svg"],
    "keychain-rj45": ["assets/products/keychain-rj45.svg", "assets/products/keychain-rj45-2.svg"]
  };
  function placeholderFor(slug) {
    const arr = PLACEHOLDERS[slug] || [];
    return arr[0] || "";
  }
  window.NORDY_PLACEHOLDERS = PLACEHOLDERS;

  const Data = {
    isDemo: function () { return !window.NORDY_DB.isReady(); },

    settings: async function () {
      if (!window.NORDY_DB.isReady()) return window.NORDY_DEMO.settings;
      try {
        const sb = window.NORDY_DB.client();
        const { data } = await sb.from("store_settings").select("key,value");
        const out = Object.assign({}, window.NORDY_DEMO.settings);
        (data || []).forEach(function (r) { out[r.key] = r.value; });
        return out;
      } catch (e) { return window.NORDY_DEMO.settings; }
    },

    shippingOptions: async function () {
      if (!window.NORDY_DB.isReady()) return window.NORDY_DEMO.shipping;
      const sb = window.NORDY_DB.client();
      const { data, error } = await sb.from("shipping_options").select("*").eq("is_active", true).order("cost");
      if (error || !data) return window.NORDY_DEMO.shipping;
      return data;
    },

    products: async function () {
      if (!window.NORDY_DB.isReady()) return window.NORDY_DEMO.products;
      const sb = window.NORDY_DB.client();
      const { data, error } = await sb
        .from("products").select("*, product_variants(*), product_images(*)")
        .eq("is_active", true).order("created_at");
      if (error || !data) return window.NORDY_DEMO.products;
      return data.map(function (p) {
        return Object.assign({}, p, {
          variants: (p.product_variants || []).filter(function (v) { return v.is_active; }),
          images: (p.product_images || []).sort(function (a, b) { return a.sort_order - b.sort_order; })
        });
      });
    },

    productBySlug: async function (slug) {
      const all = await Data.products();
      return (all || []).find(function (p) { return p.slug === slug; }) || null;
    },

    // Validasi stok & harga dari server. Return {ok, problems:[variant_id]}.
    validateCart: async function (items) {
      if (!window.NORDY_DB.isReady()) {
        const all = window.NORDY_DEMO.products;
        const problems = [];
        items.forEach(function (it) {
          let found = null;
          all.forEach(function (p) { (p.variants || []).forEach(function (v) { if (v.id === it.variant_id) found = v; }); });
          if (!found || found.stock < it.qty) problems.push(it.variant_id);
        });
        return { ok: problems.length === 0, problems: problems };
      }
      const sb = window.NORDY_DB.client();
      const ids = items.map(function (i) { return i.variant_id; });
      if (!ids.length) return { ok: true, problems: [] };
      const { data } = await sb.from("product_variants").select("id,price,stock,is_active").in("id", ids);
      const map = {};
      (data || []).forEach(function (v) { map[v.id] = v; });
      const problems = [];
      items.forEach(function (it) {
        const v = map[it.variant_id];
        if (!v || !v.is_active || v.stock < it.qty) problems.push(it.variant_id);
        else it.price = v.price; // harga server adalah kebenaran (FR-SC-07)
      });
      return { ok: problems.length === 0, problems: problems };
    },

    helpers: { thumbOf: thumbOf, minPrice: minPrice, totalStock: totalStock }
  };

  window.NORDY_DATA = Data;
})();
