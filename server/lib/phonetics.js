/**
 * SHINERVA AI - Hyper-Localization Phonetic Dictionary
 * Location: server/lib/phonetics.js
 * * Melakukan translasi kata slang/singkatan Indonesia dengan mempertahankan prosodi huruf.
 */

const phoneticMap = {
  "goks": "gokil banget",
  "satset": "sat,, set",
  "ngab": "orang tua bray",
  "mager": "malas gerak",
  "bray": "brei",
  "rizz": "ris",
  "rp": "rupiah ",
  "promo": "prom-o",
  "diskon 50%": "diskon lima puluh persen",
  "50k": "lima puluh ribu" // Menangkap format tag e-commerce affiliate
};

/**
 * Membantu mempertahankan kapitalisasi kata asli untuk menjaga prosodi vokal AI
 */
function preserveCasing(original, replacement) {
  // Jika kata asli KAPITAL SEMUA (misal: GOKS) -> Ubah hasil jadi KAPITAL SEMUA
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  // Jika kata asli huruf besar di awal (misal: Satset) -> Kapitalisasi huruf pertama
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement.toLowerCase();
}

export function applyPhoneticMoat(text) {
  if (!text || typeof text !== 'string') return text;
  
  let processedText = text;

  // Lakukan iterasi kamus lokal secara dinamis
  Object.keys(phoneticMap).forEach((word) => {
    // Menggunakan regex case-insensitive (\b untuk batas kata murni, /gi untuk global-insensitive)
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    
    processedText = processedText.replace(regex, (match) => {
      return preserveCasing(match, phoneticMap[word]);
    });
  });

  return processedText;
}
