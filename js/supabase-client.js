// Nordy Tech — Klien Supabase (via CDN @supabase/supabase-js v2)
// Menyediakan window.NORDY_DB untuk semua modul.
(function () {
  const cfg = window.NORDY_CONFIG;
  let client = null;

  function ensure() {
    if (!cfg.isConfigured()) return null;
    if (client) return client;
    if (!window.supabase || !window.supabase.createClient) return null;
    client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    return client;
  }

  window.NORDY_DB = {
    client: ensure,
    isReady: function () { return Boolean(ensure()); },
    bucket: function () { return cfg.STORAGE_BUCKET; },
    publicUrl: function (path) {
      if (!path) return "";
      // URL absolut, path root-relative, atau aset lokal -> pakai apa adanya.
      if (/^(https?:)?\/\//.test(path) || path.charAt(0) === "/" || path.indexOf("assets/") === 0 || path.indexOf("./") === 0) return path;
      const sb = ensure();
      if (!sb) return path;
      return sb.storage.from(cfg.STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
    }
  };
})();
