// Nordy Tech — Keranjang
(function () {
  const U = window.NORDY_UTILS;
  const Data = window.NORDY_DATA;
  window.NORDY_LAYOUT.mount("keranjang");
  const wrap = document.getElementById("cartWrap");
  let validating = false;

  function thumbCell(it) {
    if (it.image && /^(https?:)?\/\//.test(it.image)) {
      return '<img src="' + U.escapeHtml(it.image) + '" alt="" style="width:72px;height:72px;object-fit:cover;border:2px solid var(--color-ink);border-radius:10px">';
    }
    if (it.image && it.image.charAt(0) === "/") {
      return '<img src="' + U.escapeHtml(it.image) + '" alt="" style="width:72px;height:72px;object-fit:cover;border:2px solid var(--color-ink);border-radius:10px">';
    }
    if (it.image) {
      return '<span style="font-size:40px">' + U.escapeHtml(it.image) + '</span>';
    }
    return '<span style="font-size:40px"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3z"/><path d="M7 7v14M12 7v14"/></svg></span>';
  }

  function render(problems) {
    problems = problems || [];
    const items = window.NORDY_CART.items();
    if (!items.length) {
      wrap.innerHTML = '<div class="empty"><div class="icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h2l-4 5L5 7h14l5 17H2l1.5-4.5H5zM7 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2zM19 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2z"/></svg></div><h3>Keranjang kosong</h3>' +
        '<p class="muted">Belum ada item. Yuk pilih produk favoritmu.</p>' +
        '<a class="button mt-6" href="/produk">Lihat Katalog</a></div>';
      return;
    }
    const rows = items.map(function (it) {
      const bad = problems.indexOf(it.variant_id) !== -1;
      return '<tr' + (bad ? ' style="background:#FFE3E3"' : '') + '>' +
        '<td><div class="row">' + thumbCell(it) + '<div><strong><a href="/produk/' + U.escapeHtml(it.slug) + '">' + U.escapeHtml(it.product_name) + '</a></strong><br><span class="muted">' + U.escapeHtml(it.variant_name) + '</span>' +
        (bad ? '<br><span class="alert alert--error" style="display:inline-block;margin-top:6px;font-size:12px;padding:4px 8px">Stok tidak cukup</span>' : '') + '</div></div></td>' +
        '<td>' + U.rupiah(it.price) + '</td>' +
        '<td><div class="qty"><button type="button" data-dec="' + it.variant_id + '" aria-label="Kurangi">−</button>' +
        '<input type="number" value="' + it.qty + '" min="1" aria-label="Jumlah" data-qty="' + it.variant_id + '">' +
        '<button type="button" data-inc="' + it.variant_id + '" aria-label="Tambah">+</button></div></td>' +
        '<td><strong>' + U.rupiah(it.price * it.qty) + '</strong></td>' +
        '<td><button type="button" class="button button--danger button--sm" data-del="' + it.variant_id + '">Hapus</button></td>' +
      '</tr>';
    }).join("");

    wrap.innerHTML = '' +
    '<div class="table-wrap"><table class="data cart-table"><thead><tr><th>Produk</th><th>Harga</th><th>Jumlah</th><th>Subtotal</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<div class="row between wrap mt-4">' +
      '<a href="/produk" class="button button--secondary">← Lanjut Belanja</a>' +
      '<div class="card" style="min-width:280px"><div class="row between"><span class="muted">Subtotal (' + window.NORDY_CART.count() + ' item)</span><strong>' + U.rupiah(window.NORDY_CART.subtotal()) + '</strong></div>' +
      '<div class="muted mt-2" style="font-size:13px">Ongkir dihitung di halaman checkout.</div></div>' +
    '</div>' +
    '<div id="cartMsg" class="mt-4"></div>' +
    '<button class="button button--block" id="checkoutBtn">Lanjut ke Checkout →</button>';

    // bind
    wrap.querySelectorAll("[data-dec]").forEach(function (b) { b.addEventListener("click", function () { window.NORDY_CART.setQty(b.dataset.dec, qtyOf(b.dataset.dec) - 1); render(); }); });
    wrap.querySelectorAll("[data-inc]").forEach(function (b) { b.addEventListener("click", function () { window.NORDY_CART.setQty(b.dataset.inc, qtyOf(b.dataset.inc) + 1); render(); }); });
    wrap.querySelectorAll("[data-del]").forEach(function (b) { b.addEventListener("click", function () { window.NORDY_CART.remove(b.dataset.del); render(); U.toast("Item dihapus."); }); });
    wrap.querySelectorAll("[data-qty]").forEach(function (inp) {
      inp.addEventListener("change", function () { window.NORDY_CART.setQty(inp.dataset.qty, Number(inp.value)); render(); });
    });
    document.getElementById("checkoutBtn").addEventListener("click", goCheckout);
  }

  function qtyOf(id) {
    const it = window.NORDY_CART.items().find(function (i) { return i.variant_id === id; });
    return it ? Number(it.qty) : 1;
  }

  async function goCheckout() {
    if (validating) return;
    validating = true;
    const btn = document.getElementById("checkoutBtn");
    U.setLoading(btn, true);
    const items = window.NORDY_CART.items();
    const res = await Data.validateCart(items);
    if (!res.ok) {
      document.getElementById("cartMsg").innerHTML = '<div class="alert alert--error">Beberapa item melebihi stok. Perbaiki jumlah lalu coba lagi.</div>';
      render(res.problems);
      validating = false;
      return;
    }
    location.href = "/checkout";
  }

  render();
  document.addEventListener("nordy:cart-changed", function () { render(); });
})();
