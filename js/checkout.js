// Nordy Tech — Checkout (form, kurir, validasi, simpan pesanan, WhatsApp)
(function () {
  const U = window.NORDY_UTILS;
  const Data = window.NORDY_DATA;
  const Cart = window.NORDY_CART;
  window.NORDY_LAYOUT.mount("keranjang");
  const wrap = document.getElementById("checkoutWrap");
  let shippingOptions = [];
  let settings = { seller_whatsapp: "6280000000000", payment_instructions: "" };
  let submitting = false;

  function newUuid() {
    return (window.crypto && crypto.randomUUID && crypto.randomUUID())
      || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  }

  const STEPS = '' +
    '<ol class="checkout-steps" aria-label="Langkah checkout">' +
      '<li class="step done">1 &middot; Keranjang</li>' +
      '<li class="step active" aria-current="step">2 &middot; Data Penerima</li>' +
      '<li class="step">3 &middot; Selesai</li>' +
    '</ol>';

  function shipOptionsHTML(selectedId) {
    if (!shippingOptions.length) {
      return '<p class="alert alert--warning">Belum ada opsi pengiriman aktif. Hubungi penjual via WhatsApp.</p>';
    }
    return '<fieldset id="fkirim" class="ship-list"><legend class="sr-only">Pilih kurir dan layanan</legend>' +
      shippingOptions.map(function (s) {
        const checked = s.id === selectedId ? " checked" : "";
        return '<label class="ship-option">' +
          '<input type="radio" name="shipping_id" value="' + s.id + '"' + checked + '>' +
          '<span class="ship-body"><strong>' + U.escapeHtml(s.courier_name + " — " + s.service_name) + '</strong>' +
          '<span class="muted">' + U.escapeHtml(s.estimate_text || "-") + '</span></span>' +
          '<span class="ship-price">' + U.rupiah(s.cost) + '</span>' +
        '</label>';
      }).join("") + '</fieldset><span class="field-error" id="e-ship"></span>';
  }

  function buildForm(selectedShipId) {
    const items = Cart.items();
    const sub = Cart.subtotal();
    const shipCost = Number((shippingOptions.find(function (s) { return s.id === selectedShipId; }) || {}).cost || 0);
    const total = sub + shipCost;

    const itemRows = items.map(function (it) {
      return '<div class="order-line"><span>' + U.escapeHtml(it.product_name) +
        ' <span class="muted">(' + U.escapeHtml(it.variant_name) + ') &times;' + it.qty + '</span></span>' +
        '<strong>' + U.rupiah(it.price * it.qty) + '</strong></div>';
    }).join("");

    return '' + STEPS +
    '<form id="checkoutForm" novalidate>' +
      '<div class="checkout-grid">' +
        '<div class="checkout-form-col">' +
          '<section class="card">' +
            '<h2 class="card-title mb-4">Data Penerima</h2>' +
            '<div class="field"><label for="fnama">Nama Lengkap <span aria-hidden="true">*</span></label>' +
              '<input class="input" type="text" id="fnama" name="nama" required autocomplete="name" aria-required="true"><span class="field-error" id="e-nama"></span></div>' +
            '<div class="field"><label for="fwa">Nomor WhatsApp <span aria-hidden="true">*</span></label>' +
              '<input class="input" type="tel" id="fwa" name="whatsapp" required inputmode="tel" autocomplete="tel" placeholder="08xx xxxx xxxx" aria-required="true">' +
              '<span class="hint">Format Indonesia: 08xx atau +62/62</span><span class="field-error" id="e-wa"></span></div>' +
            '<div class="field"><label for="femail">Email (opsional)</label>' +
              '<input class="input" type="email" id="femail" name="email" autocomplete="email"><span class="field-error" id="e-email"></span></div>' +
            '<div class="field"><label for="falamat">Alamat Lengkap <span aria-hidden="true">*</span></label>' +
              '<textarea class="textarea" id="falamat" name="alamat" required autocomplete="street-address" rows="3" aria-required="true"></textarea>' +
              '<span class="field-error" id="e-alamat"></span></div>' +
            '<div class="form-row">' +
              '<div class="field grow"><label for="fkota">Kota/Kabupaten <span aria-hidden="true">*</span></label><input class="input" type="text" id="fkota" name="kota" required aria-required="true"><span class="field-error" id="e-kota"></span></div>' +
              '<div class="field grow"><label for="fprov">Provinsi <span aria-hidden="true">*</span></label><input class="input" type="text" id="fprov" name="provinsi" required aria-required="true"><span class="field-error" id="e-prov"></span></div>' +
              '<div class="field"><label for="fkode">Kode Pos <span aria-hidden="true">*</span></label><input class="input" type="text" id="fkode" name="kodepos" required inputmode="numeric" autocomplete="postal-code" maxlength="5" pattern="[0-9]{5}" aria-required="true"><span class="field-error" id="e-kode"></span></div>' +
            '</div>' +
            '<div class="field"><label for="fcatatan">Catatan (opsional)</label>' +
              '<textarea class="textarea" id="fcatatan" name="catatan" rows="2" placeholder="Instruksi khusus untuk kurir..."></textarea></div>' +
          '</section>' +
          '<section class="card mt-4">' +
            '<h2 class="card-title mb-2">Metode Pengiriman</h2>' +
            '<p class="muted mb-4">Pilih kurir dan layanan sesuai kebutuhanmu.</p>' +
            shipOptionsHTML(selectedShipId) +
          '</section>' +
        '</div>' +
        '<aside class="checkout-summary-col">' +
          '<div class="card summary-card">' +
            '<h2 class="card-title mb-4">Ringkasan Pesanan</h2>' +
            '<div class="stack stack-2">' + itemRows + '</div>' +
            '<hr class="divider">' +
            '<div class="order-line"><span class="muted">Subtotal (' + Cart.count() + ' item)</span><strong>' + U.rupiah(sub) + '</strong></div>' +
            '<div class="order-line mt-2"><span class="muted">Ongkir</span><strong id="shipCost">' + U.rupiah(shipCost) + '</strong></div>' +
            '<hr class="divider">' +
            '<div class="order-line total-row"><strong>Total</strong><strong id="grandTotal">' + U.rupiah(total) + '</strong></div>' +
            '<div id="formMsg" class="mt-4"></div>' +
            '<button type="submit" class="button button--block mt-4" id="submitBtn">Konfirmasi &amp; Pesan via WhatsApp</button>' +
            '<p class="meta mt-3" style="text-align:center">Pesanan disimpan lebih dulu, lalu WhatsApp terbuka otomatis.</p>' +
          '</div>' +
        '</aside>' +
      '</div>' +
    '</form>';
  }

  function updateShipping(form) {
    const checked = form.querySelector('input[name="shipping_id"]:checked');
    const opt = checked ? shippingOptions.find(function (s) { return s.id === checked.value; }) : null;
    const cost = opt ? opt.cost : 0;
    form.querySelector("#shipCost").textContent = U.rupiah(cost);
    form.querySelector("#grandTotal").textContent = U.rupiah(Cart.subtotal() + cost);
  }

  function bind(form) {
    form.querySelectorAll('input[name="shipping_id"]').forEach(function (r) {
      r.addEventListener("change", function () { updateShipping(form); });
    });
    form.querySelector("#fwa").addEventListener("blur", function () {
      if (this.value) this.value = U.normalizePhone(this.value);
    });
    form.addEventListener("submit", onSubmit);
  }

  function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach(function (e) { e.textContent = ""; });
    form.querySelectorAll("[aria-invalid]").forEach(function (i) { i.removeAttribute("aria-invalid"); });
  }

  function setError(form, field, msg) {
    const el = form.querySelector("#e-" + field);
    if (el) el.textContent = msg;
    const inp = form.querySelector("#f" + field);
    if (inp) inp.setAttribute("aria-invalid", "true");
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    const form = e.target;
    clearErrors(form);
    const fd = new FormData(form);
    const payload = {
      nama: (fd.get("nama") || "").toString().trim(),
      whatsapp: U.normalizePhone(fd.get("whatsapp")),
      email: (fd.get("email") || "").toString().trim(),
      alamat: (fd.get("alamat") || "").toString().trim(),
      kota: (fd.get("kota") || "").toString().trim(),
      provinsi: (fd.get("provinsi") || "").toString().trim(),
      kodepos: (fd.get("kodepos") || "").toString().trim(),
      catatan: (fd.get("catatan") || "").toString().trim(),
      shipping_id: fd.get("shipping_id")
    };
    let valid = true;
    if (!payload.nama) { setError(form, "nama", "Nama wajib diisi."); valid = false; }
    if (!payload.whatsapp || !U.isValidPhone(payload.whatsapp)) { setError(form, "wa", "Nomor WhatsApp tidak valid."); valid = false; }
    if (payload.email && !U.isValidEmail(payload.email)) { setError(form, "email", "Format email tidak valid."); valid = false; }
    if (!payload.alamat) { setError(form, "alamat", "Alamat wajib diisi."); valid = false; }
    if (!payload.kota) { setError(form, "kota", "Kota wajib diisi."); valid = false; }
    if (!payload.provinsi) { setError(form, "prov", "Provinsi wajib diisi."); valid = false; }
    if (!payload.kodepos || !U.isValidPostal(payload.kodepos)) { setError(form, "kode", "Kode pos 5 digit wajib diisi."); valid = false; }
    if (!payload.shipping_id) { setError(form, "ship", "Pilih metode pengiriman."); valid = false; }
    if (!valid) {
      U.toast("Perbaiki kolom yang ditandai.", "error");
      const firstErr = form.querySelector('[aria-invalid="true"]');
      if (firstErr && firstErr.focus) firstErr.focus();
      return;
    }

    // Validasi stok & harga final di server (FR-SC-04)
    const items = Cart.items();
    const validate = await Data.validateCart(items);
    if (!validate.ok) {
      form.querySelector("#formMsg").innerHTML = '<div class="alert alert--error">Stok berubah, beberapa item melebihi ketersediaan. Silakan perbaiki di <a href="/keranjang">keranjang</a>.</div>';
      return;
    }

    const btn = form.querySelector("#submitBtn");
    U.setLoading(btn, true);
    submitting = true;
    form.querySelector("#formMsg").innerHTML = '<div class="alert alert--info">Menyimpan pesanan…</div>';

    try {
      const order = await submitOrder(payload, items);
      Cart.clear();
      location.href = "/konfirmasi?order=" + encodeURIComponent(order.order_number);
    } catch (err) {
      console.error(err);
      form.querySelector("#formMsg").innerHTML = '<div class="alert alert--error">' + U.escapeHtml(err.message || "Gagal menyimpan pesanan. Coba lagi.") + '</div>';
      U.toast("Gagal menyimpan pesanan.", "error");
    } finally {
      U.setLoading(btn, false);
      submitting = false;
    }
  }

  async function submitOrder(payload, items) {
    const shippingOpt = shippingOptions.find(function (s) { return s.id === payload.shipping_id; });
    const sub = Cart.subtotal();
    const shipCost = shippingOpt ? shippingOpt.cost : 0;
    const total = sub + shipCost;

    if (!window.NORDY_DB.isReady()) {
      const num = "NRD-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      openWhatsApp(settings.seller_whatsapp, buildWaMessage(num, payload, items, sub, shipCost, total));
      return { order_number: num, status: "menunggu_pembayaran" };
    }

    const sb = window.NORDY_DB.client();
    // ID pelanggan dibuat di klien supaya tidak perlu izin SELECT (policy anon INSERT-only).
    const customerId = newUuid();
    const { error: ec } = await sb.from("customers").insert({
      id: customerId, name: payload.nama, whatsapp: payload.whatsapp, email: payload.email || null
    });
    if (ec) throw new Error("Gagal menyimpan data pelanggan: " + ec.message);

    const orderNumber = "NRD-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const itemsPayload = items.map(function (it) {
      return { variant_id: it.variant_id, product_name: it.product_name, variant_name: it.variant_name, unit_price: it.price, qty: it.qty };
    });

    const { data: ord, error: eo } = await sb.rpc("create_order", {
      p_order_number: orderNumber,
      p_customer_id: customerId,
      p_shipping_name: payload.nama,
      p_shipping_phone: payload.whatsapp,
      p_shipping_address: payload.alamat,
      p_shipping_city: payload.kota,
      p_shipping_province: payload.provinsi,
      p_shipping_postal_code: payload.kodepos,
      p_shipping_option_id: payload.shipping_id,
      p_shipping_courier_snapshot: shippingOpt ? shippingOpt.courier_name + " — " + shippingOpt.service_name : "",
      p_subtotal: sub, p_shipping_cost: shipCost, p_total: total,
      p_payment_method: "whatsapp_manual",
      p_notes: payload.catatan,
      p_items: itemsPayload
    });
    if (eo) throw new Error("Gagal membuat pesanan: " + eo.message);

    openWhatsApp(settings.seller_whatsapp, buildWaMessage(orderNumber, payload, items, sub, shipCost, total));
    return ord;
  }

  function buildWaMessage(num, payload, items, sub, ship, total) {
    const opt = shippingOptions.find(function (s) { return s.id === payload.shipping_id; });
    const lines = [
      "Halo Nordy Tech, saya ingin konfirmasi pesanan:",
      "",
      "No. Pesanan : " + num,
      "Nama        : " + payload.nama,
      "WhatsApp    : " + payload.whatsapp,
      "",
      "Item:"
    ];
    items.forEach(function (it, i) {
      lines.push((i + 1) + ". " + it.product_name + " - " + it.variant_name + " x" + it.qty + " = " + U.rupiah(it.price * it.qty));
    });
    lines.push("", "Subtotal    : " + U.rupiah(sub));
    lines.push("Ongkir      : " + U.rupiah(ship) + (opt ? " (" + opt.courier_name + " — " + opt.service_name + ")" : ""));
    lines.push("Total       : " + U.rupiah(total));
    lines.push("", "Alamat      : " + payload.alamat + ", " + payload.kota + ", " + payload.provinsi + " " + payload.kodepos);
    if (payload.catatan) lines.push("Catatan     : " + payload.catatan);
    lines.push("", "Mohon info pembayarannya. Terima kasih!");
    return encodeURIComponent(lines.join("\n"));
  }

  function openWhatsApp(phone, text) {
    window.open("https://wa.me/" + phone + "?text=" + text, "_blank", "noopener,noreferrer");
  }

  async function init() {
    const items = Cart.items();
    if (!items.length) { location.href = "/keranjang"; return; }
    settings = await Data.settings();
    shippingOptions = await Data.shippingOptions();
    const initialShipping = shippingOptions[0] ? shippingOptions[0].id : "";
    wrap.innerHTML = buildForm(initialShipping);
    bind(wrap.querySelector("form"));
  }

  init();
})();
