import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Hex Colors based on Shinerva AI Palette
const COLOR_TERRACOTTA = '#E2725B';
const COLOR_DARK = '#131314';
const COLOR_MUTED = '#7A6964';
const COLOR_LIGHT_BG = '#FDFBF7';
const COLOR_CARD_BG = '#F0EEE9';
const COLOR_BORDER = '#E6E3DB';
const COLOR_WHITE = '#FAFAFA';
const COLOR_SUCCESS = '#10B981';

function createPaymentFlowPDFFinal() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 50, right: 50 }
  });

  const outputPath = path.resolve('Shinerva_AI_Midtrans_Payment_Flow_Final.pdf');
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Total pages is now 5
  const TOTAL_PAGES = 5;

  // -------------------------------------------------------------
  // HELPER: Vector Arrow Drawing
  // -------------------------------------------------------------
  function drawArrow(x1, y1, x2, y2, color = COLOR_TERRACOTTA, width = 1.5) {
    doc.save();
    doc.strokeColor(color).lineWidth(width);
    doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 5;
    doc.moveTo(x2, y2)
       .lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6))
       .lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6))
       .lineTo(x2, y2)
       .fill(color);
    doc.restore();
  }

  // -------------------------------------------------------------
  // HELPER: Header & Footer decoration
  // -------------------------------------------------------------
  function drawHeaderFooter(pageNumber, totalPages) {
    doc.save();
    // Top border bar
    doc.rect(0, 0, 595, 8).fill(COLOR_TERRACOTTA);
    
    // Header text
    doc.fillColor(COLOR_MUTED)
       .font('Helvetica-Bold')
       .fontSize(8)
       .text('SHINERVA AI — MIDTRANS INTEGRATION SPECIFICATION', 50, 20)
       .font('Helvetica')
       .text('PAYMENT FLOW & CUSTOMER JOURNEY', 50, 30, { align: 'left' });
       
    // Footer line
    doc.strokeColor(COLOR_BORDER).lineWidth(0.5);
    doc.moveTo(50, 800).lineTo(545, 800).stroke();
    
    // Footer text
    doc.fillColor(COLOR_MUTED)
       .font('Helvetica')
       .fontSize(8)
       .text('Shinerva AI (https://shinerva.id) — Platform AI Voice Emosional', 50, 807)
       .text(`Halaman ${pageNumber} dari ${totalPages}`, 50, 807, { align: 'right' });
    doc.restore();
  }

  // -------------------------------------------------------------
  // PAGE 1: COVER & EXECUTIVE OVERVIEW
  // -------------------------------------------------------------
  
  // Outer decorative border
  doc.rect(30, 30, 535, 782).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
  
  // Title Card
  doc.rect(50, 60, 495, 140).fill(COLOR_DARK);
  doc.fillColor(COLOR_TERRACOTTA)
     .font('Helvetica-Bold')
     .fontSize(24)
     .text('SHINERVA AI', 75, 90, { tracking: 2 });
  
  doc.fillColor(COLOR_WHITE)
     .font('Helvetica-Bold')
     .fontSize(16)
     .text('Midtrans Payment Flow & Customer Journey', 75, 125);
     
  doc.fillColor(COLOR_MUTED)
     .font('Helvetica')
     .fontSize(10)
     .text('Dokumen Kepatuhan & Integrasi Gateway Pembayaran (Final Audit)', 75, 155);

  // Try to embed Logo
  try {
    const logoPath = path.resolve('public/shinerva-icon.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 450, 85, { width: 70 });
    }
  } catch (err) {
    console.warn("Could not load logo image for cover page, fallback to vector.");
  }

  // Merchant Information Table
  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(12)
     .text('INFORMASI MERCHANT & LAYANAN', 50, 230);
     
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1).moveTo(50, 245).lineTo(150, 245).stroke();

  // Draw metadata box
  doc.rect(50, 260, 495, 140).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
  
  const metaItems = [
    { label: 'Merchant / Nama Platform', value: 'Shinerva AI' },
    { label: 'Situs Resmi / URL', value: 'https://shinerva.id' },
    { label: 'Kategori Produk / Layanan', value: 'Digital SaaS — AI Text-to-Speech Service' },
    { label: 'Tipe Produk & Distribusi', value: 'Jasa Digital (Akses Langsung, Tanpa Pengiriman Fisik)' },
    { label: 'Penyedia Gateway Pembayaran', value: 'Midtrans Snap integration (PT Midtrans)' },
    { label: 'Status Dokumen', value: 'Siap Produksi (Midtrans Production Onboarding Review)' }
  ];

  let currentY = 275;
  metaItems.forEach(item => {
    doc.fillColor(COLOR_MUTED)
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(item.label, 70, currentY, { width: 180 });
       
    doc.fillColor(COLOR_DARK)
       .font('Helvetica')
       .fontSize(9)
       .text(item.value, 260, currentY, { width: 260 });
       
    doc.strokeColor(COLOR_BORDER).lineWidth(0.5).moveTo(70, currentY + 16).lineTo(525, currentY + 16).stroke();
    currentY += 21;
  });

  // Compliance Notes Section
  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(12)
     .text('KEPATUHAN LAYANAN & DISTRIBUSI DIGITAL', 50, 430);
     
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1).moveTo(50, 445).lineTo(150, 445).stroke();

  doc.rect(50, 460, 495, 180).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
  
  const compliancePoints = [
    { title: 'Aktivasi Instan Otomatis:', desc: 'After successful payment confirmation from Midtrans, Shinerva AI automatically activates credits/subscription. Sistem kami secara otomatis menambahkan kredit karakter (kredit suara) langsung ke database akun pengguna secara real-time.' },
    { title: 'Ketersediaan Saluran Pembayaran:', desc: 'Available payment methods depend on Midtrans configuration and merchant activation. Tidak semua opsi diaktifkan secara default dan bergantung sepenuhnya pada persetujuan/konfigurasi di dashboard Midtrans.' },
    { title: 'Pengiriman Digital & Refund:', desc: 'Shinerva AI adalah layanan Text-to-Speech berbasis Cloud. Tidak ada pengiriman fisik. Pengguna diberikan akses gratis 10.000 karakter saat pendaftaran untuk menguji kualitas suara AI. Pembelian bersifat non-refundable (tidak dapat dikembalikan) setelah kredit terpakai.' },
    { title: 'Keamanan Transaksi & Data:', desc: 'Semua informasi kartu kredit, kredensial e-wallet, dan transfer bank ditangani secara aman oleh sistem Midtrans Snap PCI-DSS compliant. Shinerva AI tidak menyimpan data sensitif kartu.' }
  ];

  let compY = 472;
  compliancePoints.forEach(point => {
    // Small checkmark or bullet
    doc.fillColor(COLOR_TERRACOTTA)
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('✓', 65, compY);
       
    doc.fillColor(COLOR_DARK)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(point.title, 80, compY);
       
    doc.fillColor(COLOR_MUTED)
       .font('Helvetica')
       .fontSize(8.5)
       .text(point.desc, 80, compY + 12, { width: 440, align: 'justify', lineGap: 1.5 });
       
    compY += 41;
  });

  // Footer bar on first page
  drawHeaderFooter(1, TOTAL_PAGES);

  // -------------------------------------------------------------
  // PAGE 2: CUSTOMER JOURNEY (STEP 1 - 8)
  // -------------------------------------------------------------
  doc.addPage();
  doc.rect(30, 30, 535, 782).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
  drawHeaderFooter(2, TOTAL_PAGES);

  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('ALUR JOURNEY PELANGGAN & WORKFLOW PEMBELIAN', 50, 60);
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1.5).moveTo(50, 78).lineTo(150, 78).stroke();

  // Timeline / Workflow UI drawing
  const steps = [
    { step: 'STEP 01', title: 'Kunjungan Website', desc: 'Pelanggan mengunjungi situs resmi di https://shinerva.id melalui browser desktop atau mobile.' },
    { step: 'STEP 02', title: 'Review Layanan & Harga', desc: 'Pelanggan meninjau fitur AI voice generation, daftar suara, paket harga, serta kebijakan layanan.' },
    { step: 'STEP 03', title: 'Registrasi / Log In', desc: 'Pelanggan membuat akun baru atau masuk menggunakan Google Authentication atau Email Magic Link.' },
    { step: 'STEP 04', title: 'Masuk Dashboard', desc: 'Sistem menyambut pelanggan dan membuka akses penuh ke dashboard studio voice generator.' },
    { step: 'STEP 05', title: 'Pilih Paket Kredit', desc: 'Pelanggan memilih paket subscription/top-up kredit suara: Creator, Pro, atau Business.' },
    { step: 'STEP 06', title: 'Klik Beli / Checkout', desc: 'Pelanggan menekan tombol "Beli Sekarang / Subscribe". Sistem mengumpulkan data rincian transaksi.' },
    { step: 'STEP 07', title: 'Pembuatan Transaksi', desc: 'Server Shinerva melakukan API POST ke /api/payment/create. Midtrans menerbitkan Token Snap unik.' },
    { step: 'STEP 08', title: 'Redirect ke Midtrans Snap', desc: 'Dashboard membuka widget/popup Midtrans Snap. Pelanggan dialihkan ke laman aman untuk membayar.' }
  ];

  let stepY = 100;
  steps.forEach((s, idx) => {
    // Draw timeline vertical line
    if (idx < steps.length - 1) {
      doc.save();
      doc.strokeColor(COLOR_BORDER).lineWidth(1.2);
      doc.moveTo(85, stepY + 32).lineTo(85, stepY + 62).stroke();
      doc.restore();
    }

    // Step circle/indicator
    doc.save();
    doc.fillColor(COLOR_TERRACOTTA);
    doc.circle(85, stepY + 16, 12).fill();
    doc.fillColor(COLOR_WHITE)
       .font('Helvetica-Bold')
       .fontSize(7.5)
       .text((idx + 1).toString().padStart(2, '0'), 79, stepY + 13);
    doc.restore();

    // Step Details Card
    doc.rect(115, stepY, 215, 38).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
    
    doc.fillColor(COLOR_TERRACOTTA)
       .font('Helvetica-Bold')
       .fontSize(8)
       .text(s.step, 125, stepY + 6);
       
    doc.fillColor(COLOR_DARK)
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(s.title, 175, stepY + 6);
       
    doc.fillColor(COLOR_MUTED)
       .font('Helvetica')
       .fontSize(7.5)
       .text(s.desc, 125, stepY + 18, { width: 195 });

    stepY += 46;
  });

  // -------------------------------------------------------------
  // LAYOUT SCHEMATIC PLACEHOLDERS / WIREFRAMES (Right Side of Page 2)
  // -------------------------------------------------------------
  doc.strokeColor(COLOR_BORDER).lineWidth(0.5).moveTo(345, 95).lineTo(345, 780).stroke();

  // 1. MOCKUP: Landing Page & TTS Workspace (Steps 1, 2, 3, 4)
  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(8.5).text('MOCKUP SCREEN: LANDING PAGE & DASHBOARD', 355, 100);
  
  doc.rect(355, 115, 180, 195).fill(COLOR_DARK).strokeColor(COLOR_BORDER).stroke();
  doc.rect(355, 115, 180, 20).fill(COLOR_CARD_BG);
  doc.fillColor(COLOR_TERRACOTTA).font('Helvetica-Bold').fontSize(6).text('SHINERVA AI', 362, 122);
  doc.rect(495, 120, 30, 10).fill(COLOR_TERRACOTTA);
  doc.fillColor(COLOR_WHITE).font('Helvetica-Bold').fontSize(5).text('MASUK', 497, 123, { width: 26, align: 'center' });
  
  doc.fillColor(COLOR_WHITE).font('Helvetica-Bold').fontSize(8).text('Create Natural Indonesian', 365, 145);
  doc.fillColor(COLOR_TERRACOTTA).font('Helvetica-Bold').fontSize(8).text('AI Voices in Seconds', 365, 155);

  doc.rect(365, 175, 160, 75).fill(COLOR_WHITE).strokeColor(COLOR_BORDER).stroke();
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(6.5).text('Tulis naskah teks Anda di sini...', 372, 182);
  
  doc.rect(365, 255, 85, 16).fill(COLOR_CARD_BG).strokeColor(COLOR_BORDER).stroke();
  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(6).text('🗣  Sambas (News)', 370, 260);
  
  doc.rect(365, 276, 160, 18).fill(COLOR_TERRACOTTA);
  doc.fillColor(COLOR_WHITE).font('Helvetica-Bold').fontSize(7).text('✨ Hasilkan Suara (Generate)', 365, 282, { width: 160, align: 'center' });

  // 2. MOCKUP: Pricing Section & Checkout (Steps 5 & 6)
  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(8.5).text('MOCKUP SCREEN: PRICING PLANS & CHECKOUT', 355, 335);

  doc.rect(355, 350, 180, 200).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(8).text('Pilih Paket Kredit Suara', 355, 360, { width: 180, align: 'center' });
  
  doc.rect(365, 375, 75, 75).fill(COLOR_WHITE).strokeColor(COLOR_BORDER).stroke();
  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(7).text('FREE', 370, 380);
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(6).text('Rp 0', 370, 390);
  doc.fillColor(COLOR_DARK).font('Helvetica').fontSize(5.5).text('10,000 Kredit', 370, 400);
  doc.rect(370, 425, 65, 12).fill(COLOR_CARD_BG);
  doc.fillColor(COLOR_MUTED).font('Helvetica-Bold').fontSize(5).text('Mulai Gratis', 370, 429, { width: 65, align: 'center' });

  doc.rect(450, 375, 75, 75).fill(COLOR_WHITE).strokeColor(COLOR_TERRACOTTA).stroke();
  doc.fillColor(COLOR_TERRACOTTA).font('Helvetica-Bold').fontSize(7).text('CREATOR', 455, 380);
  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(6.5).text('Rp 99.000', 455, 390);
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(5.5).text('200,000 Kredit', 455, 400);
  
  doc.rect(470, 370, 35, 7).fill(COLOR_TERRACOTTA);
  doc.fillColor(COLOR_WHITE).font('Helvetica-Bold').fontSize(4.5).text('POPULAR', 470, 371.5, { width: 35, align: 'center' });
  
  doc.rect(455, 425, 65, 12).fill(COLOR_TERRACOTTA);
  doc.fillColor(COLOR_WHITE).font('Helvetica-Bold').fontSize(5).text('BELI SEKARANG', 455, 429, { width: 65, align: 'center' });

  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(6).text('DANA · GOPAY · OVO · QRIS · KARTU KREDIT', 355, 470, { width: 180, align: 'center' });

  doc.rect(365, 485, 160, 55).fill(COLOR_CARD_BG).strokeColor(COLOR_BORDER).stroke();
  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(6.5).text('Ringkasan Pembayaran', 372, 492);
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(5.5).text('Layanan: Shinerva Creator Plan (Digital SaaS)', 372, 502);
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(5.5).text('Total Harga: Rp 99.000', 372, 510);
  
  doc.rect(440, 520, 80, 14).fill(COLOR_TERRACOTTA);
  doc.fillColor(COLOR_WHITE).font('Helvetica-Bold').fontSize(6).text('Bayar via Midtrans →', 440, 524, { width: 80, align: 'center' });


  // -------------------------------------------------------------
  // PAGE 3: METHOD CHANNELS DETAILED FLOW
  // -------------------------------------------------------------
  doc.addPage();
  doc.rect(30, 30, 535, 782).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
  drawHeaderFooter(3, TOTAL_PAGES);

  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('SALURAN PEMBAYARAN & INTEGRASI SNAP INTERFACE', 50, 60);
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1.5).moveTo(50, 78).lineTo(150, 78).stroke();

  doc.fillColor(COLOR_MUTED)
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text('Available payment methods depend on Midtrans configuration and merchant activation.', 50, 90);

  // We describe the 4 main channels enabled on Snap
  const channels = [
    {
      code: 'A',
      title: 'BANK TRANSFER / VIRTUAL ACCOUNT',
      desc: 'Pelanggan membayar via transfer Virtual Account. Konfirmasi terkirim otomatis.',
      steps: ['Pilih Bank (BCA/Mandiri/BNI/BRI)', 'Dapatkan No. VA & Cara Bayar', 'Lakukan Transfer Bank', 'Verifikasi settlement real-time']
    },
    {
      code: 'B',
      title: 'E-WALLET (SHOPEEPAY, GOPAY, OVO, DANA)',
      desc: 'Pembayaran instan melalui saldo dompet digital di browser/aplikasi mobile.',
      steps: ['Pilih E-Wallet (ShopeePay/Gopay)', 'Otorisasi PIN / Scan Sidik Jari', 'Sistem memotong saldo dompet', 'Auto-redirect ke portal Shinerva']
    },
    {
      code: 'C',
      title: 'QRIS (UNIVERSAL QR CODE)',
      desc: 'Mendukung pembayaran scan QR Code standar Bank Indonesia (BI).',
      steps: ['Pilih QRIS pada Layar Snap', 'Scan QR Code yang Tampil di Layar', 'Konfirmasi Nominal dan Bayar', 'Deteksi sukses instan oleh server']
    },
    {
      code: 'D',
      title: 'KARTU KREDIT / DEBIT (VISA, MASTERCARD)',
      desc: 'Pembayaran internasional dan domestik menggunakan kartu bank utama.',
      steps: ['Masukkan Detail Kartu & CVV', 'Input Kode OTP (3D-Secure SMS)', 'Otorisasi limit & validitas bank', 'Konfirmasi transaksi berhasil']
    }
  ];

  let chanY = 108;
  channels.forEach(ch => {
    doc.rect(50, chanY, 280, 150).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
    doc.rect(50, chanY, 280, 20).fill(COLOR_DARK);
    
    doc.fillColor(COLOR_TERRACOTTA)
       .font('Helvetica-Bold')
       .fontSize(8)
       .text(`SALURAN ${ch.code}:`, 60, chanY + 6);
       
    doc.fillColor(COLOR_WHITE)
       .font('Helvetica-Bold')
       .fontSize(8)
       .text(ch.title, 115, chanY + 6);

    doc.fillColor(COLOR_MUTED)
       .font('Helvetica')
       .fontSize(7.5)
       .text(ch.desc, 60, chanY + 26, { width: 260 });

    let subStepY = chanY + 46;
    ch.steps.forEach((step, idx) => {
      doc.fillColor(COLOR_TERRACOTTA).font('Helvetica-Bold').fontSize(7).text(`Langkah ${idx + 1}:`, 60, subStepY);
      doc.fillColor(COLOR_DARK).font('Helvetica').fontSize(7.5).text(step, 110, subStepY, { width: 210 });
      subStepY += 23;
    });

    chanY += 160;
  });

  // -------------------------------------------------------------
  // LAYOUT SCHEMATIC PLACEHOLDERS / WIREFRAMES (Right Side of Page 3)
  // -------------------------------------------------------------
  doc.strokeColor(COLOR_BORDER).lineWidth(0.5).moveTo(345, 95).lineTo(345, 780).stroke();

  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(8.5).text('MOCKUP SCREEN: MIDTRANS SNAP PAYMENT INTERFACE', 355, 100);

  doc.rect(355, 115, 180, 310).fill(COLOR_CARD_BG).strokeColor(COLOR_BORDER).stroke();
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(5).text('[Dashboard Shinerva Blur/Overlay Background]', 360, 125, { width: 170, align: 'center' });
  doc.rect(365, 140, 160, 45).fill(COLOR_WHITE).strokeColor(COLOR_BORDER).stroke(); // Studio blurred

  doc.rect(370, 160, 150, 245).fill(COLOR_LIGHT_BG).strokeColor(COLOR_TERRACOTTA).lineWidth(1.5).stroke();
  doc.rect(370, 160, 150, 30).fill(COLOR_DARK); // Snap Header
  doc.fillColor(COLOR_WHITE).font('Helvetica-Bold').fontSize(8).text('SHINERVA PAYMENT', 375, 171);
  doc.fillColor(COLOR_TERRACOTTA).font('Helvetica').fontSize(6).text('Total: Rp 99.000', 470, 172);

  doc.rect(375, 195, 140, 30).fill(COLOR_WHITE).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();
  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(5.5).text('Creator Plan (200k Credits)', 380, 200);
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(5).text('Order ID: SHN-1719280918', 380, 210);

  doc.fillColor(COLOR_MUTED).font('Helvetica-Bold').fontSize(6).text('Pilih Metode Pembayaran', 375, 235);

  const snapMethods = [
    { name: 'Bank Transfer / VA', icon: '🏦' },
    { name: 'GoPay / ShopeePay', icon: '📱' },
    { name: 'QRIS Code', icon: '🔳' },
    { name: 'Credit/Debit Card', icon: '💳' }
  ];

  let methodY = 245;
  snapMethods.forEach(method => {
    doc.rect(375, methodY, 140, 23).fill(COLOR_WHITE).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();
    doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(6.5).text(`${method.icon}  ${method.name}`, 382, methodY + 7);
    doc.fillColor(COLOR_TERRACOTTA).font('Helvetica-Bold').fontSize(6).text('>', 503, methodY + 7);
    methodY += 28;
  });

  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(5).text('🔒 Pembayaran diproses aman oleh Midtrans', 370, 390, { width: 150, align: 'center' });

  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(7.5).text('Catatan Penilaian:', 355, 445);
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(7).text('Antarmuka Midtrans Snap di atas muncul langsung sebagai pop-up (layanan terintegrasi) di situs Shinerva.id, sehingga pelanggan tidak perlu keluar dari situs untuk menyelesaikan pembayaran.', 355, 458, { width: 180, align: 'justify', lineGap: 2 });


  // -------------------------------------------------------------
  // PAGE 4: BUSINESS MODEL & CREDIT METRICS (Objective 4)
  // -------------------------------------------------------------
  doc.addPage();
  doc.rect(30, 30, 535, 782).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
  drawHeaderFooter(4, TOTAL_PAGES);

  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('MODEL BISNIS & METRIK KONSUMSI LAYANAN (SAAS)', 50, 60);
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1.5).moveTo(50, 78).lineTo(150, 78).stroke();

  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('1. PROFIL BISNIS & STRUKTUR PRODUK', 50, 95);
     
  doc.fillColor(COLOR_MUTED)
     .font('Helvetica')
     .fontSize(9)
     .text('Shinerva AI adalah platform Software-as-a-Service (SaaS) yang berfokus pada teknologi sintesis suara (Text-to-Speech) Bahasa Indonesia yang natural dan bernuansa emosi manusiawi. Layanan kami diperuntukkan bagi konten kreator modern, pengisi suara digital, penerbit buku audio (audiobooks), serta integrasi bisnis.', 50, 110, { width: 495, align: 'justify', lineGap: 2 });

  // Draw pricing structure grid
  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text('Struktur Paket Harga (Voice Credit Plans)', 50, 160);

  const pricePlans = [
    { name: 'Gratis (Trial)', price: 'Rp 0', credits: '10.000 Karakter', duration: '30 Hari', usage: 'Uji coba seluruh suara AI standard' },
    { name: 'Creator', price: 'Rp 99.000 / bln', credits: '200.000 Karakter', duration: '30 Hari', usage: 'Generasi premium, bebas watermark' },
    { name: 'Pro', price: 'Rp 199.000 / bln', credits: '600.000 Karakter', duration: '30 Hari', usage: 'Prioritas pemrosesan suara AI Studio' },
    { name: 'Business', price: 'Custom / Kontrak', credits: 'Sesuai Kebutuhan', duration: 'Fleksibel', usage: 'Akses API penuh untuk korporasi' }
  ];

  let tableY = 180;
  // Table headers
  doc.rect(50, tableY, 495, 20).fill(COLOR_DARK);
  doc.fillColor(COLOR_WHITE).font('Helvetica-Bold').fontSize(8.5);
  doc.text('Nama Paket', 60, tableY + 6);
  doc.text('Harga', 140, tableY + 6);
  doc.text('Kredit Didapat', 230, tableY + 6);
  doc.text('Masa Aktif', 330, tableY + 6);
  doc.text('Deskripsi Penggunaan', 410, tableY + 6);

  tableY += 20;
  pricePlans.forEach(plan => {
    doc.rect(50, tableY, 495, 22).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
    
    doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(8);
    doc.text(plan.name, 60, tableY + 7);
    
    doc.font('Helvetica');
    doc.text(plan.price, 140, tableY + 7);
    doc.text(plan.credits, 230, tableY + 7);
    doc.text(plan.duration, 330, tableY + 7);
    doc.text(plan.usage, 410, tableY + 7, { width: 130 });
    
    tableY += 22;
  });

  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('2. MEKANISME KONSUMSI KREDIT (USAGE RULES)', 50, 290);

  doc.fillColor(COLOR_MUTED)
     .font('Helvetica')
     .fontSize(9)
     .text('Konsumsi kuota layanan (kredit karakter) dihitung berdasarkan jumlah karakter teks yang diproses oleh kecerdasan buatan (AI) menjadi gelombang suara (WAV/MP3). Terdapat perbedaan beban kredit berdasarkan teknologi mesin suara yang dipilih pengguna:', 50, 305, { width: 495, align: 'justify', lineGap: 2 });

  // Cost rules box
  doc.rect(50, 350, 495, 120).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
  
  const rules = [
    { title: 'Mesin Suara Standard (Standard Voice)', cost: '1 Karakter Teks = 1 Kredit Suara', desc: 'Sintesis suara digital standar yang handal untuk kebutuhan narasi dasar.' },
    { title: 'Mesin Suara Wavenet (Wavenet Voice)', cost: '1 Karakter Teks = 1 Kredit Suara', desc: 'Pemrosesan berbasis neural network yang lebih halus dan berintonasi natural.' },
    { title: 'Mesin Suara Premium (Studio Voice)', cost: '1 Karakter Teks = 10 Kredit Suara', desc: 'Sintesis audio cinematic resolusi tinggi dengan tekstur emosi, napas, dan intonasi manusiawi. Memerlukan resource GPU/komputasi cloud 10x lebih besar.' }
  ];

  let ruleY = 360;
  rules.forEach(rule => {
    doc.fillColor(COLOR_TERRACOTTA).font('Helvetica-Bold').fontSize(8.5).text(rule.title, 65, ruleY);
    doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(8.5).text(rule.cost, 260, ruleY);
    doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(8).text(rule.desc, 65, ruleY + 12, { width: 460 });
    ruleY += 34;
  });

  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('3. TRANSPARANSI PENGIRIMAN DIGITAL & REFUND', 50, 495);
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1).moveTo(50, 510).lineTo(150, 510).stroke();

  doc.rect(50, 520, 495, 120).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
  
  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(9).text('Tanpa Pengiriman Fisik (No Physical Delivery)', 65, 532);
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(8).text('Seluruh transaksi diproses secara digital. Saat status settlement dikonfirmasi oleh sistem Midtrans, backend Shinerva AI secara otomatis mengaktifkan credits/subscription ke akun user saat itu juga.', 65, 544, { width: 465 });

  doc.fillColor(COLOR_DARK).font('Helvetica-Bold').fontSize(9).text('Pengembalian Dana Kasus per Kasus (Case-by-Case Refund)', 65, 580);
  doc.fillColor(COLOR_MUTED).font('Helvetica').fontSize(8).text('Karena kredensial kredit bersifat digital dan dapat langsung digunakan, dana yang sudah dibelanjakan tidak dapat dikembalikan. Namun, pengembalian dana dapat dievaluasi secara adil dalam kasus khusus (misal: kredit belum terpakai sama sekali dalam 7 hari dari pembelian) dengan menghubungi support@shinerva.id.', 65, 592, { width: 465 });


  // -------------------------------------------------------------
  // PAGE 5: BACKEND VERIFICATION & LIFECYCLE DIAGRAM
  // -------------------------------------------------------------
  doc.addPage();
  doc.rect(30, 30, 535, 782).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
  drawHeaderFooter(5, TOTAL_PAGES);

  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('VERIFIKASI SISTEM (WEBHOOK) & LIFECYCLE TRANSAKSI', 50, 60);
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1.5).moveTo(50, 78).lineTo(150, 78).stroke();

  // Step 9 - 11 Detail
  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('PROSES NOTIFIKASI BACKEND (WEBHOOK FLOW)', 50, 95);

  const backendSteps = [
    { step: 'STEP 09', title: 'Midtrans Webhook / Notifikasi', desc: 'Setelah pelanggan membayar, Midtrans HTTP POST notifikasi callback ke server Shinerva di /api/payment/webhook secara asinkron.' },
    { step: 'STEP 10', title: 'Verifikasi Keamanan Server', desc: 'Server Shinerva memproses tanda tangan keamanan (Signature Key), mencocokkan Order ID, memvalidasi Status Transaksi (settlement), dan memeriksa nominal transfer.' },
    { step: 'STEP 11', title: 'Aktivasi Karakter & Layanan', desc: 'After successful payment confirmation from Midtrans, Shinerva AI automatically activates credits/subscription. Server mengubah status pembayaran jadi \'success\' di Firestore database dan menambah kuota.' }
  ];

  let backY = 115;
  backendSteps.forEach(bs => {
    doc.rect(50, backY, 495, 52).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
    
    doc.fillColor(COLOR_TERRACOTTA)
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(bs.step, 65, backY + 12);
       
    doc.fillColor(COLOR_DARK)
       .font('Helvetica-Bold')
       .fontSize(10)
       .text(bs.title, 130, backY + 12);
       
    doc.fillColor(COLOR_MUTED)
       .font('Helvetica')
       .fontSize(8.5)
       .text(bs.desc, 130, backY + 26, { width: 400 });
       
    backY += 60;
  });

  // Visual Lifecycle Diagram
  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('DIAGRAM SIKLUS HIDUP TRANSAKSI (LIFECYCLE DIAGRAM)', 50, 315);
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1).moveTo(50, 330).lineTo(150, 330).stroke();

  // Draw a grid representing the flowchart
  const flowNodes = [
    { id: 1, label: 'Visitor', x: 50, y: 360 },
    { id: 2, label: 'Landing Page', x: 200, y: 360 },
    { id: 3, label: 'Register/Login', x: 350, y: 360 },
    { id: 4, label: 'Select Plan', x: 350, y: 440 },
    { id: 5, label: 'Checkout', x: 200, y: 440 },
    { id: 6, label: 'Midtrans Snap', x: 50, y: 440 },
    { id: 7, label: 'Choose Method', x: 50, y: 520 },
    { id: 8, label: 'Payment Success', x: 200, y: 520 },
    { id: 9, label: 'Webhook Verify', x: 350, y: 520 },
    { id: 10, label: 'Credits Activated', x: 350, y: 600 }
  ];

  // Draw nodes
  flowNodes.forEach(node => {
    const isEnd = node.id === 10;
    const isStart = node.id === 1;
    let bg = COLOR_CARD_BG;
    let borderCol = COLOR_BORDER;
    let textCol = COLOR_DARK;
    
    if (isEnd) {
      bg = COLOR_TERRACOTTA;
      borderCol = COLOR_TERRACOTTA;
      textCol = COLOR_WHITE;
    } else if (isStart) {
      bg = COLOR_DARK;
      borderCol = COLOR_DARK;
      textCol = COLOR_WHITE;
    }
    
    doc.rect(node.x, node.y, 90, 35).fill(bg).strokeColor(borderCol).stroke();
    
    doc.fillColor(textCol)
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(node.label, node.x, node.y + 13, { width: 90, align: 'center' });
  });

  // Draw flow arrows
  // Node 1 -> 2
  drawArrow(140, 377, 200, 377);
  // Node 2 -> 3
  drawArrow(290, 377, 350, 377);
  // Node 3 -> 4
  drawArrow(395, 395, 395, 440);
  // Node 4 -> 5
  drawArrow(350, 457, 290, 457);
  // Node 5 -> 6
  drawArrow(200, 457, 140, 457);
  // Node 6 -> 7
  drawArrow(95, 475, 95, 520);
  // Node 7 -> 8
  drawArrow(140, 537, 200, 537);
  // Node 8 -> 9
  drawArrow(290, 537, 350, 537);
  // Node 9 -> 10
  drawArrow(395, 555, 395, 600);

  // Guarantee block
  doc.rect(50, 670, 495, 80).fill(COLOR_LIGHT_BG).strokeColor(COLOR_SUCCESS).lineWidth(1).stroke();
  doc.fillColor(COLOR_SUCCESS)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text('JAMINAN OPERASIONAL AKTIVASI SISTEM (REAL-TIME)', 65, 683);
     
  doc.fillColor(COLOR_DARK)
     .font('Helvetica')
     .fontSize(8.5)
     .text('Sistem Shinerva AI memisahkan (isolated) modul transaksi finansial dari modul pemrosesan AI untuk menjaga stabilitas transaksi. Notifikasi webhook (settlement) yang diterima secara asinkron dari Midtrans segera diproses dan memicu penambahan saldo kredit/kuota secara real-time. Jika status settlement terkonfirmasi, kuota pelanggan langsung aktif tanpa perlu intervensi manual.', 65, 698, { width: 465, align: 'justify', lineGap: 3 });

  // Finish document
  doc.end();

  console.log(`[PDF Generator] PDF created successfully at: ${outputPath}`);
}

createPaymentFlowPDFFinal();
