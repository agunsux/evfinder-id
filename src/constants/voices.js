export const LANGUAGES = [
  { code: "ID", name: "Indonesia", flag: "🇮🇩" }
];

export const DEFAULT_VOICES = {
  "ID": "FLOW_F",
  "CMN": "cmn-CN-Standard-A"
};

export const VOICES = {
  "ID": {
    "Flow": [
      { 
        id: "FLOW_F", 
        name: "Flow", 
        type: "GeminiFlash", 
        premium: false, 
        tier: "FREE",
        desc: "Calm, articulated narrator.",
        useCase: "Audiobook, Presentations"
      }
    ],
    "Pulse": [
      { 
        id: "PULSE_M", 
        name: "Pulse", 
        type: "GeminiFlash", 
        premium: false, 
        tier: "FREE",
        desc: "Modern, energetic creator voice.",
        useCase: "TikTok, Ads, Shorts"
      }
    ],
    "Aura": [
      { 
        id: "AURA_M", 
        name: "Aura", 
        type: "GeminiFlash", 
        premium: true, 
        tier: "CREATOR",
        desc: "Cinematic, emotional storyteller.",
        useCase: "Documentary, Storytelling"
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
