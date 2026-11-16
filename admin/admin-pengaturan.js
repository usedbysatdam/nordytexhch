// Nordy Tech — Admin: Pengaturan Toko & Opsi Pengiriman
(function () {
  const U = window.NORDY_UTILS;
  const Admin = window.NORDY_ADMIN;
  Admin.mountSide("pengaturan.html");
  const sb = () => window.NORDY_DB.client();

  // --- STORE SETTINGS ---
  async function loadSettings() {
    const { data, error } = await sb().from("store_settings").select("*");
    if (error) return;
    const map = {};
    (data || []).forEach(r => map[r.key] = r.value);
    document.getElementById("sWa").value = map.seller_whatsapp || "";
    document.getElementById("sPay").value = map.payment_instructions || "";
    document.getElementById("sLow").value = map.low_stock_threshold || "5";
    document.getElementById("sHeroT").value = map.hero_title || "";
    document.getElementById("sHeroS").value = map.hero_subtitle || "";
  }

  document.getElementById("saveSettingsBtn").addEventListener("click", async function () {
    const btn = this;
    U.setLoading(btn, true);
    try {
      const rows = [
        { key: "seller_whatsapp", value: document.getElementById("sWa").value.trim() },
        { key: "payment_instructions", value: document.getElementById("sPay").value.trim() },
        { key: "low_stock_threshold", value: document.getElementById("sLow").value.trim() || "5" },
        { key: "hero_title", value: document.getElementById("sHeroT").value.trim() },
        { key: "hero_subtitle", value: document.getElementById("sHeroS").value.trim() }
      ];
      for (const r of rows) {
        await sb().from("store_settings").upsert(r, { onConflict: "key" });
      }
      U.toast("Pengaturan disimpan.");
    } catch (err) {
      console.error(err);
      U.toast("Gagal menyimpan: " + (err.message || ""), "error");
    } finally { U.setLoading(btn, false); }
  });

  // --- SHIPPING OPTIONS ---
  let shippingRows = [];

  async function loadShipping() {
    const { data, error } = await sb().from("shipping_options").select("*").order("courier_name");
    if (error) { console.error(error); return; }
    shippingRows = data || [];
    renderShipping();
  }

  function renderShipping() {
    const box = document.getElementById("shippingRows");
    if (!shippingRows.length) {
      box.innerHTML = '<span class="muted">Belum ada opsi pengiriman.</span>';
    } else {
      box.innerHTML = shippingRows.map(function (s) {
        return '<div class="card card--flat stack stack-3" data-id="' + s.id + '">' +
          '<div class="row wrap gap-3">' +
            '<div class="field grow"><label>Kurir</label><input class="input" data-courier value="' + U.escapeHtml(s.courier_name) + '"></div>' +
            '<div class="field grow"><label>Layanan</label><input class="input" data-service value="' + U.escapeHtml(s.service_name) + '"></div>' +
            '<div class="field"><label>Estimasi</label><input class="input" data-estimate value="' + U.escapeHtml(s.estimate_text || "") + '"></div>' +
            '<div class="field" style="width:140px"><label>Biaya</label><input class="input" type="number" min="0" data-cost value="' + s.cost + '"></div>' +
            '<div class="field" style="width:80px"><label>Status</label><select class="select" data-active><option value="true"' + (s.is_active ? " selected" : "") + '>Aktif</option><option value="false"' + (!s.is_active ? " selected" : "") + '>Nonaktif</option></select></div>' +
            '<button type="button" class="button button--danger button--sm" data-del style="align-self:flex-end">Hapus</button>' +
          '</div>' +
        '</div>';
      }).join("");
      box.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", function () {
        const id = this.closest("[data-id]").dataset.id;
        deleteShipping(id);
      }));
    }
  }

  document.getElementById("addShipBtn").addEventListener("click", function () {
    const box = document.getElementById("shippingRows");
    const tmpId = "tmp-" + Date.now();
    const wrap = document.createElement("div");
    wrap.className = "card card--flat stack stack-3";
    wrap.dataset.id = tmpId;
    wrap.innerHTML = '' +
      '<div class="row wrap gap-3">' +
        '<div class="field grow"><label>Kurir</label><input class="input" data-courier placeholder="JNE"></div>' +
        '<div class="field grow"><label>Layanan</label><input class="input" data-service placeholder="Reguler"></div>' +
        '<div class="field"><label>Estimasi</label><input class="input" data-estimate placeholder="2-3 hari"></div>' +
        '<div class="field" style="width:140px"><label>Biaya</label><input class="input" type="number" min="0" data-cost value="0"></div>' +
        '<div class="field" style="width:80px"><label>Status</label><select class="select" data-active><option value="true" selected>Aktif</option><option value="false">Nonaktif</option></select></div>' +
        '<button type="button" class="button button--danger button--sm" data-del style="align-self:flex-end">Hapus</button>' +
      '</div>';
    wrap.querySelector("[data-del]").addEventListener("click", function () {
      const id = wrap.dataset.id;
      if (id.startsWith("tmp-")) { wrap.remove(); return; }
      deleteShipping(id);
    });
    box.appendChild(wrap);
  });

  async function deleteShipping(id) {
    if (!confirm("Hapus opsi pengiriman ini?")) return;
    try {
      if (!id.startsWith("tmp-")) await sb().from("shipping_options").delete().eq("id", id);
      loadShipping();
      U.toast("Opsi dihapus.");
    } catch (err) { console.error(err); U.toast("Gagal menghapus.", "error"); }
  }

  document.getElementById("saveShippingBtn").addEventListener("click", async function () {
    const btn = this;
    U.setLoading(btn, true);
    try {
      const rows = Array.from(document.querySelectorAll("#shippingRows > [data-id]")).map(wrap => ({
        id: wrap.dataset.id.startsWith("tmp-") ? null : wrap.dataset.id,
        courier_name: wrap.querySelector("[data-courier]").value.trim(),
        service_name: wrap.querySelector("[data-service]").value.trim(),
        estimate_text: wrap.querySelector("[data-estimate]").value.trim(),
        cost: Number(wrap.querySelector("[data-cost]").value) || 0,
        is_active: wrap.querySelector("[data-active]").value === "true"
      }));
      for (const r of rows) {
        if (!r.courier_name || !r.service_name) { U.toast("Kurir & layanan wajib diisi.", "error"); return; }
        if (r.id) {
          await sb().from("shipping_options").update({
            courier_name: r.courier_name, service_name: r.service_name,
            estimate_text: r.estimate_text, cost: r.cost, is_active: r.is_active
          }).eq("id", r.id);
        } else {
          await sb().from("shipping_options").insert(r);
        }
      }
      loadShipping();
      U.toast("Opsi pengiriman disimpan.");
    } catch (err) {
      console.error(err);
      U.toast("Gagal menyimpan: " + (err.message || ""), "error");
    } finally { U.setLoading(btn, false); }
  });

  (async function () { await Admin.requireAuth(); loadSettings(); loadShipping(); })();
})();