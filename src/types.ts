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
}

export interface TTSRequest {
  text: string;
  voice: string;
  pitch: number;
  speed: number;
}

export interface TTSResponse {
  audioContent: string;
}

export const VOICES: Voice[] = [
  {
    id: "id-ID-Wavenet-B",
    name: "Pritt (Legenda)",
    gender: "Male",
    type: "Wavenet",
    description: "Berwibawa, Karismatik, & Dalam — Suara legenda seperti Pramudya Ananta Toer bertemu narator Falls of Civilization. Ideal untuk sejarah epik dan misteri nusantara.",
    suitability: "YouTube 45-180 menit (Sejarah Epik, Dokumenter)",
    tags: ["Epik", "Storytelling"],
    isPremium: true,
    defaultPitch: -2,
    defaultSpeed: -5,
  },
  {
    id: "id-ID-Wavenet-C",
    name: "Ferry (Pioneer)",
    gender: "Male",
    type: "Wavenet",
    description: "Narator Radio Klasik yang Lembut & Berwibawa — Cocok untuk dokumenter, podcast edukasi, dan long-form YouTube.",
    suitability: "YouTube 30-120 menit (Edukasi, Dokumenter)",
    tags: ["Long-form Educational", "Casual"],
    isPremium: true,
    defaultPitch: -2,
    defaultSpeed: -5,
  },
  {
    id: "id-ID-Standard-C",
    name: "Bimoky (Moderen)",
    gender: "Male",
    type: "Standard",
    description: "Deep Voice Over yang Autentik & Kuat — Untuk konten modern, analisis pop culture, dan breakdown mendalam.",
    suitability: "Social Media 15-60 menit (Pop Culture, Analysis)",
    tags: ["Casual", "Epik"],
    defaultPitch: -4,
    defaultSpeed: 0,
  },
  {
    id: "id-ID-Wavenet-A",
    name: "Ratna",
    gender: "Female",
    type: "Wavenet",
    description: "Lembut & Menenangkan — Suara ibu dongeng nusantara yang hangat, sempurna untuk narasi sejarah humanis, audiobook, dan cerita panjang 1-3 jam.",
    suitability: "Audiobook 60-180 menit (History, Storytelling)",
    tags: ["Storytelling", "Casual"],
    isPremium: true,
    defaultPitch: -2,
    defaultSpeed: -5,
  },
  {
    id: "id-ID-Wavenet-D",
    name: "Indah",
    gender: "Female",
    type: "Wavenet",
    description: "Profesional & Ceria — Suara energik untuk iklan, tutorial singkat, dan konten marketing yang persuasif.",
    suitability: "ADS / Shorts 1-10 menit",
    tags: ["Casual"],
    isPremium: true,
    defaultPitch: 0,
    defaultSpeed: 0,
  },
  {
    id: "id-ID-Standard-D",
    name: "Santi",
    gender: "Female",
    type: "Standard",
    description: "Jernih & Sopan — Ideal untuk layanan pelanggan, pengumuman publik, dan panduan sistem.",
    suitability: "System Voice / IVR",
    tags: ["Casual"],
  },
  {
    id: "id-ID-Standard-B",
    name: "Eko",
    gender: "Male",
    type: "Standard",
    description: "Naturil & Ramah — Suara sehari-hari yang cocok untuk tutorial sederhana dan vlog santai.",
    suitability: "Tutorial / Vlog 10-30 menit",
    tags: ["Casual"],
  },
];
