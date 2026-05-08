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
    id: "id-ID-Wavenet-B",
    name: "Pramudya",
    gender: "Male",
    type: "Wavenet",
    qualityLabel: "Studio: HD",
    dialect: "Indonesia (Resonan/Kontemplatif)",
    description: "Laki-laki, suara dalam, resonan, dan kontemplatif. Sempurna untuk narasi sejarah, sastra, dan refleksi mendalam.",
    suitability: "Sejarah, Sastra, Kontemplatif",
    tags: ["Resonan", "Deep", "Sastra"],
    isPremium: true,
    defaultPitch: -3,
    defaultSpeed: -8,
  },
  {
    id: "id-ID-Wavenet-C",
    name: "Ferry",
    gender: "Male",
    type: "Wavenet",
    qualityLabel: "Studio: HD",
    dialect: "Indonesia (Santai/Karismatik)",
    description: "Laki-laki, santai namun karismatik. Gaya bicara gaya podcaster yang asyik didengar untuk durasi panjang.",
    suitability: "Podcast, Review, Santai",
    tags: ["Casual", "Karismatik", "Podcaster"],
    isPremium: true,
    defaultPitch: -2,
    defaultSpeed: -5,
  },
  {
    id: "id-ID-Wavenet-A",
    name: "Ratna",
    gender: "Female",
    type: "Wavenet",
    qualityLabel: "Studio: HD",
    dialect: "Indonesia (Lembut/Nurturing)",
    description: "Perempuan, lembut, hangat, dan nurturing. Sangat cocok untuk dongeng, konten edukasi Ibu & Anak, dan narasi kemanusiaan.",
    suitability: "Dongeng, Nurturing, Humanis",
    tags: ["Lembut", "Hangat", "Nurturing"],
    isPremium: true,
    defaultPitch: -1,
    defaultSpeed: -5,
  },
  {
    id: "id-ID-Wavenet-D",
    name: "Sari",
    gender: "Female",
    type: "Wavenet",
    qualityLabel: "Studio: HD",
    dialect: "Indonesia (Cerah/Energik)",
    description: "Perempuan, cerah, energik, dan penuh semangat. Pas untuk konten iklan, promo, dan edukasi yang ceria.",
    suitability: "Iklan, Promo, Energik",
    tags: ["Energik", "Cerah", "Modern"],
    isPremium: true,
    defaultPitch: 1,
    defaultSpeed: 0,
  },
  {
    id: "id-ID-Standard-B",
    name: "Eka",
    gender: "Male",
    type: "Standard",
    qualityLabel: "Pro: Natural",
    dialect: "Indonesia (Dinamis/Versatile)",
    description: "Unisex/Male, versatile dan dinamis. Sangat fleksibel untuk berbagai kebutuhan video pendek dan dubbing karakter.",
    suitability: "Dubbing, Versatile, Dinamis",
    tags: ["Universal", "Versatile", "Dinamis"],
    defaultPitch: -2,
    defaultSpeed: 0,
  }
];
