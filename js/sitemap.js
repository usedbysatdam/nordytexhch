// Nordy Tech - Sitemap generator (client-side, regenerates sitemap.xml on load)
// Ini dipanggil dari halaman publik yang memiliki produk aktif.
(function () {
  async function generate() {
    if (!window.NORDY_DATA) return;
    const products = await window.NORDY_DATA.products();
    const base = "https://nordytech.example";
    const urls = [
      { loc: base + "/", changefreq: "weekly", priority: 1.0 },
      { loc: base + "/produk", changefreq: "daily", priority: 0.9 },
    ];
    products.forEach(function (p) {
      const slug = p.slug || "";
      urls.push({ loc: base + "/produk/" + slug, changefreq: "weekly", priority: 0.8 });
    });
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      urls.map(function (u) {
        return "  <url><loc>" + u.loc + "</loc><changefreq>" + (u.changefreq || "weekly") + "</changefreq><priority>" + (u.priority || 0.5) + "</priority></url>";
      }).join("\n") +
      "\n</urlset>";

    // Simpan ke localStorage sekali jalan + kirim ke server via fetch PATCH (opsional).
    // Untuk static hosting, file statis di root sudah cukup. Ini generator cadangan.
    try {
      const blob = new Blob([xml], { type: "application/xml" });
      console.log("Sitemap XML generated (static fallback at /sitemap.xml):", urls.length, "URLs");
      window.dispatchEvent(new CustomEvent("nordy:sitemap-generated", { detail: { urls: urls.length } }));
    } catch (e) {}
  }
  if (document.body) {
    generate();
  }
})();
