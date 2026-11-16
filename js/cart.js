// Nordy Tech — Keranjang (localStorage, TTL 7 hari, PRD FR-SC-05)
(function () {
  const cfg = window.NORDY_CONFIG;
  const KEY = cfg.CART_KEY;
  const TTL = (cfg.CART_TTL_DAYS || 7) * 24 * 60 * 60 * 1000;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { savedAt: Date.now(), items: [] };
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.items)) return { savedAt: Date.now(), items: [] };
      if (Date.now() - (data.savedAt || 0) > TTL) {
        localStorage.removeItem(KEY);
        return { savedAt: Date.now(), items: [] };
      }
      return data;
    } catch (e) { return { savedAt: Date.now(), items: [] }; }
  }

  function save(data) {
    data.savedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("nordy:cart-changed"));
  }

  const Cart = {
    items: function () { return load().items; },
    count: function () { return load().items.reduce(function (s, i) { return s + (Number(i.qty) || 0); }, 0); },
    subtotal: function () { return load().items.reduce(function (s, i) { return s + (Number(i.price) || 0) * (Number(i.qty) || 0); }, 0); },
    add: function (entry) {
      // entry: {variant_id, product_id, slug, product_name, variant_name, price, qty, image, stock}
      const data = load();
      const found = data.items.find(function (i) { return i.variant_id === entry.variant_id; });
      const max = Number(entry.stock) || 99;
      if (found) {
        found.qty = Math.min(max, (Number(found.qty) || 0) + (Number(entry.qty) || 1));
        found.price = entry.price; found.stock = max;
      } else {
        data.items.push({
          variant_id: entry.variant_id, product_id: entry.product_id, slug: entry.slug,
          product_name: entry.product_name, variant_name: entry.variant_name,
          price: entry.price, qty: Math.min(max, Number(entry.qty) || 1),
          image: entry.image || "", stock: max
        });
      }
      save(data);
    },
    setQty: function (variantId, qty) {
      const data = load();
      const it = data.items.find(function (i) { return i.variant_id === variantId; });
      if (!it) return;
      const q = Math.max(1, Math.min(Number(it.stock) || 99, Number(qty) || 1));
      it.qty = q;
      save(data);
    },
    remove: function (variantId) {
      const data = load();
      data.items = data.items.filter(function (i) { return i.variant_id !== variantId; });
      save(data);
    },
    clear: function () { save({ savedAt: Date.now(), items: [] }); }
  };

  window.NORDY_CART = Cart;
})();
