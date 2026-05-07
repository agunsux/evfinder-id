# Langgam Pricing Strategy Documentation v1.0

## 1. Executive Summary
Langgam adalah solusi *AI Voice Generator* tercanggih yang dikhususkan untuk Bahasa Indonesia, memberikan suara yang ekspresif, berwibawa, dan natural menggunakan mesin Google Cloud Text-to-Speech (WaveNet). Kami memposisikan diri di antara kompetitor global yang mahal (ElevenLabs) dan kompetitor lokal yang fiturnya terbatas. Dengan margin kotor target **75-85%**, Langgam menawarkan nilai ekonomi yang tak tertandingi bagi kreator konten long-form, pendidik, dan UMKM di Indonesia dengan harga mulai dari Rp 0 hingga Rp 249.000.

**Diferensi Kunci:**
* **Optimasi SSML Otomatis:** Pipeline Langgam secara cerdas menyesuaikan jeda dan nada untuk storytelling.
* **Harga Lokal (IDR):** Tidak ada biaya konversi bank atau fluktuasi kartu kredit.
* **Lisensi Komersial Transparan:** Hak penggunaan komersial disertakan langsung dalam paket berbayar.

---

## 2. Pricing Model Rationale
* **Character-Based Pricing:** Dipilih karena mencerminkan struktur biaya API Google (COGS langsung). Ini lebih adil bagi pengguna daripada durasi menit yang seringkali tidak akurat karena variasi kecepatan bicara (speaking rate).
* **Freemium Strategy:** Di pasar Indonesia, "mencoba sebelum membeli" adalah kunci. Paket Free berfungsi sebagai akuisisi data dan edukasi pasar.
* **Psychological Pricing:** Harga diatur tepat di bawah angka psikologis (e.g., Rp 99rb bukannya 100rb) untuk meningkatkan konversi di segmen kreator individu.

---

## 3. Tier Specifications Table

| Tier Name | Target User | Monthly Price (IDR) | Character Quota | ≈ Audio Minutes | Price per 1K chars | Key Features | License Type |
|-----------|-------------|---------------------|-----------------|-----------------|--------------------|--------------|--------------|
| **Free** | Pelajar / Uji Coba | Rp 0 | 5.000 | 5 - 8 menit | Rp 0 | Standard Voices saja | Personal Use Only |
| **Pemula** | TikToker Pemula | Rp 49.000 | 100.000 | 100 menit | Rp 0,49 | Wavenet Access, SSML Tools | Commercial (Standard) |
| **Kreator** ⭐ | YouTuber / Podcaster | Rp 99.000 | 300.000 | 300 menit | Rp 0,33 | Priority Support, All Pack Access | Commercial (Priority) |
| **Bisnis** | Agency / Education | Rp 249.000 | 1.000.000 | 1.000 menit | Rp 0,24 | Custom Cloning (Beta), API Key | Full Commercial Rights |

**Lifetime Packs (Top-up):**
* Rp 150.000 untuk 500.000 karakter (Berlaku selamanya, max. 50k chars/hari untuk antisipasi abuse).

---

## 4. Margin Analysis (WaveNet Basis)
Biaya Google TTS WaveNet: $4 per 1M karakter ≈ **Rp 62 per 1.000 karakter** (Kurs $1 = Rp 15.500).

*   **Tier: Pemula**
    *   Revenue: Rp 49.000
    *   COGS (100k chars): 100 × Rp 62 = Rp 6.200
    *   **Gross Margin: 87,3%**
*   **Tier: Kreator**
    *   Revenue: Rp 99.000
    *   COGS (300k chars): 300 × Rp 62 = Rp 18.600
    *   **Gross Margin: 81,2%**
*   **Tier: Bisnis**
    *   Revenue: Rp 249.000
    *   COGS (1.000k chars): 1.000 × Rp 62 = Rp 62.000
    *   **Gross Margin: 75,1%**

**Break-even Analysis:** 
Membutuhkan ~25 pengguna aktif Tier Kreator untuk menutup biaya operasional bulanan (Server, Domain, Midtrans fee) sebesar ~Rp 2.000.000 per bulan.

---

## 5. Competitive Price Comparison

| Platform | Price (IDR/mo) | Quota (Chars) | Price per 1K Chars | Commercial License |
|----------|----------------|---------------|--------------------|--------------------|
| **Langgam (Kreator)** | **Rp 99.000** | **300.000** | **Rp 0,33** | **Yes** |
| ElevenLabs (Starter) | Rp 180.000* | 30.000 | Rp 6,00 | Yes |
| Botika (Premium) | Rp 150.000 | 250.000 | Rp 0,60 | Yes |
| Prosa (Standard) | Rp 199.000 | 400.000 | Rp 0,50 | Yes |

*\*Estimasi setelah PPN dan biaya admin konversi bank.*

---

## 6. Implementation Guidelines
*   **Quota Management:** Gunakan *Hard Cap* untuk paket Free (berhenti saat habis) dan *Soft Cap dengan Warning* untuk paket berbayar (tetap bisa generate hingga +5% kuota, lalu ditagih top-up).
*   **Rate Limiting:** Terapkan limit 5 request per menit untuk paket Free untuk mencegah bot scraping.
*   **Rollover Policy:** 50% kuota bulanan yang tidak terpakai pada paket Kreator & Bisnis dapat diakumulasi ke bulan berikutnya jika langganan diperpanjang.
*   **Payment Integration:** Wajib menggunakan **Midtrans** atau **Xendit** untuk mendukung QRIS, GoPay, dan Transfer Bank Virtual Account lokal.

---

## 7. Go-to-Market Pricing Tactics
*   **Golden Batch Program:** Berikan diskon 50% selamanya (*early bird*) untuk 100 pendaftar pertama paket Kreator.
*   **Referral Mechanics:** Setiap user yang mengajak teman (dan teman tersebut melakukan verifikasi email) mendapatkan bonus 10.000 karakter gratis.
*   **Bundle Independence Day:** Paket 17Agustus (79.000 chars ekstra untuk merayakan kemerdekaan).

---

## 8. Risk Mitigation
*   **Currency Buffer:** Biaya API dalam USD namun harga jual dalam IDR. Rekomendasi: Gunakan penyangga harga 10% di atas target margin untuk mengkompensasi fluktuasi kurs IDR/USD.
*   **Abuse Detection:** Tandai akun yang menghabiskan >100.000 karakter dalam <2 jam sebagai potensi "Reselling" tidak resmi.

---
**Next Step:** Integrasikan dashboard kuota di tab "Account" pada aplikasi Langgam untuk transparansi penggunaan.
