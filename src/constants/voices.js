export const LANGUAGES = [
  { code: "ID", name: "Indonesia", flag: "🇮🇩" }
];

export const DEFAULT_VOICES = {
  "ID": "SAMBAS",
  "CMN": "cmn-CN-Standard-A"
};

export const VOICES = {
  "ID": {
    "Sambas": [
      {
        id: "SAMBAS",
        name: "Sambas",
        type: "GeminiFlash",
        premium: false,
        tier: "FREE",
        desc: "Cinematic, deep, storytelling voice.",
        useCase: "Horror, Documentary, Narrative"
      }
    ],
    "Mega": [
      {
        id: "MEGA",
        name: "Mega",
        type: "GeminiFlash",
        premium: false,
        tier: "FREE",
        desc: "Professional, clear broadcasting tone.",
        useCase: "Education, News, Corporate"
      }
    ],
    "Susi": [
      {
        id: "SUSI",
        name: "Susi",
        type: "GeminiFlash",
        premium: false,
        tier: "FREE",
        desc: "Energetic, modern, creator‑friendly voice.",
        useCase: "Social, Shorts, Ads"
      }
    ],
    "Ratna": [
      {
        id: "RATNA",
        name: "Ratna",
        type: "GeminiFlash",
        premium: true,
        tier: "STARTER",
        desc: "Soft emotional narrator, gentle storytelling.",
        useCase: "Romance, Audiobook, Poetry"
      }
    ]
  }
};

export const getVoiceDisplayName = (id) => {
  if (!id) return "-";
  for (const lang in VOICES) {
    for (const category in VOICES[lang]) {
      const voice = VOICES[lang][category].find(v => v.id === id);
      if (voice) return voice.name.split(" (")[0];
    }
  }
  return id.split("-").slice(-2).join("-");
};
