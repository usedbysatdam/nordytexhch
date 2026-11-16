// Nordy Tech — Konfigurasi
// Isi dengan kredensial proyek Supabase Anda (Project Settings > API).
// Kunci "anon" aman dipublikasikan selama RLS aktif (lihat supabase/schema.sql).
window.NORDY_CONFIG = {
  SUPABASE_URL: "https://pvejiondelvrhgooubty.supabase.co", // contoh: https://xxxx.supabase.co
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZWppb25kZWx2cmhnb291YnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MTUwMzgsImV4cCI6MjEwNzI5MTAzOH0.q6gk9WuBxi2gBrWeYCFxs0CwHQ4BndJj0Xs48GpM-OQ", // contoh: eyJhbGci...
  STORAGE_BUCKET: "product-images",
  CART_KEY: "nordy_cart_v1",
  CART_TTL_DAYS: 7,

  // Dipakai saat Supabase belum dikonfigurasi agar UI dapat dipreview.
  // Data ini HANYA muncul sebagai mode "contoh" dan tidak tersimpan/tidak dikirim.
  DEMO_MODE: false,

  // Service Worker registration untuk offline mode
  registerServiceWorker: function () {
    if (!('serviceWorker' in navigator)) return;
    // Hanya daftarkan SW di HTTPS atau localhost
    if (location.protocol === 'https:' || location.hostname === 'localhost') {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW terdaftar:', registration.scope);
          // Cek update SW
          registration.onupdatefound = () => {
            const newWorker = registration.installing;
            newWorker.onstatechange = () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Refresh UI jika ada konten baru
                window.location.reload();
              }
            };
          };
        })
        .catch(err => console.error('SW registration failed:', err));
    }
  }
};

// Daftar modul yang membutuhkan Supabase. Jika belum diisi, aplikasi
// otomatis berjalan dalam mode contoh (read-only) dengan penanda jelas.
window.NORDY_CONFIG.isConfigured = function () {
  return Boolean(
    this.SUPABASE_URL &&
    this.SUPABASE_ANON_KEY &&
    !this.SUPABASE_URL.includes("xxxx"),
  );
};
