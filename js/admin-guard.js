// Nordy Tech — Auth guard untuk semua halaman admin (kecuali login).
// Panggil: await NORDY_ADMIN.requireAuth() di awal script halaman.
(function () {
  async function requireAuth() {
    if (!window.NORDY_DB.isReady()) {
      location.href = "login.html?demo=1";
      throw new Error("Supabase belum dikonfigurasi");
    }
    const sb = window.NORDY_DB.client();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { location.href = "login.html"; throw new Error("no session"); }
    const { data } = await sb.rpc("is_admin");
    if (!data) {
      await sb.auth.signOut();
      location.href = "login.html?error=forbidden";
      throw new Error("forbidden");
    }
    return session;
  }

  async function logout() {
    if (window.NORDY_DB.isReady()) {
      await window.NORDY_DB.client().auth.signOut();
    }
    location.href = "login.html";
  }

  function mountSide(active) {
    const side = document.getElementById("adminSide");
    if (!side) return;
    const links = [
      ["index.html", '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>', "Dashboard"],
      ["produk.html", '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3z"/><path d="M7 7v14M12 7v14"/></svg>', "Produk"],
      ["pesanan.html", '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h18v4H3z"/><path d="M5 8h14l2 12H3z"/></svg>', "Pesanan"],
      ["pengaturan.html", '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M2 12h4M18 12h4M12 2v4M12 18v4"/></svg>', "Pengaturan"]
    ];
    side.innerHTML = '' +
    '<a class="brand" href="index.html"><span class="logo-badge"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg></span><span class="name">Nordy Admin</span></a>' +
    '<nav class="admin-nav" aria-label="Navigasi admin">' +
      links.map(function (l) {
        return '<a href="' + l[0] + '"' + (active === l[0] ? ' class="active" aria-current="page"' : "") + '><span>' + l[1] + '</span> ' + l[2] + '</a>';
      }).join("") +
    '</nav>' +
    '<div class="mt-6 stack stack-2">' +
      '<a href="../index.html" class="button button--secondary button--sm button--block">Lihat Toko</a>' +
      '<button type="button" class="button button--danger button--sm button--block" id="logoutBtn">Keluar</button>' +
    '</div>';
    const btn = document.getElementById("logoutBtn");
    if (btn) btn.addEventListener("click", function () {
      if (confirm("Keluar dari admin?")) logout();
    });
  }

  window.NORDY_ADMIN = { requireAuth: requireAuth, logout: logout, mountSide: mountSide };
})();
