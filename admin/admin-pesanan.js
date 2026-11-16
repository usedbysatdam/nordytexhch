// Nordy Tech — Admin: daftar & detail pesanan, ubah status (state machine)
(function () {
  const U = window.NORDY_UTILS;
  const Admin = window.NORDY_ADMIN;
  Admin.mountSide("pesanan.html");
  const sb = () => window.NORDY_DB.client();
  const listEl = document.getElementById("ordersList");
  const modal = document.getElementById("orderModal");
  document.getElementById("orderClose").addEventListener("click", () => modal.close());

  const NEXT = {
    menunggu_pembayaran: ["diproses", "dibatalkan"],
    diproses: ["dikirim", "dibatalkan"],
    dikirim: ["selesai"],
    selesai: [],
    dibatalkan: []
  };

  let allOrders = [];

  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("statusFilter").addEventListener("change", applyFilters);

  async function load() {
    listEl.innerHTML = '<div class="skeleton" style="height:300px"></div>';
    const { data, error } = await sb().from("orders")
      .select("*, order_items(*)").order("created_at", { ascending: false });
    if (error) { listEl.innerHTML = '<div class="alert alert--error">Gagal memuat: ' + U.escapeHtml(error.message) + '</div>'; return; }
    allOrders = data || [];
    applyFilters();

    const qs = new URLSearchParams(location.search);
    if (qs.get("id")) {
      const o = allOrders.find(x => x.order_number === qs.get("id"));
      if (o) openDetail(o);
    }
  }

  function applyFilters() {
    const q = document.getElementById("searchInput").value.toLowerCase().trim();
    const st = document.getElementById("statusFilter").value;
    const filtered = allOrders.filter(function (o) {
      const matchQ = !q || o.order_number.toLowerCase().includes(q) || (o.shipping_name || "").toLowerCase().includes(q) || (o.shipping_phone || "").includes(q);
      const matchS = !st || o.status === st;
      return matchQ && matchS;
    });
    if (!filtered.length) { listEl.innerHTML = '<div class="empty"><div class="icon">🧾</div><h3>Tidak ada pesanan</h3><p class="muted">Belum ada data sesuai filter.</p></div>'; return; }
    listEl.innerHTML = '<div class="table-wrap"><table class="data"><thead><tr><th>No. Pesanan</th><th>Pelanggan</th><th>WA</th><th>Tanggal</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>' +
      filtered.map(function (o) {
        return '<tr>' +
          '<td><strong>' + U.escapeHtml(o.order_number) + '</strong></td>' +
          '<td>' + U.escapeHtml(o.shipping_name) + '</td>' +
          '<td>' + U.escapeHtml(o.shipping_phone) + '</td>' +
          '<td>' + U.formatDate(o.created_at) + '</td>' +
          '<td>' + U.rupiah(o.total) + '</td>' +
          '<td><span class="badge ' + U.statusBadgeClass(o.status) + '">' + U.statusLabel(o.status) + '</span></td>' +
          '<td><button class="button button--secondary button--sm" data-open="' + o.order_number + '">Detail</button></td>' +
        '</tr>';
      }).join("") + '</tbody></table></div>';
    listEl.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", function () {
      openDetail(allOrders.find(x => x.order_number === this.dataset.open));
    }));
  }

  async function openDetail(o) {
    const items = o.order_items || [];
    const nexts = NEXT[o.status] || [];
    const history = await loadHistory(o.id);

    document.getElementById("orderModalTitle").textContent = o.order_number;
    document.getElementById("orderDetail").innerHTML = '' +
    '<div class="row between wrap gap-3"><span class="badge ' + U.statusBadgeClass(o.status) + '">' + U.statusLabel(o.status) + '</span><span class="muted">' + U.formatDate(o.created_at) + '</span></div>' +
    '<div class="card card--flat mt-4"><h4>Penerima</h4>' +
      '<div class="mt-2"><strong>' + U.escapeHtml(o.shipping_name) + '</strong><br>' +
      U.escapeHtml(o.shipping_phone) + '<br>' + U.escapeHtml(o.shipping_address) + '<br>' +
      U.escapeHtml(o.shipping_city + ", " + o.shipping_province + " " + o.shipping_postal_code) + '</div>' +
    '</div>' +
    '<div class="card card--flat mt-4"><h4>Item</h4>' + items.map(function (it) {
      return '<div class="row between mt-2"><span>' + U.escapeHtml(it.product_name_snapshot) + ' <span class="muted">(' + U.escapeHtml(it.variant_name_snapshot) + ') ×' + it.quantity + '</span></span><strong>' + U.rupiah(it.line_total) + '</strong></div>';
    }).join("") +
    '<hr class="divider"><div class="row between"><span class="muted">Subtotal</span><span>' + U.rupiah(o.subtotal) + '</span></div>' +
    '<div class="row between mt-2"><span class="muted">Ongkir (' + U.escapeHtml(o.shipping_courier_snapshot || "-") + ')</span><span>' + U.rupiah(o.shipping_cost) + '</span></div>' +
    '<div class="row between mt-2" style="font-size:1.1rem"><strong>Total</strong><strong>' + U.rupiah(o.total) + '</strong></div></div>' +
    (o.notes ? '<div class="alert alert--info mt-4">Catatan: ' + U.escapeHtml(o.notes) + '</div>' : '') +
    '<div class="mt-6"><h4>Ubah Status</h4><div class="row gap-3 wrap mt-2">' +
      (nexts.length ? nexts.map(function (n) {
        const danger = n === "dibatalkan";
        return '<button class="button button--sm ' + (danger ? 'button--danger' : '') + '" data-status="' + n + '">' + (danger ? 'Batalkan Pesanan' : 'Ubah ke ' + U.statusLabel(n)) + '</button>';
      }).join("") : '<span class="muted">Status akhir, tidak dapat diubah.</span>') +
    '</div>' +
    (o.status === "dikirim" ? '<div class="field mt-4"><label for="resiNote">Info kurir / resi (opsional)</label><input class="input" id="resiNote" placeholder="No. resi, kurir..."></div>' : '') +
    '</div>' +
    '<div class="mt-6"><h4>Riwayat Status</h4><div class="stack stack-2 mt-2">' +
      (history.length ? history.map(function (h) {
        return '<div class="meta">' + U.formatDate(h.changed_at) + ' — ' + (h.from_status ? U.statusLabel(h.from_status) + " → " : "") + U.statusLabel(h.to_status) + (h.note ? ' <em>(' + U.escapeHtml(h.note) + ')</em>' : "") + ' <span class="muted">oleh ' + U.escapeHtml(h.admin_email || "admin") + '</span></div>';
      }).join("") : '<span class="muted">Belum ada riwayat.</span>') +
    '</div></div>';

    document.getElementById("orderDetail").querySelectorAll("[data-status]").forEach(b => b.addEventListener("click", function () {
      changeStatus(o, this.dataset.status);
    }));

    modal.showModal();
  }

  async function loadHistory(orderId) {
    const { data } = await sb().from("order_status_history").select("*").eq("order_id", orderId).order("changed_at");
    if (!data) return [];
    // fetch admin emails
    const ids = [...new Set(data.map(h => h.changed_by).filter(Boolean))];
    let emails = {};
    if (ids.length) {
      const { data: admins } = await sb().from("admin_users").select("id,email").in("id", ids);
      (admins || []).forEach(a => { emails[a.id] = a.email; });
    }
    return data.map(h => Object.assign({}, h, { admin_email: emails[h.changed_by] || "" }));
  }

  async function changeStatus(o, to) {
    const danger = to === "dibatalkan";
    if (danger && !confirm("Batalkan pesanan " + o.order_number + "? Stok akan dikembalikan.")) return;
    try {
      const { data: { session } } = await sb().auth.getSession();
      // update status
      const { error } = await sb().from("orders").update({ status: to }).eq("id", o.id);
      if (error) throw error;

      const note = to === "dikirim" ? (document.getElementById("resiNote")?.value || "") : "";

      // history
      await sb().from("order_status_history").insert({
        order_id: o.id, from_status: o.status, to_status: to, changed_by: session.user.id, note
      });

      // restore stock on cancel
      if (to === "dibatalkan") {
        const { data: items } = await sb().from("order_items").select("variant_id,quantity").eq("order_id", o.id);
        for (const it of (items || [])) {
          const { data: v } = await sb().from("product_variants").select("stock").eq("id", it.variant_id).single();
          if (v) await sb().from("product_variants").update({ stock: v.stock + it.quantity }).eq("id", it.variant_id);
        }
      }

      U.toast("Status diperbarui ke " + U.statusLabel(to) + ".");
      modal.close();
      load();
    } catch (err) {
      console.error(err);
      U.toast("Gagal memperbarui status: " + (err.message || ""), "error");
    }
  }

  (async function () { await Admin.requireAuth(); load(); })();
})();