// Nordy Tech — Landing page (index.js)
(function () {
  const U = window.NORDY_UTILS;
  const Data = window.NORDY_DATA;
  const Layout = window.NORDY_LAYOUT;

  Layout.mount("home");

  // Hero collage: klik kartu belakang untuk maju ke depan (desktop saja).
  function initCollage() {
    const collage = document.querySelector(".hero-collage");
    if (!collage) return;
    const a = collage.querySelector(".collage-card.a");
    const b = collage.querySelector(".collage-card.b");
    if (!a || !b) return;

    function isDesktop() {
      return window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches;
    }
    function setFront(side) {
      if (!isDesktop()) return;
      const wantSwapped = side === "b"; // default (tanpa class) = a di depan
      if (collage.classList.contains("swapped") === wantSwapped) return;
      collage.classList.toggle("swapped", wantSwapped);
      collage.classList.remove("swinging");
      void collage.offsetWidth; // reflow agar animasi bisa diulang
      collage.classList.add("swinging");
      clearTimeout(collage._swingTimer);
      collage._swingTimer = setTimeout(function () { collage.classList.remove("swinging"); }, 520);
    }

    [["a", a], ["b", b]].forEach(function (pair) {
      const side = pair[0], card = pair[1];
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", "Tampilkan produk ini di depan");
      card.addEventListener("click", function () { setFront(side); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFront(side); }
      });
    });
  }
  initCollage();

  function renderCard(p, idx) {
    const thumb = Data.helpers.thumbOf(p);
    const variants = p.variants || [];
    const activeVariants = variants.filter(function (v) { return v.is_active; });
    const minP = activeVariants.length ? Data.helpers.minPrice(p) : 0;
    const stock = Data.helpers.totalStock(p);
    const badge = U.stockBadge({ stock: stock }, 5);
    const no = String(idx + 1).padStart(2, "0");
    const spec = activeVariants.length + " varian";
    return '' +
    '<a class="strip-row strip-product" href="/produk/' + p.slug + '" role="listitem">' +
      '<span class="strip-num">' + no + '</span>' +
      '<span class="strip-thumb ' + (p.accent ? 'thumb--' + p.accent : '') + '">' +
        (thumb ? U.imgOpt(thumb, p.name) : '<span><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3z"/><path d="M7 7v14M12 7v14"/></svg></span>') +
      '</span>' +
      '<span class="strip-main">' +
        '<span class="strip-title">' + U.escapeHtml(p.name) + '</span>' +
        '<span class="strip-sub" data-badge="' + U.escapeHtml(badge.label) + '">' + U.escapeHtml(spec) + '</span>' +
      '</span>' +
      '<span class="strip-badge badge ' + badge.cls + '">' + badge.label + '</span>' +
      '<span class="strip-price">' + (minP ? U.rupiah(minP) : 'TBD') + '<small>mulai</small></span>' +
      '<span class="strip-arrow" aria-hidden="true">→</span>' +
    '</a>';
  }

  async function load() {
    const grid = document.getElementById("featuredGrid");
    if (!grid) return;
    grid.innerHTML = '<div class="skeleton skeleton-card" style="grid-column:1/-1" aria-hidden="true"></div>';
    const settings = await Data.settings();
    const products = await Data.products();
    if (products.length) {
      grid.innerHTML = products.map(function (p, i) { return renderCard(p, i); }).join("");
    } else {
      grid.innerHTML = '<div class="empty"><div class="icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3z"/><path d="M7 7v14M12 7v14"/></svg></div><h3>Belum ada produk</h3><p class="muted">Produk akan muncul setelah ditambahkan di admin.</p></div>';
    }
    // update hero text from settings
    const heroTitle = document.getElementById("heroTitle");
    if (heroTitle && settings.hero_title) heroTitle.textContent = settings.hero_title;
    const heroSub = document.querySelector(".hero .sub");
    if (heroSub && settings.hero_subtitle) heroSub.textContent = settings.hero_subtitle;
    // apply translations after DOM updated
    window.NORDY_I18N.apply();
  }

  load();
})();