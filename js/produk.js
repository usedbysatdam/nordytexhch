// Nordy Tech — Katalog
(function () {
  const U = window.NORDY_UTILS;
  const Data = window.NORDY_DATA;
  window.NORDY_LAYOUT.mount("produk");

  function renderCard(p, idx) {
    const thumb = Data.helpers.thumbOf(p);
    const variants = p.variants || [];
    const minP = variants.length ? Data.helpers.minPrice(p) : 0;
    const stock = Data.helpers.totalStock(p);
    const badge = U.stockBadge({ stock: stock }, 5);
    const hasVariant = variants.filter(function (v) { return v.is_active; }).length > 1;
    let thumbHTML = '';
    if (thumb) {
      thumbHTML = U.imgOpt(thumb, p.name);
    } else {
      thumbHTML = '<span><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3z"/><path d="M7 7v14M12 7v14"/></svg></span>';
    }
    const delay = (idx || 0) % 6;
    return '' +
    '<article class="product-card card reveal" data-delay="' + delay + '" role="listitem">' +
      '<a class="thumb ' + (p.accent ? 'thumb--' + p.accent : '') + '" href="/produk/' + p.slug + '" aria-label="Lihat detail ' + U.escapeHtml(p.name) + '">' +
        thumbHTML +
      '</a>' +
      '<div class="head">' +
        '<h3 class="card-title">' + U.escapeHtml(p.name) + '</h3>' +
        '<span class="badge ' + badge.cls + '">' + badge.label + '</span>' +
      '</div>' +
      '<div class="price">' + (minP ? U.rupiah(minP) : 'Harga TBD') + (hasVariant ? ' <span class="muted" style="font-weight:400">' + U.t("common.starting") + '</span>' : '') + '</div>' +
      '<p class="desc">' + U.escapeHtml((p.description || '').slice(0, 120)) + (p.description && p.description.length > 120 ? '…' : '') + '</p>' +
      '<a class="button button--block" href="/produk/' + p.slug + '">' + U.t("common.viewdetail") + '</a>' +
    '</article>';
  }

  async function load() {
    const grid = document.getElementById("catalogGrid");
    grid.innerHTML = '<div class="skeleton skeleton-card" style="grid-column:1/-1" aria-hidden="true"></div>';
    const products = await Data.products();
    if (!products.length) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3z"/><path d="M7 7v14M12 7v14"/></svg></div><h3>Belum ada produk</h3><p class="muted">Produk akan muncul setelah ditambahkan di admin.</p></div>';
      return;
    }
    grid.innerHTML = products.map(function (p, i) { return renderCard(p, i); }).join("");
    window.NORDY_I18N.apply();
  }

  load();
})();
