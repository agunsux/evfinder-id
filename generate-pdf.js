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

function createPaymentFlowPDF() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 50, right: 50 }
  });

  const outputPath = path.resolve('Shinerva_AI_Midtrans_Payment_Flow.pdf');
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

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
     .text('Dokumen Kepatuhan & Integrasi Gateway Pembayaran', 75, 155);

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
     .text('KEPATUHAN LAYANAN (COMPLIANCE NOTES)', 50, 430);
     
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1).moveTo(50, 445).lineTo(150, 445).stroke();

  doc.rect(50, 460, 495, 160).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
  
  const compliancePoints = [
    { title: 'Pengiriman Digital Instan:', desc: 'Shinerva AI adalah layanan Text-to-Speech berbasis Cloud. Tidak ada pengiriman fisik. Setelah pembayaran berhasil diverifikasi oleh Midtrans, sistem kami secara otomatis menambahkan kredit karakter (kredit suara) langsung ke database akun pengguna secara real-time.' },
    { title: 'Kebijakan Pengembalian Dana:', desc: 'Pengguna diberikan akses gratis 10.000 karakter saat pendaftaran untuk menguji kualitas suara AI. Pembelian bersifat non-refundable (tidak dapat dikembalikan) jika kredit telah terpakai sebagian atau seluruhnya.' },
    { title: 'Keamanan Transaksi & Data:', desc: 'Semua informasi kartu kredit, kredensial pembayaran e-wallet, dan instruksi transfer bank dienkripsi secara penuh dan ditangani secara aman oleh sistem Midtrans Snap PCI-DSS compliant. Shinerva AI tidak menyimpan data sensitif kartu.' }
  ];

  let compY = 475;
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
       .text(point.desc, 80, compY + 13, { width: 440, align: 'justify', lineGap: 2 });
       
    compY += 46;
  });

  // Footer bar on first page
  drawHeaderFooter(1, 4);

  // -------------------------------------------------------------
  // PAGE 2: CUSTOMER JOURNEY (STEP 1 - 8)
  // -------------------------------------------------------------
  doc.addPage();
  doc.rect(30, 30, 535, 782).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
  drawHeaderFooter(2, 4);

  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('LANGKAH JOURNEY PELANGGAN & PROSES PEMBAYARAN', 50, 60);
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1.5).moveTo(50, 78).lineTo(150, 78).stroke();

  // Timeline / Workflow UI drawing
  const steps = [
    { step: 'STEP 01', title: 'Kunjungan Website', desc: 'Pelanggan mengunjungi situs resmi di https://shinerva.id melalui browser desktop atau mobile.' },
    { step: 'STEP 02', title: 'Review Layanan & Harga', desc: 'Pelanggan meninjau fitur AI voice generation, daftar suara, paket harga, serta kebijakan layanan.' },
    { step: 'STEP 03', title: 'Registrasi / Log In', desc: 'Pelanggan membuat akun baru atau masuk menggunakan Google Authentication atau Email Magic Link.' },
    { step: 'STEP 04', title: 'Masuk Dashboard', desc: 'Sistem menyambut pelanggan dan membuka akses penuh ke dashboard studio voice generator.' },
    { step: 'STEP 05', title: 'Pilih Paket Kredit', desc: 'Pelanggan memilih paket subscription/top-up kredit suara: Creator (200k kredit) atau Pro (600k kredit).' },
    { step: 'STEP 06', title: 'Klik Beli / Checkout', desc: 'Pelanggan menekan tombol "Beli Sekarang". Sistem mengumpulkan data pengguna dan rincian transaksi.' },
    { step: 'STEP 07', title: 'Pembuatan Transaksi', desc: 'Server Shinerva melakukan API POST ke /api/payment/create. Midtrans menerbitkan Token Snap unik.' },
    { step: 'STEP 08', title: 'Redirect ke Midtrans Snap', desc: 'Dashboard membuka widget/popup Midtrans Snap. Pelanggan dialihkan ke laman aman untuk membayar.' }
  ];

  let stepY = 100;
  steps.forEach((s, idx) => {
    // Draw timeline vertical line
    if (idx < steps.length - 1) {
      doc.save();
      doc.strokeColor(COLOR_BORDER).lineWidth(1.5);
      doc.moveTo(85, stepY + 35).lineTo(85, stepY + 70).stroke();
      doc.restore();
    }

    // Step circle/indicator
    doc.save();
    doc.fillColor(COLOR_TERRACOTTA);
    doc.circle(85, stepY + 20, 15).fill();
    doc.fillColor(COLOR_WHITE)
       .font('Helvetica-Bold')
       .fontSize(8)
       .text((idx + 1).toString().padStart(2, '0'), 79, stepY + 16);
    doc.restore();

    // Step Details Card
    doc.rect(115, stepY, 415, 42).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
    
    doc.fillColor(COLOR_TERRACOTTA)
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(s.step, 130, stepY + 8);
       
    doc.fillColor(COLOR_DARK)
       .font('Helvetica-Bold')
       .fontSize(10)
       .text(s.title, 185, stepY + 8);
       
    doc.fillColor(COLOR_MUTED)
       .font('Helvetica')
       .fontSize(8)
       .text(s.desc, 130, stepY + 22, { width: 385 });

    stepY += 56;
  });

  // -------------------------------------------------------------
  // PAGE 3: METHOD CHANNELS DETAILED FLOW
  // -------------------------------------------------------------
  doc.addPage();
  doc.rect(30, 30, 535, 782).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
  drawHeaderFooter(3, 4);

  doc.fillColor(COLOR_DARK)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('SALURAN & ALUR PEMBAYARAN YANG DIAKTIFKAN', 50, 60);
  doc.strokeColor(COLOR_TERRACOTTA).lineWidth(1.5).moveTo(50, 78).lineTo(150, 78).stroke();

  // We describe the 4 main channels enabled on Snap
  const channels = [
    {
      code: 'A',
      title: 'BANK TRANSFER / VIRTUAL ACCOUNT',
      desc: 'Memungkinkan pelanggan membayar via transfer ATM, Mobile Banking, atau Internet Banking.',
      steps: ['Pilih Bank (BCA, Mandiri, BNI, BRI, Permata)', 'Dapatkan Nomor Virtual Account & Cara Bayar', 'Lakukan Transfer melalui ATM / M-Banking', 'Konfirmasi Pembayaran Otomatis Real-Time']
    },
    {
      code: 'B',
      title: 'E-WALLET (SHOPEEPAY, GOPAY, OVO, DANA)',
      desc: 'Pembayaran instan menggunakan saldo dompet digital favorit pelanggan.',
      steps: ['Pilih Dompet Digital (Gopay / ShopeePay / OVO / DANA)', 'Otorisasi Transaksi (Input PIN / Scan di Aplikasi E-Wallet)', 'Sistem Midtrans Snap Memproses Verifikasi Saldo', 'Pembayaran Selesai dan Halaman Auto-Redirect']
    },
    {
      code: 'C',
      title: 'QRIS (GOPAY, SHOPEEPAY, LINKAJA, DLL)',
      desc: 'Mendukung pembayaran universal QR Code standar Bank Indonesia.',
      steps: ['Pilih QRIS pada Layar Snap', 'Scan QR Code yang Tampil dengan Aplikasi Dompet Digital', 'Konfirmasi Nominal dan Bayar di Aplikasi Mobile', 'Sistem Otomatis Mendeteksi Pembayaran Berhasil']
    },
    {
      code: 'D',
      title: 'KARTU KREDIT / DEBIT (VISA, MASTERCARD)',
      desc: 'Pembayaran internasional dan domestik menggunakan kartu bank berlogo utama.',
      steps: ['Masukkan Nomor Kartu, Exp Date, dan CVV', 'Otorisasi 3D-Secure (Input OTP dari SMS Bank Penerbit)', 'Verifikasi Limit & Validasi Kartu oleh Midtrans', 'Transaksi Disetujui, Notifikasi Sukses']
    }
  ];

  let chanY = 95;
  channels.forEach(ch => {
    // Channel block container
    doc.rect(50, chanY, 495, 120).fill(COLOR_LIGHT_BG).strokeColor(COLOR_BORDER).stroke();
    
    // Header block
    doc.rect(50, chanY, 495, 24).fill(COLOR_DARK);
    
    doc.fillColor(COLOR_TERRACOTTA)
       .font('Helvetica-Bold')
       .fontSize(10)
       .text(`SALURAN ${ch.code}:`, 65, chanY + 7);
       
    doc.fillColor(COLOR_WHITE)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(ch.title, 140, chanY + 7);

    // Desc
    doc.fillColor(COLOR_MUTED)
       .font('Helvetica-Oblique')
       .fontSize(8.5)
       .text(ch.desc, 65, chanY + 32, { width: 465 });

    // Step Flow Visual
    let stepX = 65;
    ch.steps.forEach((step, idx) => {
      // Step Box
      doc.rect(stepX, chanY + 54, 98, 52).fill(COLOR_CARD_BG).strokeColor(COLOR_BORDER).stroke();
      
      doc.fillColor(COLOR_TERRACOTTA)
         .font('Helvetica-Bold')
         .fontSize(7)
         .text(`LANGKAH ${idx + 1}`, stepX + 5, chanY + 59);
         
      doc.fillColor(COLOR_DARK)
         .font('Helvetica')
         .fontSize(7.5)
         .text(step, stepX + 5, chanY + 71, { width: 88, lineGap: 1.5 });

      // Draw arrow to next step
      if (idx < ch.steps.length - 1) {
        drawArrow(stepX + 98 + 1, chanY + 80, stepX + 98 + 6, chanY + 80, COLOR_TERRACOTTA, 1);
        stepX += 105;
      } else {
        stepX += 98;
      }
    });

    chanY += 135;
  });

  // -------------------------------------------------------------
  // PAGE 4: BACKEND VERIFICATION & LIFECYCLE DIAGRAM
  // -------------------------------------------------------------
  doc.addPage();
  doc.rect(30, 30, 535, 782).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
  drawHeaderFooter(4, 4);

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
    { step: 'STEP 11', title: 'Aktivasi Karakter & Layanan', desc: 'Jika valid, server mengubah status pembayaran jadi \'success\', memperbarui kuota kredit suara pelanggan di Firestore database, dan membuka akses tier berbayar.' }
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
  const nodeWidth = 90;
  const nodeHeight = 35;

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
    // Fill node box
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
    
    doc.rect(node.x, node.y, nodeWidth, nodeHeight).fill(bg).strokeColor(borderCol).stroke();
    
    // Label
    doc.fillColor(textCol)
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(node.label, node.x, node.y + 13, { width: nodeWidth, align: 'center' });
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
     .text('PERNYATAAN JAMINAN OPERASIONAL & LAYANAN', 65, 683);
     
  doc.fillColor(COLOR_DARK)
     .font('Helvetica')
     .fontSize(8.5)
     .text('Shinerva AI menjamin bahwa seluruh alur transaksi di atas sepenuhnya terpisah (isolated) dari pemrosesan internal model kecerdasan buatan (Gemini/Cloud TTS). Gangguan teknis pada layanan sintesis suara tidak akan menghentikan transaksi atau merusak pencatatan pembayaran Midtrans. Transaksi pelanggan diproses secara prioritas dengan sistem pencatatan redundan di Firestore.', 65, 698, { width: 465, align: 'justify', lineGap: 3 });

  // Finish document
  doc.end();

  console.log(`[PDF Generator] PDF created successfully at: ${outputPath}`);
}

createPaymentFlowPDF();
