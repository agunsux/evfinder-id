/**
 * SHINERVA - Proprietary Hyper-Localization Phonetic Dictionary
 * ==============================================================
 * Maps Indonesian slang, abbreviations, regional terms, and internet
 * culture specific to Jakarta, Sunda, Jawa into phonetically clear text
 * that Gemini TTS can pronounce naturally.
 *
 * This is the NON-TECHNICAL MOAT of Shinerva - pure market research
 * encoded into code. Update continuously as internet culture evolves.
 *
 * Tier 1  : Common Internet Slang (Jakarta/Jaksel)
 * Tier 2  : Abbreviations & Acronyms
 * Tier 3  : Brand/Tech Pronunciations (Indonesian context)
 * Tier 4  : Regional terms (Sunda, Jawa, etc.)
 * Tier 5  : Social Media / Affiliate slang
 */

export const PHONETIC_MAP = {
  // === TIER 1: COMMON INTERNET SLANG (Jakarta / Jaksel) ===
  "sat set":          "sat-set,",
  "satset":           "sat-set,",
  "sigap":            "si-gap,",
  "goks":             "go-kil,",
  "gokil":            "go-kil,",
  "mager":            "ma-ger, males gerak,",
  "mageran":          "ma-ger-an,",
  "sibuk":            "si-buk,",
  "njir":             "in-ji-ir,",
  "njirr":            "in-ji-ir,",
  "cuiyh":            "ku-yuh,",
  "wkwk":             "we-ka-we-ka,",
  "wkwkwk":            "we-ka-we-ka,",
  "wlpwnk":           "we-la-pa-wa-nak,",
  "asix":             "a-siks,",
  "bray":             "brei,",
  "brayy":            "brei,",
  "cuy":              "ku-i,",
  "repot":            "ri-pat,",
  "gatau":            "ga-ta-u,",
  "gajel":            "ga-jil,",
  "mantap":           "man-tap,",
  "mantep":           "man-tap,",
  "mantul":           "man-tul,",
  "jos":              "yos,",
  "jos gandos":        "yos gan-dos,",
  "cucok":            "ku-chok,",
  "cocok":            "ko-chok,",
  "gaes":             "ga-es,",
  "gaesz":            "ga-es,",
  "bestie":           "bes-ti,",
  "seleb":            "si-leb,",
  "selebgram":        "si-leb-gram,",
  "vibes":            "vai-bes,",
  "vibesnya":         "vai-bes-nya,",
  "mukbang":          "muk-bang,",
  "tilte":            "til-ta,",
  "clutch":           "kla-chi,",
  "gas":              "gas, ayo,",
  "sip":              "sip, oke,",

  // === TIER 2: FINANCIAL / PAYMENT ACRONYMS (CRITICAL for Fintech TTS) ===
  "qris":             "kris,",
  "qris":             "kris,",
  "dana":             "da-na,",
  "gopay":            "go-pay,",
  "shopeepay":        "su-pi-pay,",
  "ovo":              "o-vo,",
  "linkaja":          "link-a-ja,",
  "btpn":             "bi-te-pe-en,",
  "bri":              "be-r-a-i,",
  "bca":              "be-se-a,",
  "bni":              "be-en-ai,",
  "mandiri":          "man-di-ri,",
  "atm":              "a-te-em,",
  "rekening":         "ri-king,",

  // === TIER 3: ABBREVIATIONS & ACRONYMS ===
  "affiliate":         "a-fi-li-et,",
  "afiliasi":         "a-fi-li-a-si,",
  "yt":               "yi-tub,",
  "ytb":              "yi-tub,",
  "tiktok":           "tik-tok,",
  "tt":               "tik-tik,",
  "ig":               "i-ge,",
  "sosmed":           "es-o-es-im-di,",
  "sdm":              "es-de-im,",
  "coa":              "si-o-ei,",
  "roi":              "ar-o-ai,",
  "kpi":              "ka-pi-ai,",
  "copy paste":        "ko-pi pas-ta,",
  "copas":            "ko-pas,",
  "dm":               "di-em,",
  "gc":               "ge-si,",
  "pc":               "pi-si,",
  "rn":               "ri-man,",
  "btw":              "bi-ti-dabi-yu,",
  "fyp":              "ef wai pi,",
  "rt":               "ar-ti,",
  "asap":             "ei-sap,",
  "ngopi":             "ngop-i,",
  "ngopi bareng":      "ngop-i ba-reng,",
  "ngopi bareng":     "ngop-i ba-reng,",
  "p3k":               "pe-te-ka,",
  "hut":               "ha-u-ti,",
  "ultah":             "ul-tah,",
  "bpjs":              "be-pe-je-es,",
  "nik":               "en-ai-ka,",
  "ktp":               "ka-ta-pi,",
  "kk":                "ka-ka,",
  "npwp":              "en-pe-we-pe,",
  "va":                "fi-a,",
  "voc":               "fi-o-si,",
  "trx":               "trans-aks-i,",
  "cod":               "si-o-di,",
  "jne":               "je-en-i,",
  "sicepat":           "si-se-pat,",
  "jnt":               "je-en-ti,",
  "etle":              "i-ti-le-i,",
  "tilang":            "ti-lang,",

  // === TIER 4: REGIONAL / DIALLECT TERMS ===
  // Jakarta / Jaksel slang
  "gue":               "gue,",
  "lu":                "lu,",
  "gw":                "ge-we,",
  "lw":                "el-we,",
  "luar biasa":         "lu-ar bi-asa,",
  "kucit":             "ku-sit,",
  "sundul":            "sun-dul,",
  "nge-trending":      "ngi-tren-ding,",
  // Javanese-inflected terms
  "kulo":              "ku-lo, saya,",
  "nuwun":             "nu-wun, terima kasih,",
  "mlepuk":            "mi-le-puk,",
  "lemes":             "le-mes,",
  // Sundanese terms
  "teu":               "te-u, tidak,",
  "hampura":            "ham-pu-ra,",
  "sip":               "sip, oke,",
  "uye":               "u-ye,",

  // === TIER 5: SOCIAL MEDIA / AFFILIATE SLANG ===
  "co":                "see oh,",
  "fyp":               "ef wai pi,",
  "link di bio":        "link di bio,",
  "swipe up":           "swaip ap,",
  "voucher":            "wa-cher,",
  "dropship":           "drop-sip,",
  "reseller":           "ri-sai-lar,",
  "customer care":      "kas-to-mer ke-r,",
  "cashback":           "kes-bek,",
  "review":             "ri-fyu,",
  "unboxing":           "an-bok-sing,",
  "haul":              "haul,",
  "preloved":          "pri-lofid,",
  "onay":               "o-nai,",
  "rec":                "rek,",

  // === TIER 6: BRAND / TECH PRONUNCIATIONS (Indonesian context) ===
  "ai":                "ey-ai,",
  "ml":                "im-el,",
  "pubg":              "pi-yu-bi-ge,",
  "ff":                "ef-ef,",
  "lol":               "lo-el,",
  "miHoYo":            "mi-ho-yo,",
  "genshin":           "gen-sin,",
  "genshin impact":     "gen-sin im-pak,",
  "free fire":         "fri-fai-r,",
  ".id":               "dot ai di,",
  "dot id":            "dot ai di,",
  "dotcom":            "dot-kom,",
  "android":           "an-dro-id,",
  "ios":               "ai-o-es,",
  "api":               "ei-pi-ai,",
  "ceo":               "si-i-o,",
  "vip":               "vi-ai-pi,",
  "login":             "log-in,",
  "signup":            "sain-ap,",
  "password":          "pas-werd,",
  "shutdown":          "sa-tan-daun,",
  "update":            "ap-deit,",
  "download":          "daun-lod,",
  "wifi":              "wai-fai,",
  "laptop":            "lap-top,",
  "https":             "hei-te-pe-es,",
  "url":               "yu-ar-el,",
  "cdn":                "si-di-en,",
  "seo":               "es-i-o,",
  "tag":               "tag,",
  "content":            "kon-tent,",
  "creator":           "kri-ei-ter,",

  // === TIER 7: MISSING SLANG (Field Research) ===
  "deal":              "dil,",
  "tumbnail":          "tam-nail,",
  "subscribe":         "sam-skraib,",
  "ngonten":           "ngon-ten,",
  "konten":            "kon-ten,",
  "skripsi":           "skrip-si,",
  "ta":                "ti-ei,",
  "dosen":             "do-sen,",
  "mhs":               "em-ha-es,",
  "mahasiswa":         "ma-ha-si-wa,",
  "cp":                "si-pi,",
  "dm for collab":     "di-em for ko-lab,",
  "collabs":           "ko-lab,",
  "sponsor":           "spon-sor,",
  "endorsement":       "en-dor-sem,"
};

/**
 * Additional context-driven transformations
 * These are applied AFTER the phonetic map replacements
 * to handle context where a word might mean something else.
 */
export const CONTEXT_VARIANTS = {
  // Word -> [pronunciation variants]
  // System picks the first one by default; expand with NLP later
};

/**
 * Custom user pronunciations (from their personal dictionary)
 * Merged with PHONETIC_MAP at request time in the TTS route
 */
export const DEFAULT_USER_PRONUNCIATIONS = {};

/**
 * Global (system-wide) pronunciations set by admin or auto-learned
 */
export const GLOBAL_PHONETICS = {
  "Shinerva":  "si-ner-va,",
  "Rungu":     "ru-ngu,",
  "Langgam":   "lang-gam,",
};

/**
 * Applies the proprietary phonetic map to input text.
 * Runs BEFORE the Gemini TTS call.
 *
 * @param {string} text - Raw user input text
 * @param {Record<string,string>} userPronunciations - User's custom dict
 * @returns {string} - Preprocessed text ready for TTS
 */
export function applyPhoneticPreprocessing(text, userPronunciations = {}) {
  let processed = text;
  // Skip internal markers
  processed = processed.replace(/\[EMPHASIS_START\]|\[\/EMPHASIS_END\]/gi, '');

  // Merge: DEFAULT_GLOBAL + ADMIN_GLOBAL + USER_PERSONAL
  // User-personal has highest priority (overrides global)
  const allPronunciations = {
    ...GLOBAL_PHONETICS,
    ...PHONETIC_MAP,
    ...userPronunciations
  };

  // Iterate sorted by key length (longest first) to avoid partial replacement
  // e.g. "affiliate link" matched before "affiliate" prefix
  const sortedKeys = Object.keys(allPronunciations)
    .sort((a, b) => b.length - a.length);

  for (const slang of sortedKeys) {
    const regex = new RegExp(`\\b${escapeRegex(slang)}\\b`, 'gi');
    processed = processed.replace(regex, allPronunciations[slang]);
  }

  return processed;
}

/** Escape special regex chars in a string */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
