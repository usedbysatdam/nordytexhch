// Nordy Tech — Dashboard Admin (stats + pesanan terbaru)
(function () {
  const U = window.NORDY_UTILS;
  const Data = window.NORDY_DATA;
  const Admin = window.NORDY_ADMIN;
  Admin.mountSide("index.html");
  const statsEl = document.getElementById("statCards");
  const recentEl = document.getElementById("recentOrders");

  async function init() {
    const session = await Admin.requireAuth();
    const sb = window.NORDY_DB.client();

    // stats
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    const [ordersToday, ordersMonth, waitingPay, lowStock] = await Promise.all([
      sb.from("orders").select("id,total,status", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
      sb.from("orders").select("id,total", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
      sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "menunggu_pembayaran"),
      sb.from("product_variants").select("id", { count: "exact", head: true }).lte("stock", 5).gt("stock", 0).eq("is_active", true)
    ]);

    const salesMonth = await sb.from("orders").select("total").neq("status", "dibatalkan").gte("created_at", monthStart.toISOString());
    const salesSum = (salesMonth.data || []).reduce((s, o) => s + (o.total || 0), 0);

    statsEl.innerHTML = '' +
      '<div class="stat stat--yellow"><div class="label">Pesanan Hari Ini</div><div class="value">' + (ordersToday.count || 0) + '</div></div>' +
      '<div class="stat stat--teal"><div class="label">Pesanan Bulan Ini</div><div class="value">' + (ordersMonth.count || 0) + '</div></div>' +
      '<div class="stat stat--purple"><div class="label">Penjualan Bulan Ini</div><div class="value">' + U.rupiah(salesSum) + '</div></div>' +
      '<div class="stat stat--pink"><div class="label">Menunggu Pembayaran</div><div class="value">' + (waitingPay.count || 0) + '</div></div>';

    // recent 5
    const { data: recent } = await sb.from("orders").select("order_number,created_at,total,status,shipping_name").order("created_at", { ascending: false }).limit(5);
    if (!recent || !recent.length) {
      recentEl.innerHTML = '<p class="muted">Belum ada pesanan.</p>';
      return;
    }
    recentEl.innerHTML = '<div class="table-wrap"><table class="data"><thead><tr><th>No. Pesanan</th><th>Pelanggan</th><th>Tanggal</th><th>Total</th><th>Status</th></tr></thead><tbody>' +
      recent.map(function (o) {
        return '<tr>' +
          '<td><a href="pesanan.html?id=' + U.escapeHtml(o.order_number) + '">' + U.escapeHtml(o.order_number) + '</a></td>' +
          '<td>' + U.escapeHtml(o.shipping_name) + '</td>' +
          '<td>' + U.formatDate(o.created_at) + '</td>' +
          '<td>' + U.rupiah(o.total) + '</td>' +
          '<td><span class="badge ' + U.statusBadgeClass(o.status) + '">' + U.statusLabel(o.status) + '</span></td>' +
        '</tr>';
      }).join("") + '</tbody></table></div>';
  }

  init();
})();