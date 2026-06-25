import React from 'react';
import { BookOpen } from 'lucide-react';

const PolicyPage = () => {
  const path = window.location.pathname;
  let title = "Digital Service Policy";
  let content = null;

  if (path.includes('privacy')) {
    title = "Kebijakan Privasi (Privacy Policy)";
    content = (
      <>
        <p className="mb-6 text-text-muted leading-relaxed">
          Terakhir Diperbarui: 25 Juni 2026
        </p>
        <p className="mb-4 text-text-muted leading-relaxed">
          Di Shinerva AI (https://shinerva.id), kami sangat menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan layanan Text-to-Speech kami.
        </p>
        
        <h3 className="text-xl font-bold mt-6 mb-2 text-text">1. Informasi yang Kami Kumpulkan</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Kami mengumpulkan informasi pendaftaran seperti nama, alamat email, dan foto profil Anda melalui otentikasi Google atau Email Magic Link. Kami juga mengumpulkan naskah teks yang Anda masukkan untuk diproses oleh kecerdasan buatan (AI) kami menjadi audio, serta data transaksi pembayaran yang diproses secara aman oleh gateway pihak ketiga (Midtrans).
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">2. Bagaimana Kami Menggunakan Data</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Informasi pribadi Anda digunakan eksklusif untuk:
        </p>
        <ul className="list-disc pl-6 mb-4 text-text-muted space-y-1">
          <li>Menyediakan layanan sintesis suara Text-to-Speech.</li>
          <li>Mengelola akun pengguna dan mencatat riwayat sisa kredit karakter suara Anda.</li>
          <li>Memproses transaksi pembayaran langganan atau top-up kredit secara aman melalui Midtrans.</li>
          <li>Mengirimkan informasi pembaruan penting mengenai akun atau sistem kami.</li>
        </ul>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">3. Keamanan Data & Transaksi Finansial</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Seluruh data transaksi, termasuk instruksi pembayaran, nomor kartu, atau otorisasi e-wallet, dienkripsi dan ditangani sepenuhnya secara aman oleh gateway berlisensi Midtrans. Shinerva AI tidak pernah menyimpan atau memproses data kartu kredit Anda secara langsung. Data naskah dan hasil suara Anda disimpan dengan aman menggunakan infrastruktur cloud yang terproteksi.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">4. Hak Pengguna</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Anda berhak melihat, memperbarui, atau meminta penghapusan informasi pribadi Anda dari sistem kami kapan saja dengan menghubungi kami di hello.shinerva@gmail.com.
        </p>
      </>
    );
  } else if (path.includes('terms')) {
    title = "Syarat & Ketentuan (Terms of Service)";
    content = (
      <>
        <p className="mb-6 text-text-muted leading-relaxed">
          Terakhir Diperbarui: 25 Juni 2026
        </p>
        <p className="mb-4 text-text-muted leading-relaxed">
          Selamat datang di Shinerva AI (https://shinerva.id). Dengan mendaftar, mengakses, atau menggunakan platform kami, Anda setuju untuk terikat secara hukum oleh Syarat dan Ketentuan berikut.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">1. Ketentuan Akun Pengguna</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Anda wajib menjaga kerahasiaan kredensial login akun Anda. Anda bertanggung jawab penuh atas segala aktivitas yang terjadi di bawah akun Anda. Satu akun hanya diperbolehkan digunakan oleh pemilik akun yang bersangkutan.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">2. Penggunaan Layanan yang Diizinkan</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Anda setuju untuk menggunakan layanan Text-to-Speech Shinerva AI hanya untuk tujuan legal. Anda dilarang keras menghasilkan audio yang mengandung unsur penghinaan, fitnah, ujaran kebencian, pelecehan, pelanggaran hak cipta, atau konten ilegal lainnya. Pelanggaran terhadap ketentuan ini akan mengakibatkan pembekuan akun secara permanen tanpa kompensasi apa pun.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">3. Ketentuan Kredit Suara & Lisensi</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Pembelian paket langganan memberikan Anda sejumlah kredit karakter suara dengan masa aktif 30 hari. Kredit akan dipotong secara real-time berdasarkan jumlah karakter teks yang diubah menjadi suara. Pengguna memegang hak cipta penuh atas file audio yang berhasil dihasilkan untuk tujuan komersial maupun pribadi.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">4. Batasan Tanggung Jawab</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Shinerva AI menyediakan platform sedia adanya ("as is"). Kami berusaha keras menjaga keandalan sistem kami, namun tidak memberikan jaminan bahwa layanan akan sepenuhnya bebas dari gangguan atau kesalahan teknis.
        </p>
      </>
    );
  } else if (path.includes('refund')) {
    title = "Kebijakan Pengembalian Dana (Refund Policy)";
    content = (
      <>
        <p className="mb-6 text-text-muted leading-relaxed">
          Terakhir Diperbarui: 25 Juni 2026
        </p>
        <p className="mb-4 text-text-muted leading-relaxed">
          Terima kasih telah berbelanja di Shinerva AI (https://shinerva.id). Harap baca kebijakan ini secara cermat.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">1. Kebijakan Produk Digital</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Shinerva AI menawarkan layanan Text-to-Speech berbasis SaaS digital. Setelah transaksi Anda dikonfirmasi oleh sistem pembayaran Midtrans, kuota kredit karakter suara akan langsung diaktifkan di akun Anda secara real-time. Karena produk kami bersifat digital dan langsung dapat digunakan, seluruh pembelian bersifat final dan tidak dapat dikembalikan (non-refundable).
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">2. Kuota Uji Coba Gratis</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Kami menyediakan kuota gratis sebesar 10.000 karakter bagi setiap pengguna baru untuk mencoba kualitas suara AI kami secara cuma-cuma sebelum memutuskan untuk membeli paket berbayar. Kami sangat menyarankan Anda memanfaatkan kuota gratis ini untuk memastikan layanan kami memenuhi kebutuhan Anda sebelum melakukan transaksi pembelian.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 text-text">3. Pengecualian & Masalah Teknis</h3>
        <p className="mb-4 text-text-muted leading-relaxed">
          Jika terjadi kegagalan sistem pengisian kredit setelah transaksi Anda berhasil dikonfirmasi oleh Midtrans, silakan kirimkan bukti pembayaran Anda ke hello.shinerva@gmail.com. Tim kami akan melakukan verifikasi manual dan menambahkan kredit yang belum masuk dalam waktu maksimal 1x24 jam.
        </p>
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 min-h-screen">
      <div className="bg-surface border border-surface2 p-6 sm:p-8 md:p-12 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <BookOpen className="w-8 h-8 text-terracotta" />
          <h1 className="text-3xl md:text-4xl font-black text-text">{title}</h1>
        </div>
        <div className="prose prose-invert max-w-none text-text">
          {content}
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
