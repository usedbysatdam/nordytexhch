// Nordy Tech — Lacak Pesanan
(function () {
  const U = window.NORDY_UTILS;
  window.NORDY_LAYOUT.mount("lacak");
  const form = document.getElementById("trackForm");
  const result = document.getElementById("trackResult");
  const pre = U.qs("order");
  if (pre) document.getElementById("torder").value = pre;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const num = document.getElementById("torder").value.trim();
    const phone = U.normalizePhone(document.getElementById("tphone").value);
    if (!num || !phone) { U.toast("Isi nomor pesanan dan WhatsApp.", "error"); return; }
    const btn = document.getElementById("trackBtn");
    U.setLoading(btn, true);
    result.innerHTML = "";
    try {
      const data = await lookup(num, phone);
      if (!data) {
        result.innerHTML = '<div class="alert alert--error">Pesanan tidak ditemukan. Periksa kembali nomor pesanan dan WhatsApp.</div>';
      } else {
        result.innerHTML = '' +
        '<div class="card"><div class="row between wrap gap-3"><div><div class="eyebrow">Nomor Pesanan</div><strong style="font-size:20px">' + U.escapeHtml(data.order_number) + '</strong></div>' +
        '<span class="badge ' + U.statusBadgeClass(data.status) + '">' + U.statusLabel(data.status) + '</span></div>' +
        '<hr class="divider">' +
        '<div class="row between"><span class="muted">Tanggal</span><strong>' + U.formatDate(data.created_at) + '</strong></div>' +
        '<div class="row between mt-2"><span class="muted">Kurir</span><strong>' + U.escapeHtml(data.courier || "-") + '</strong></div>' +
        '<div class="row between mt-2"><span class="muted">Total</span><strong>' + U.rupiah(data.total) + '</strong></div></div>';
      }
    } catch (err) {
      console.error(err);
      result.innerHTML = '<div class="alert alert--error">Gagal memuat data. Coba lagi.</div>';
    } finally { U.setLoading(btn, false); }
  });

  async function lookup(num, phone) {
    if (!window.NORDY_DB.isReady()) {
      // demo
      if (/^NRD-/.test(num)) {
        return { order_number: num, status: "menunggu_pembayaran", total: 60000, created_at: new Date().toISOString(), courier: "JNE — Reguler" };
      }
      return null;
    }
    const sb = window.NORDY_DB.client();
    const { data, error } = await sb.rpc("lookup_order", { p_number: num, p_phone: phone });
    if (error) throw error;
    return data;
  }
})();