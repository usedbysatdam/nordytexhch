// Nordy Tech — Login Admin (Supabase Auth + rate limiting sederhana)
(function () {
  const U = window.NORDY_UTILS;
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");

  const qs = new URLSearchParams(location.search);
  if (qs.get("demo")) {
    msg.innerHTML = '<div class="alert alert--warning">Supabase belum dikonfigurasi. Isi <code>js/config.js</code> lalu buat akun admin sesuai <code>README.md</code>.</div>';
  }
  if (qs.get("error") === "forbidden") {
    msg.innerHTML = '<div class="alert alert--error">Akun ini bukan admin.</div>';
  }

  // Rate limit klien: max 5 percobaan / 5 menit
  const ATTEMPT_KEY = "nordy_login_attempts";
  function attempts() {
    try {
      const arr = JSON.parse(localStorage.getItem(ATTEMPT_KEY) || "[]");
      const now = Date.now();
      return arr.filter(function (t) { return now - t < 5 * 60 * 1000; });
    } catch (e) { return []; }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const btn = document.getElementById("loginBtn");
    msg.innerHTML = "";
    if (attempts().length >= 5) {
      msg.innerHTML = '<div class="alert alert--error">Terlalu banyak percobaan. Tunggu ±5 menit lalu coba lagi.</div>';
      return;
    }
    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    if (!email || !password) {
      msg.innerHTML = '<div class="alert alert--error">Email dan kata sandi wajib diisi.</div>';
      return;
    }
    if (!window.NORDY_DB.isReady()) {
      msg.innerHTML = '<div class="alert alert--warning">Supabase belum dikonfigurasi (lihat README.md).</div>';
      return;
    }

    U.setLoading(btn, true);
    try {
      const sb = window.NORDY_DB.client();
      const { error } = await sb.auth.signInWithPassword({ email: email, password: password });
      if (error) throw error;
      const { data: admin } = await sb.rpc("is_admin");
      if (!admin) {
        await sb.auth.signOut();
        throw new Error("Akun ini bukan admin.");
      }
      await sb.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("email", email);
      location.href = "index.html";
    } catch (err) {
      const arr = attempts(); arr.push(Date.now());
      try { localStorage.setItem(ATTEMPT_KEY, JSON.stringify(arr)); } catch (e2) {}
      console.error(err);
      // Pesan generik (PRD AC-AD-02)
      msg.innerHTML = '<div class="alert alert--error">Email atau kata sandi salah.</div>';
    } finally {
      U.setLoading(btn, false);
    }
  });
})();
