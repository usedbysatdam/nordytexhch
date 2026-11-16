// Nordy Tech — Utils (format, validasi, toast, DOM)
(function () {
  const U = {};

  U.rupiah = function (n) {
    const num = Number(n) || 0;
    return "Rp " + num.toLocaleString("id-ID");
  };

  U.formatDate = function (iso) {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("id-ID", {
        dateStyle: "medium", timeStyle: "short"
      });
    } catch (e) { return iso; }
  };

  // Normalisasi nomor WhatsApp Indonesia ke format 62xxxx (PRD FR-CO-02).
  U.normalizePhone = function (input) {
    if (!input) return "";
    let s = String(input).replace(/[\s\-().]/g, "");
    if (s.startsWith("+62")) s = s.slice(1);
    if (s.startsWith("0")) s = "62" + s.slice(1);
    if (!s.startsWith("62") && s.length >= 9) s = "62" + s;
    return s;
  };

  U.isValidPhone = function (input) {
    const s = U.normalizePhone(input);
    return /^62[0-9]{9,13}$/.test(s);
  };

  U.isValidEmail = function (input) {
    if (!input) return true; // opsional
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input);
  };

  U.isValidPostal = function (input) {
    return /^[0-9]{5}$/.test(String(input || ""));
  };

  U.slugify = function (text) {
    return String(text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  U.escapeHtml = function (str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  // Helper ke i18n (aman jika i18n.js belum loaded).
  U.t = function (key, vars) {
    if (window.NORDY_I18N) return window.NORDY_I18N.t(key, vars);
    return key;
  };

  // Optimasi gambar: WebP srcset + lazy loading + decoding async.
  // Mengembalikan string HTML <img> dengan srcset ke .webp (jika ada) dan fallback ke file asli.
  U.imgOpt = function (url, alt, opts) {
    opts = opts || {};
    if (!url) return opts.fallback || "";
    const webp = url.replace(/\.[a-z0-9]+$/i, ".webp");
    return '<img src="' + U.escapeHtml(url) + '" alt="' + U.escapeHtml(alt || "") + '" ' +
      'loading="lazy" decoding="async" ' +
      'srcset="' + U.escapeHtml(webp) + ' 1x" ' +
      'class="is-loaded" data-src="' + U.escapeHtml(url) + '">';
  };

  U.qs = function (name) {
    return new URLSearchParams(location.search).get(name);
  };

  U.stockBadge = function (variant, threshold) {
    const t = threshold || 5;
    if (!variant) return { label: "Habis", cls: "badge--muted" };
    if (variant.stock <= 0) return { label: "Habis", cls: "badge--danger" };
    if (variant.stock <= t) return { label: "Stok Menipis", cls: "badge--warning" };
    return { label: "Tersedia", cls: "badge--success" };
  };

  U.statusLabel = function (status) {
    return ({
      menunggu_pembayaran: "Menunggu Pembayaran",
      diproses: "Diproses",
      dikirim: "Dikirim",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan"
    })[status] || status;
  };

  U.statusBadgeClass = function (status) {
    return ({
      menunggu_pembayaran: "badge--warning",
      diproses: "badge--blue",
      dikirim: "badge--purple",
      selesai: "badge--success",
      dibatalkan: "badge--muted"
    })[status] || "badge--muted";
  };

  // Toast global
  U.toast = function (message, type) {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      wrap.setAttribute("role", "status");
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = "toast toast--" + (type || "success");
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity 160ms ease";
      el.style.opacity = "0";
      setTimeout(function () { el.remove(); }, 180);
    }, 3200);
  };

  U.setLoading = function (btn, loading) {
    if (!btn) return;
    btn.classList.toggle("is-loading", Boolean(loading));
    btn.disabled = Boolean(loading);
  };

  window.NORDY_UTILS = U;
})();
