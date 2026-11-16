// Nordy Tech — Halaman Konfirmasi Pesanan
(function () {
  const U = window.NORDY_UTILS;
  const Data = window.NORDY_DATA;
  window.NORDY_LAYOUT.mount("keranjang");
  const wrap = document.getElementById("confirmWrap");
  const orderNumber = U.qs("order");

  async function init() {
    const settings = await Data.settings();
    const phone = settings.seller_whatsapp || "6280000000000";

    if (!orderNumber) {
      wrap.innerHTML = '<div class="empty"><div class="icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-6-6"/></svg></div><h3>Nomor pesanan tidak ditemukan</h3>' +
        '<p class="muted">Tautan konfirmasi tidak valid.</p><a class="button mt-6" href="/produk">Lihat Katalog</a></div>';
      return;
    }

    const waText = encodeURIComponent("Halo Nordy Tech, saya ingin konfirmasi pesanan dengan nomor " + orderNumber + ". Mohon info pembayarannya. Terima kasih!");
    const waUrl = "https://wa.me/" + phone + "?text=" + waText;

    wrap.innerHTML = '' +
    '<div class="card" style="text-align:center">' +
      '<div style="font-size:56px;color:#2f9e44"><svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg></div>' +
      '<h1 style="font-size:clamp(26px,4vw,34px)" class="mt-4">Pesanan Berhasil Dibuat!</h1>' +
      '<p class="muted mt-2">Simpan nomor pesanan ini untuk melacak status pesananmu.</p>' +
      '<div class="card card--flat mt-6" style="background:var(--color-yellow);display:inline-block;padding:16px 28px">' +
        '<div class="eyebrow">Nomor Pesanan</div>' +
        '<div style="font-size:28px;font-weight:800;letter-spacing:0.04em" id="orderNo">' + U.escapeHtml(orderNumber) + '</div>' +
      '</div>' +
      '<div class="mt-6"><span class="badge badge--warning">Menunggu Pembayaran</span></div>' +
      '<a class="button button--block mt-6" href="' + waUrl + '" target="_blank" rel="noopener noreferrer">Hubungi Penjual via WhatsApp</a>' +
      '<a class="button button--secondary button--block mt-3" href="/lacak?order=' + encodeURIComponent(orderNumber) + '">Lacak Pesanan</a>' +
    '</div>' +
    '<div class="card mt-6">' +
      '<h3 class="mb-4">Instruksi Pembayaran</h3>' +
      '<p class="muted" style="white-space:pre-line">' + U.escapeHtml(settings.payment_instructions || "Hubungi penjual via WhatsApp untuk detail pembayaran.") + '</p>' +
      '<div class="alert alert--info mt-4">Pesanan diproses setelah pembayaran diverifikasi penjual. Status awal: <strong>Menunggu Pembayaran</strong>.</div>' +
    '</div>' +
    '<div class="center mt-6"><a href="/produk" class="muted">← Lanjut belanja</a></div>';
  }

  init();
})();