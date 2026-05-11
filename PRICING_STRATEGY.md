# Strategi Penetapan Harga & Launching SHINERVA

Dokumen ini berisi keputusan final untuk strategi harga, penggunaan unit kredit, manajemen risiko, dan rencana peluncuran SHINERVA. 

## A. Tabel Pricing Final
Paket dirancang berdasarkan psikologi harga lokal. Konsep "Kredit" digunakan di mana **1 Kredit = 1 Karakter Standard/WaveNet**. Semua paket menggunakan estimasi "Video Pendek" (asumsi 1 menit = ~1.000 karakter) agar mudah dipahami user awam.

| Nama Paket | Harga | Kuota Kredit | Estimasi Audio/Video | Voice Tier & Akses | Margin Kotor |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FREE** | Rp 0 | 10.000 | 10 Video (10 menit) | Tier 1 (Standard/WaveNet) | N/A (Marketing) |
| **STARTER** | Rp 19.000 (Sekali) | 50.000 | 50 Video (50 menit) | Tier 1 & 2 (Valid 30 hari) | 81.5% |
| **KREATOR** | Rp 49.000 /bln | 150.000 | 150 Video (2.5 jam) | Tier 1, 2, 3 | 78.5% |
| **PRODUKTIF** | Rp 99.000 /bln | 400.000 | 400 Video (6.6 jam) | Tier 1, 2, 3 | 71.7% |
| **BISNIS** | Rp 249.000 /bln | 1.500.000 | 1.500 Video (25 jam) | Tier 1, 2, 3, 4 (Studio) | 57.8% |
| **ENTERPRISE**| Custom | Custom | Unlimited Scale | All Tiers + Custom Cloning | >60% (Custom) |

> ⚠️ **PERINGATAN BAHAYA:** Jangan pernah memberikan akses Studio Voice (Tier 4) pada paket PRODUKTIF (Rp99k) ke bawah, karena biayanya 40x lipat lebih mahal. Satu kesalahan rilis token bisa menyebabkan kerugian total.

## B. Sistem Multiplier & Voice Tiering
Untuk menjaga margin tanpa memusingkan user dengan harga per-model, kita menggunakan sistem multiplier. Saldo user dipotong berdasarkan bobot suara.

- **Tier 1: Standard & WaveNet**
  - Biaya API: Rp 0,07 / karakter
  - Multiplier: **1x** (1 karakter = 1 Kredit)
- **Tier 2: Neural2 (Kualitas sangat natural)**
  - Biaya API: Rp 0,28 / karakter
  - Multiplier: **4x** (1 karakter = 4 Kredit)
  - *Catatan: Tidak boleh dimasukkan di Starter tanpa multiplier.*
- **Tier 3: Chirp 3 HD (Kualitas siaran HD)**
  - Biaya API: Rp 0,525 / karakter
  - Multiplier: **8x** (1 karakter = 8 Kredit)
- **Tier 4: Studio (Ultra-realistis untuk Iklan/TV)**
  - Biaya API: Rp 2,8 / karakter
  - Multiplier: **40x** (1 karakter = 40 Kredit)

**Smart Routing Default:**
Secara default, paket FREE menggunakan profil Standard/WaveNet. Pada paket berlangganan, UI merekomendasikan Tier 2 (Neural2) namun mencantumkan label "⚡ Memotong 4x Kredit".

## C. Bonus Onboarding & Sistem Top-Up
**Bonus Onboarding:**
Setiap user baru mendapatkan **10.000 Kredit Gratis (setara 10 menit Standard)**.
Syarat:
- Hanya dapat menggunakan Tier 1 (Standard/WaveNet).
- Ada watermark halus (di akhir audio ada detik fade atau branding tipis, jika secara teknis memungkinkan, atau batasan tanpa opsi download file lossless).
- Akses UI Voice Studio ditiadakan/di-lock.

**Paket Top-Up (Sistem Isi Ulang):**
Jika kuota bulanan habis, user bisa membeli top-up tanpa upgrade tier.
1. **Paket Receh (Rp 25.000):** Dapat 60.000 Kredit. *(Bisa untuk 60 menit Standard atau 15 menit Neural2).*
2. **Paket Aman (Rp 75.000):** Dapat 200.000 Kredit. *(Bisa untuk 200 menit Standard atau 50 menit Neural2).*
3. **Paket Darurat Bisnis (Rp 150.000):** Dapat 500.000 Kredit. *(Setara 500 menit Standard atau 12,5 menit Studio).*

## D. Rate Limiting Sederhana (Pencegahan Abuse)
Sistem ini membatasi bot/spam, dan melindungi cash-flow:
- **Paket FREE:** Maks 3 request per menit. Maks 1 request simultan. Panjang naskah per request maks 5.000 karakter.
- **Paket STARTER & KREATOR:** Maks 10 request per menit. Maks 2 request simultan. Panjang naskah per request maks 10.000 karakter.
- **Paket PRODUKTIF & BISNIS:** Maks 30 request per menit. Maks 5 request simultan. Antrean prioritas di server.

## E. Referral Program (Mekanisme Viralitas)
Skema "Win-Win" CapCut-style:
- **Pengundang (Referrer):** Mendapatkan **Bonus 10.000 Kredit** yang setara dengan ~10 video Standard saat teman mendaftar pakai kode dan generate suara pertama kalinya. Maksimal mengajak 20 teman/bulan.
- **Bagi Teman (Referred):** Mendapatkan diskon 20% untuk pembelian paket STARTER atau KREATOR di bulan pertama (Rp19k jadi Rp15k; Rp49k jadi Rp39k) + Bonus 5.000 ekstra saat signup (Total 15.000 free kredit).

## F. Template & Workflow (3 Preset Awal)
Preset ini mempercepat user awam yang malas setting dari 0:
1. **Narasi Fakta Unik (60 Detik):** Kecepatan 1.25x, Pitch sedikit tinggi, jeda waktu sangat pendek (cocok untuk YT Shorts/TikTok yang fast-paced). Voice default: Bambang (Tier 1).
2. **Voice Over Produk Jualan (Tokopedia/Shopee):** Kecepatan 1.1x, aksen sangat ramah dan persuasif, ada jeda panjang di akhir kalimat promosi. Voice default: Ratna (Tier 1).
3. **Intro YouTube Cinematic (15 Detik):** Kecepatan 0.8x, Pitch berat/dalam, ada emphasis pada kata-kata kunci. Voice default: Sambas (Tier 2 - Neural2). Membutuhkan persetujuan penggunaan kredit 4x lipat.

## G. Strategi Customer Support
Berdasarkan tingkatan harga:
- **FREE & STARTER:** Dukungan tiket in-app / email standar (maks 2x24 jam), dihandle oleh FAQ / Chatbot.
- **KREATOR & PRODUKTIF:** WhatsApp Business API, fast-response 24 jam / hari kerja, diprioritaskan.
- **BISNIS & ENTERPRISE:** Grup WhatsApp Terbuka bersama Account Manager / Tim Teknis secara dedicated.

## H. Perhitungan BEP & Estimasi Margin
**Asumsi Bauran Pengguna (Sales Mix):**
- 60% KREATOR (Rp 49.000)
- 30% PRODUKTIF (Rp 99.000)
- 10% BISNIS (Rp 249.000)

**Rata-rata Pendapatan per User (ARPU):**
= (60% x Rp 49k) + (30% x Rp 99k) + (10% x Rp 249k)
= Rp 29.400 + Rp 29.700 + Rp 24.900 = **Rp 84.000 / user**

**Rata-rata Biaya Server (HPP API) per User:**
= (60% x Rp 10.500) + (30% x Rp 28.000) + (10% x Rp 105.000)
= Rp 6.300 + Rp 8.400 + Rp 10.500 = **Rp 25.200 / user**

**Kontribusi Margin Bersih per User:**
= Rp 84.000 - Rp 25.200 = **Rp 58.800 (Margin 70%)**

**Analisis Titik Impas (BEP):**
Dengan OPEX/CAPEX Rp 3.000.000/bulan:
BEP User = Rp 3.000.000 / Rp 58.800 = **51,02 User (~52 Paying User).**
Target BEP (60-120 user) **sangat mudah tercapai** dengan margin yang aman berkat sistem multiplier!

## I. Action Plan Launching
Tahapan wajib yang harus dikejar oleh tim sebelum peluncuran resmi:
1. **Update Pricing Page:** Ganti istilah "Karakter" menjadi "Kredit" atau format dual display "150.000 Kredit (~150 Menit Audio)". Coret harga normal, tampilkan harga bulanan.
2. **Update App Backend (Multiplier Logic):** Buat logic `deductCredits = length(text) * multiplier(voiceTier)` di dalam endpoint `/api/tts`.
3. **Database Referral:** Siapkan kolom `referral_code` di user schema, dan API endpoint untuk apply promo code signup.
4. **Rate Limiter:** Terapkan middleware seperti `express-rate-limit` pada endpoint `api/tts` berbasis Tiering user (JWT).
5. **Midtrans Subscription/Payment:** Aktifkan endpoint pembayaran untuk top-up one-time (Starter/Receh) dan recurring (Kreator ke atas).
6. **Pop-up Warning Tier:** Tambahkan alert di UI: _"Anda menggunakan Suara Studio. Operasi ini akan memotong 40x Kredit."_ untuk menghindari cancel culture akibat user kaget saldonya habis.
7. **Uji Coba Internal:** Testing 1 cycle signup -> generate TTS 10 menit (gratisan habis) -> prompt top-up muncul -> bayar pakai Midtrans -> saldo keisi -> generate pakai Studio -> saldo dipotong 40x.
