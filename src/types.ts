export interface Voice {
  id: string;
  name: string;
  gender: "Male" | "Female";
  type: "Wavenet" | "Standard";
  description: string;
  defaultPitch?: number;
  defaultSpeed?: number;
  tags?: string[];
  suitability?: string;
  isPremium?: boolean;
  demoUrl?: string;
    qualityLabel?: "Studio: HD" | "Pro: Natural" | "Standard";
    dialect?: string;
}

export interface TTSRequest {
  text: string;
  voice: string;
  pitch: number;
  speed: number;
  mood?: string;
  format?: 'MP3' | 'WAV' | 'OGG';
}

export interface TTSResponse {
  audioContent: string;
}

export const VOICES: Voice[] = [
  {
    id: "id-ID-Wavenet-A",
    name: "Ratna (Studio)",
    gender: "Female",
    type: "Wavenet",
    qualityLabel: "Studio: HD",
    dialect: "Indonesia (Lembut/Nurturing)",
    description: "Perempuan, lembut hangat, nurturing. Sangat cocok untuk narasi edukasi dan kemanusiaan.",
    suitability: "Nurturing, Kasih Sayang, Edukasi",
    tags: ["Lembut", "Hangat", "Nurturing"],
    isPremium: true,
    defaultPitch: -1,
    defaultSpeed: -5,
  },
  {
    id: "id-ID-Wavenet-B",
    name: "Pramudya (Studio)",
    gender: "Male",
    type: "Wavenet",
    qualityLabel: "Studio: HD",
    dialect: "Indonesia (Dalam/Resonan)",
    description: "Laki-laki, dalam resonan, kontemplatif. Pilihan utama untuk narasi epik dan sejarah.",
    suitability: "Sejarah, Sastra, Epik",
    tags: ["Resonan", "Deep", "Sastra"],
    isPremium: true,
    defaultPitch: -3,
    defaultSpeed: -8,
  },
  {
    id: "id-ID-Wavenet-D",
    name: "Sari (Premium)",
    gender: "Female",
    type: "Wavenet",
    qualityLabel: "Studio: HD",
    dialect: "Indonesia (Cerah/Energik)",
    description: "Perempuan, cerah energik. Pas untuk konten ceria, promo, dan hiburan.",
    suitability: "Energik, Youthful, Promo",
    tags: ["Energik", "Cerah", "Youthful"],
    isPremium: true,
    defaultPitch: 1,
    defaultSpeed: 0,
  },
  {
    id: "id-ID-Wavenet-C",
    name: "Ferry (Premium)",
    gender: "Male",
    type: "Wavenet",
    qualityLabel: "Studio: HD",
    dialect: "Indonesia (Santai/Karismatik)",
    description: "Laki-laki, santai karismatik. Sangat luwes untuk konten review dan obrolan.",
    suitability: "Podcast, Karismatik, Review",
    tags: ["Casual", "Karismatik", "Podcaster"],
    isPremium: true,
    defaultPitch: -2,
    defaultSpeed: -5,
  },
  {
    id: "id-ID-Chirp-1",
    name: "Larasati (Chirp Ultra HD)",
    gender: "Female",
    type: "Wavenet",
    qualityLabel: "Studio: HD",
    dialect: "Indonesia (Ultra Natural)",
    description: "Suara generasi terbaru Chirp. Intonasi 10x lebih manusiawi dan dinamis.",
    suitability: "Sinematik, Iklan TV, YouTube Premium",
    tags: ["Ultra HD", "Chirp", "Sinematik"],
    isPremium: true,
  },
  {
    id: "id-ID-Standard-B",
    name: "Eka",
    gender: "Male",
    type: "Standard",
    qualityLabel: "Standard",
    dialect: "Indonesia (Dinamis/Versatile)",
    description: "Unisex, dinamis versatile. Sangat fleksibel untuk berbagai kebutuhan video pendek.",
    suitability: "Versatile, Emosional, Dinamis",
    tags: ["Universal", "Versatile", "Dinamis"],
    defaultPitch: -2,
    defaultSpeed: 0,
  }
];
