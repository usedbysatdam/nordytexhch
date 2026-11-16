// Nordy Tech — Data contoh untuk preview TANPA Supabase.
// Berlabel jelas "Contoh" di UI bila mode ini aktif. Jangan dipakai produksi.
window.NORDY_DEMO = {
  settings: {
    seller_whatsapp: "6280000000000",
    payment_instructions: "Contoh: transfer ke rekening/e-wallet Nordy Tech, lalu konfirmasi via WhatsApp dengan nomor pesanan.",
    low_stock_threshold: "5",
    hero_title: "Aksesori yang lahir dari komponen teknologi",
    hero_subtitle: "Jepit rambut PCB dan keychain RJ45 — dipakai sebagai gaya, dikenali sebagai identitas."
  },
  shipping: [
    { id: "demo-jne-reg", courier_name: "JNE", service_name: "Reguler", estimate_text: "2-3 hari", cost: 12000 },
    { id: "demo-jne-exp", courier_name: "JNE", service_name: "Express", estimate_text: "1 hari", cost: 25000 },
    { id: "demo-pickup", courier_name: "Ambil di Tempat", service_name: "Pickup", estimate_text: "Sesuai janji", cost: 0 }
  ],
  products: [
    {
      id: "demo-pcb", name: "Jepit Rambut PCB", slug: "jepit-rambut-pcb",
      description: "Contoh deskripsi: Jepit rambut dengan kepingan PCB asli sebagai aksen. Ringan, unik, dan cocok untuk gaya harian maupun hadiah.",
      specifications: { "Bahan": "PCB + Jepit metal", "Ukuran": "± 6 cm", "Berat": "± 15 g", "Perawatan": "Lapkan kain kering" },
      is_active: true, accent: "pink", emoji: "💜",
      images: [
        { url: "assets/products/jepit-rambut-pcb-foto.jpg", alt_text: "Jepit Rambut PCB — foto asli dipakai di rambut", sort_order: 0 },
        { url: "assets/products/jepit-rambut-pcb.svg", alt_text: "Jepit Rambut PCB — varian PCB Hijau", sort_order: 1 },
        { url: "assets/products/jepit-rambut-pcb-2.svg", alt_text: "Jepit Rambut PCB — varian PCB Hitam", sort_order: 2 }
      ],
      variants: [
        { id: "demo-pcb-a", product_id: "demo-pcb", name: "PCB Hijau", sku: "NORDY-PCB-GRN", price: 15000, stock: 12, is_active: true },
        { id: "demo-pcb-b", product_id: "demo-pcb", name: "PCB Hitam", sku: "NORDY-PCB-BLK", price: 15000, stock: 3, is_active: true }
      ]
    },
    {
      id: "demo-rj45", name: "Keychain RJ45", slug: "keychain-rj45",
      description: "Contoh deskripsi: Gantungan kunci konektor RJ45 asli. Identitas wajib untuk anak jaringan, IT, dan penggemar teknologi.",
      specifications: { "Bahan": "Konektor RJ45 + ring stainless", "Ukuran": "± 5 cm", "Berat": "± 20 g", "Kemasan": "Pouch Nordy Tech" },
      is_active: true, accent: "teal", emoji: "🔌",
      images: [
        { url: "assets/products/keychain-rj45.svg", alt_text: "Keychain RJ45 — konektor jaringan", sort_order: 0 },
        { url: "assets/products/keychain-rj45-2.svg", alt_text: "Keychain RJ45 — dengan kabel pendek", sort_order: 1 }
      ],
      variants: [
        { id: "demo-rj45-a", product_id: "demo-rj45", name: "Konektor Standar", sku: "NORDY-RJ45-STD", price: 10000, stock: 20, is_active: true },
        { id: "demo-rj45-b", product_id: "demo-rj45", name: "Konektor + Kabel Pendek", sku: "NORDY-RJ45-CBL", price: 10000, stock: 0, is_active: true }
      ]
    }
  ]
};
