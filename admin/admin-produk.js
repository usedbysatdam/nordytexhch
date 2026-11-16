// Nordy Tech — Admin: CRUD Produk, Varian, & Foto
(function () {
  const U = window.NORDY_UTILS;
  const Admin = window.NORDY_ADMIN;
  Admin.mountSide("produk.html");
  const sb = () => window.NORDY_DB.client();

  const listEl = document.getElementById("productList");
  const modal = document.getElementById("productModal");
  const form = document.getElementById("productForm");
  let editing = null;       // product row being edited (or null = new)
  let currentImages = [];   // {id?, url, alt_text, sort_order, _new?}
  let removedImageIds = [];

  document.getElementById("cancelBtn").addEventListener("click", () => modal.close());
  document.getElementById("addProductBtn").addEventListener("click", () => openModal(null));
  document.getElementById("addVariantBtn").addEventListener("click", () => addVariantRow());
  document.getElementById("pname").addEventListener("input", function () {
    if (!editing) document.getElementById("pslug").value = U.slugify(this.value);
  });
  form.addEventListener("submit", saveProduct);
  document.getElementById("pimageFile").addEventListener("change", uploadImage);

  // ---------- LIST ----------
  async function loadList() {
    listEl.innerHTML = '<div class="skeleton" style="height:240px"></div>';
    const { data, error } = await sb().from("products")
      .select("*, product_variants(*), product_images(*)").order("created_at");
    if (error) { listEl.innerHTML = '<div class="alert alert--error">Gagal memuat: ' + U.escapeHtml(error.message) + '</div>'; return; }
    if (!data.length) { listEl.innerHTML = '<div class="empty"><div class="icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3z"/><path d="M7 7v14M12 7v14"/></svg></div><h3>Belum ada produk</h3><p class="muted">Tambahkan produk pertama.</p></div>'; return; }
    listEl.innerHTML = '<div class="stack stack-4">' + data.map(function (p) {
      const vs = p.product_variants || [];
      const img = (p.product_images || [])[0];
      const imgUrl = img ? window.NORDY_DB.publicUrl(img.url) : "";
      const stock = vs.reduce((s, v) => s + v.stock, 0);
      return '<div class="card"><div class="row between wrap gap-3">' +
        '<div class="row gap-4">' +
          (imgUrl ? '<img src="' + U.escapeHtml(imgUrl) + '" alt="" style="width:72px;height:72px;object-fit:cover;border:2px solid var(--color-ink);border-radius:10px">' : '<span style="font-size:40px"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3z"/><path d="M7 7v14M12 7v14"/></svg></span>') +
          '<div><h3 class="card-title">' + U.escapeHtml(p.name) + '</h3>' +
          '<div class="meta">/' + U.escapeHtml(p.slug) + ' · ' + vs.length + ' varian · stok ' + stock + '</div></div>' +
        '</div>' +
        '<div class="row gap-2"><span class="badge ' + (p.is_active ? 'badge--success' : 'badge--muted') + '">' + (p.is_active ? 'Aktif' : 'Nonaktif') + '</span>' +
        '<button class="button button--secondary button--sm" data-edit="' + p.id + '">Edit</button>' +
        '<button class="button button--danger button--sm" data-del="' + p.id + '" data-name="' + U.escapeHtml(p.name) + '">Hapus</button></div>' +
      '</div></div>';
    }).join("") + '</div>';

    listEl.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => {
      openModal(data.find(p => p.id === b.dataset.edit));
    }));
    listEl.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => deleteProduct(b.dataset.del, b.dataset.name)));
  }

  // ---------- MODAL ----------
  function openModal(product) {
    editing = product;
    currentImages = [];
    removedImageIds = [];
    document.getElementById("modalTitle").textContent = product ? "Edit Produk" : "Tambah Produk";
    document.getElementById("pname").value = product ? product.name : "";
    document.getElementById("pslug").value = product ? product.slug : "";
    document.getElementById("pdesc").value = product ? product.description : "";
    document.getElementById("pactive").checked = product ? product.is_active : true;
    const specs = product && product.specifications ? product.specifications : {};
    document.getElementById("pspecs").value = Object.keys(specs).map(k => k + ": " + specs[k]).join("\n");

    const rows = document.getElementById("variantRows");
    rows.innerHTML = "";
    const vs = product && product.product_variants ? product.product_variants : [];
    if (vs.length) vs.forEach(v => addVariantRow(v));
    else addVariantRow();

    if (product && product.product_images) {
      currentImages = product.product_images.sort((a, b) => a.sort_order - b.sort_order).map(im => ({ id: im.id, url: im.url, alt_text: im.alt_text, sort_order: im.sort_order }));
    }
    renderImages();
    modal.showModal();
  }

  function addVariantRow(v) {
    const rows = document.getElementById("variantRows");
    const wrap = document.createElement("div");
    wrap.className = "card card--flat";
    wrap.style.boxShadow = "none";
    wrap.innerHTML = '' +
      '<input type="hidden" data-v-id value="' + (v ? v.id : "") + '">' +
      '<div class="row wrap gap-3">' +
        '<div class="field grow" style="margin-bottom:0"><label>Nama Varian</label><input class="input" data-v-name value="' + U.escapeHtml(v ? v.name : "") + '"></div>' +
        '<div class="field" style="margin-bottom:0;width:140px"><label>SKU</label><input class="input" data-v-sku value="' + U.escapeHtml(v ? v.sku : "") + '"></div>' +
        '<div class="field" style="margin-bottom:0;width:120px"><label>Harga</label><input class="input" type="number" min="1" data-v-price value="' + (v ? v.price : "") + '"></div>' +
        '<div class="field" style="margin-bottom:0;width:100px"><label>Stok</label><input class="input" type="number" min="0" data-v-stock value="' + (v ? v.stock : 0) + '"></div>' +
        '<div class="field" style="margin-bottom:0"><label>Status</label><select class="select" data-v-active><option value="true"' + (!v || v.is_active ? " selected" : "") + '>Aktif</option><option value="false"' + (v && !v.is_active ? " selected" : "") + '>Nonaktif</option></select></div>' +
        '<button type="button" class="button button--danger button--sm" data-v-remove style="align-self:flex-end">Hapus</button>' +
      '</div>';
    wrap.querySelector("[data-v-remove]").addEventListener("click", () => wrap.remove());
    rows.appendChild(wrap);
  }

  // ---------- IMAGES ----------
  function renderImages() {
    const box = document.getElementById("imageList");
    if (!currentImages.length) { box.innerHTML = '<span class="muted">Belum ada foto.</span>'; return; }
    box.innerHTML = currentImages.map(function (im, i) {
      const url = im._new ? im.url : window.NORDY_DB.publicUrl(im.url);
      return '<div class="stack stack-2" style="align-items:center">' +
        '<div class="thumb-btn active"><img src="' + U.escapeHtml(url) + '" alt=""></div>' +
        '<button type="button" class="button button--danger button--sm" data-img-del="' + i + '">Hapus</button></div>';
    }).join("");
    box.querySelectorAll("[data-img-del]").forEach(b => b.addEventListener("click", function () {
      const i = Number(this.dataset.imgDel);
      if (currentImages[i].id) removedImageIds.push(currentImages[i].id);
      else if (currentImages[i]._path) removeStorageFile(currentImages[i]._path);
      currentImages.splice(i, 1);
      renderImages();
    }));
  }

  async function uploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) { U.toast("Format harus JPG/PNG/WebP.", "error"); e.target.value = ""; return; }
    if (file.size > 2 * 1024 * 1024) { U.toast("Ukuran maksimal 2 MB.", "error"); e.target.value = ""; return; }

    const btn = document.getElementById("saveProductBtn");
    U.setLoading(btn, true);
    try {
      const path = "products/" + Date.now() + "-" + U.slugify(file.name.replace(/\.[^.]+$/, "")) + "." + file.name.split(".").pop().toLowerCase();
      const { error } = await sb().storage.from(window.NORDY_DB.bucket()).upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: pub } = sb().storage.from(window.NORDY_DB.bucket()).getPublicUrl(path);
      currentImages.push({ url: pub.publicUrl, alt_text: document.getElementById("pname").value || "Foto produk", sort_order: currentImages.length, _new: true, _path: path });
      renderImages();
      U.toast("Foto diunggah.");
    } catch (err) {
      console.error(err);
      U.toast("Gagal mengunggah foto.", "error");
    } finally { U.setLoading(btn, false); e.target.value = ""; }
  }

  async function removeStorageFile(path) {
    try { await sb().storage.from(window.NORDY_DB.bucket()).remove([path]); } catch (e) {}
  }

  // ---------- SAVE ----------
  async function saveProduct(e) {
    e.preventDefault();
    const btn = document.getElementById("saveProductBtn");
    const name = document.getElementById("pname").value.trim();
    const slug = U.slugify(document.getElementById("pslug").value.trim() || name);
    const description = document.getElementById("pdesc").value.trim();
    if (!name || !slug || !description) { U.toast("Nama, slug, dan deskripsi wajib.", "error"); return; }

    const specs = {};
    document.getElementById("pspecs").value.split("\n").forEach(line => {
      const idx = line.indexOf(":");
      if (idx > 0) specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });

    const variants = Array.from(document.querySelectorAll("#variantRows > .card")).map(row => ({
      id: row.querySelector("[data-v-id]").value || null,
      name: row.querySelector("[data-v-name]").value.trim(),
      sku: row.querySelector("[data-v-sku]").value.trim(),
      price: Number(row.querySelector("[data-v-price]").value),
      stock: Number(row.querySelector("[data-v-stock]").value),
      is_active: row.querySelector("[data-v-active]").value === "true"
    }));
    for (const v of variants) {
      if (!v.name || !v.sku || !(v.price > 0) || v.stock < 0) { U.toast("Lengkapi varian: nama, SKU, harga > 0, stok ≥ 0.", "error"); return; }
    }

    U.setLoading(btn, true);
    try {
      const payload = { name, slug, description, specifications: specs, is_active: document.getElementById("pactive").checked };
      let productId = editing ? editing.id : null;
      if (productId) {
        const { error } = await sb().from("products").update(payload).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await sb().from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      // variants: delete removed, upsert rest
      const existing = editing ? (editing.product_variants || []) : [];
      const keepIds = variants.filter(v => v.id).map(v => v.id);
      const toDelete = existing.filter(v => !keepIds.includes(v.id)).map(v => v.id);
      if (toDelete.length) await sb().from("product_variants").delete().in("id", toDelete);
      for (const v of variants) {
        if (v.id) {
          await sb().from("product_variants").update({ name: v.name, sku: v.sku, price: v.price, stock: v.stock, is_active: v.is_active }).eq("id", v.id);
        } else {
          await sb().from("product_variants").insert({ product_id: productId, name: v.name, sku: v.sku, price: v.price, stock: v.stock, is_active: v.is_active });
        }
      }

      // images: delete removed, upsert current
      for (const id of removedImageIds) await sb().from("product_images").delete().eq("id", id);
      for (let i = 0; i < currentImages.length; i++) {
        const im = currentImages[i];
        if (im.id) {
          await sb().from("product_images").update({ alt_text: im.alt_text, sort_order: i }).eq("id", im.id);
        } else {
          await sb().from("product_images").insert({ product_id: productId, url: im.url, alt_text: im.alt_text, sort_order: i });
        }
      }

      U.toast("Produk disimpan.");
      modal.close();
      loadList();
    } catch (err) {
      console.error(err);
      U.toast("Gagal menyimpan: " + (err.message || ""), "error");
    } finally { U.setLoading(btn, false); }
  }

  // ---------- DELETE (soft if ordered) ----------
  async function deleteProduct(id, name) {
    if (!confirm('Hapus produk "' + name + '"? Produk yang sudah pernah dipesan akan dinonaktifkan.')) return;
    try {
      const { count } = await sb().from("order_items").select("id", { count: "exact", head: true }).eq("variant_id", id);
      // check via any variant
      const { data: vs } = await sb().from("product_variants").select("id").eq("product_id", id);
      let ordered = false;
      for (const v of (vs || [])) {
        const { count: c } = await sb().from("order_items").select("id", { count: "exact", head: true }).eq("variant_id", v.id);
        if (c > 0) { ordered = true; break; }
      }
      if (ordered) {
        await sb().from("product_variants").update({ is_active: false }).eq("product_id", id);
        await sb().from("products").update({ is_active: false }).eq("id", id);
        U.toast("Produk dinonaktifkan (soft delete).");
      } else {
        await sb().from("product_images").delete().eq("product_id", id);
        await sb().from("product_variants").delete().eq("product_id", id);
        await sb().from("products").delete().eq("id", id);
        U.toast("Produk dihapus.");
      }
      loadList();
    } catch (err) {
      console.error(err);
      U.toast("Gagal menghapus: " + (err.message || ""), "error");
    }
  }

  (async function () { await Admin.requireAuth(); loadList(); })();
})();