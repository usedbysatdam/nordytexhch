// Nordy Tech — Layout: header + footer + badge keranjang + bottom nav (mobile)
(function () {
  const U = window.NORDY_UTILS;

  // Ikon SVG Tabler Icons (stroke) — satu set garis, konsisten, bukan emoji
  const ICONS = {
    home: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5l9-7.5 9 7.5M5 9.5V21h14V9.5M9 21v-6h6v6"/></svg>',
    grid: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h18v18H3zM3 12h18M12 3v18"/></svg>',
    truck: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h14l2 6H3zM7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-6-6"/></svg>',
    cart: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h2l-4 5L5 7h14l5 17H2l1.5-4.5H5M7 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2M19 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v20M12 18a6 6 0 1 0 0-12"/><path d="M2 12h20M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h20M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    moon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>'
  };

  function headerHTML(active) {
    return '' +
    '<a class="skip-link" href="#main">Lewati ke konten</a>' +
    '<header class="site-header"><div class="page-container inner">' +
      '<a class="brand" href="/" aria-label="Nordy Tech - Beranda">' +
        '<img class="logo-badge" src="/assets/logo.jpeg" alt="Logo Nordy Tech" loading="eager">' +
        '<span>Nordy&nbsp;Tech</span>' +
      '</a>' +
      '<div class="theme-lang">'+
      '<button class="button button--ghost button--sm theme-toggle" id="themeToggle" aria-label="Ubah tema gelap/terang" aria-pressed="false" title="Ubah tema">' +
        '<span class="theme-icon-light" aria-hidden="true">' + ICONS.sun + '</span>' +
        '<span class="theme-icon-dark" aria-hidden="true">' + ICONS.moon + '</span>' +
        '<span class="sr-only" id="themeLabel">Mode terang</span>' +
      '</button>' +
      '<button class="button button--ghost button--sm lang-toggle" id="langToggle" aria-label="Ubah bahasa/Change language" title="Ubah bahasa">' +
        '<span class="lang-id" id="langId">ID</span>' +
        '<span class="lang-en" id="langEn" style="display:none">EN</span>' +
      '</button>' +
      '</div>' +
      '<nav class="nav-links" id="navLinks" aria-label="Navigasi utama">' +
        '<a href="/"' + (active === "home" ? ' aria-current="page"' : "") + '>Beranda</a>' +
        '<a href="/produk"' + (active === "produk" ? ' aria-current="page"' : "") + '>Produk</a>' +
        '<a href="/#cara-pesan">Cara Pesan</a>' +
        '<a href="/lacak"' + (active === "lacak" ? ' aria-current="page"' : "") + '>Lacak Pesanan</a>' +
      '</nav>' +
      '<a href="/keranjang" class="button button--secondary button--sm cart-link header-cart"' + (active === "keranjang" ? ' aria-current="page"' : "") + ' aria-label="Keranjang">' +
        ICONS.cart +
        '<span class="cart-count" id="cartCount">0</span>' +
      '</a>' +
    '</div></header>' +
    bottomNavHTML(active);
  }

  // Bottom nav gaya aplikasi mobile — muncul di layar kecil saja
  function bottomNavHTML(active) {
    const item = function (href, key, icon, label, isActive) {
      return '<a href="' + href + '" class="bottom-nav__item"' + (isActive ? ' aria-current="page"' : "") + '>' +
        '<span class="bottom-nav__icon">' + icon + '</span>' +
        '<span class="bottom-nav__label">' + label + '</span>' +
        (key === "keranjang" ? '<span class="cart-count cart-count--nav" id="cartCountNav">0</span>' : '') +
      '</a>';
    };
    return '' +
    '<nav class="bottom-nav" aria-label="Navigasi seluler">' +
      item("/", "home", ICONS.home, "Beranda", active === "home") +
      item("/produk", "produk", ICONS.grid, "Produk", active === "produk") +
      item("/#cara-pesan", "pemesanan", ICONS.truck, "Cara Pesan", false) +
      item("/lacak", "lacak", ICONS.search, "Lacak", active === "lacak") +
      item("/keranjang", "keranjang", ICONS.cart, "Keranjang", active === "keranjang") +
    '</nav>';
  }

  function footerHTML() {
    return '' +
    '<footer class="site-footer"><div class="page-container inner">' +
      '<div class="cols">' +
        '<div><a class="brand" href="/"><img class="logo-badge" src="/assets/logo.jpeg" alt="Nordy Tech" loading="eager" style="width:110px;height:auto;"></a>' +
        '<p class="muted mt-4" style="max-width:38ch">Aksesori yang lahir dari komponen teknologi: dipakai sebagai gaya, dikenali sebagai identitas.</p></div>' +
        '<div><h4>Navigasi</h4>' +
          '<a href="/">Beranda</a><a href="/produk">Produk</a>' +
          '<a href="/keranjang">Keranjang</a><a href="/lacak">Lacak Pesanan</a></div>' +
        '<div><h4>Bantuan</h4>' +
          '<a href="/#cara-pesan">Cara Pesan</a>' +
          '<a href="/kebijakan-privasi">Kebijakan Privasi</a>' +
          '<a href="/syarat-ketentuan">Syarat &amp; Ketentuan</a></div>' +
      '</div>' +
      '<div class="copyright">© ' + new Date().getFullYear() + ' Nordy Tech. Seluruh harga dalam Rupiah (IDR).</div>' +
    '</div></footer>';
  }

  window.NORDY_LAYOUT = {
    mount: function (active) {
      const h = document.getElementById("siteHeader");
      const f = document.getElementById("siteFooter");
      if (h) h.outerHTML = headerHTML(active);
      if (f) f.outerHTML = footerHTML();

      // SINKRON badge keranjang di header dan bottom nav
      const update = function () {
        const n = window.NORDY_CART ? window.NORDY_CART.count() : 0;
        ["cartCount", "cartCountNav"].forEach(function (id) {
          const el = document.getElementById(id);
          if (el) el.textContent = n;
        });
      };
      update();
      document.addEventListener("nordy:cart-changed", update);

      // Tutup bottom nav tidak perlu toggle; tapi jaga kompatibilitas
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          const bn = document.querySelector(".bottom-nav");
          if (bn) bn.classList.remove("is-hidden");
        }
      });

      // --- Dark mode toggle ---
      const themeToggle = document.getElementById("themeToggle");
      if (themeToggle) {
        themeToggle.addEventListener("click", function () {
          const html = document.documentElement;
          const isDark = html.getAttribute("data-theme") === "dark";
          if (isDark) {
            html.setAttribute("data-theme", "light");
            themeToggle.setAttribute("aria-pressed", "false");
            document.getElementById("themeLabel").textContent = "Mode terang";
          } else {
            html.setAttribute("data-theme", "dark");
            themeToggle.setAttribute("aria-pressed", "true");
            document.getElementById("themeLabel").textContent = "Mode gelap";
          }
        });

        // Set initial state from localStorage. Default: light (terang).
        const saved = localStorage.getItem("nordy-theme");
        if (saved === "dark") {
          document.documentElement.setAttribute("data-theme", "dark");
          themeToggle.setAttribute("aria-pressed", "true");
          document.getElementById("themeLabel").textContent = "Mode gelap";
        } else {
          // Default light — hapus data-theme agar pakai warna default web.
          document.documentElement.removeAttribute("data-theme");
          themeToggle.setAttribute("aria-pressed", "false");
          document.getElementById("themeLabel").textContent = "Mode terang";
        }
      }

      // Register Service Worker
      if (window.NORDY_CONFIG && typeof window.NORDY_CONFIG.registerServiceWorker === 'function') {
        window.NORDY_CONFIG.registerServiceWorker();
      }

      // --- Language toggle ---
      const langToggle = document.getElementById("langToggle");
      const langId = document.getElementById("langId");
      const langEn = document.getElementById("langEn");
      if (langToggle && langId && langEn) {
        const savedLang = localStorage.getItem("nordy-lang");
        function reflect(lang) {
          document.documentElement.lang = lang;
          langToggle.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
          langId.style.display = lang === "en" ? "none" : "inline";
          langEn.style.display = lang === "en" ? "inline" : "none";
        }
        reflect(savedLang === "en" ? "en" : "id");
        langToggle.addEventListener("click", function () {
          const next = document.documentElement.lang === "en" ? "id" : "en";
          reflect(next);
          localStorage.setItem("nordy-lang", next);
          document.dispatchEvent(new CustomEvent("nordy:lang-changed", { detail: { lang: next } }));
        });
      }
    }
  };
})();