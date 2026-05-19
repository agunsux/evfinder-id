
export const PLAYGROUND_VOICES = [
  {
    tier: "Basic",
    badge: "FREE",
    color: "gray",
    voices: [
      { id: "id-ID-Standard-A", gender: "Wanita", name: "Ratna" },
      { id: "id-ID-Standard-B", gender: "Pria", name: "Bambang" }
    ],
    categories: [
      {
        slug: "informative",
        name: "Informative",
        description: "Suara bersih dan profesional untuk materi edukasi atau berita.",
        samples: [
          {
            id: "std_f_edu_1",
            title: "Narasi Edukasi",
            voiceId: "id-ID-Standard-A",
            script: "Siklus air, atau siklus hidrologi, adalah sirkulasi air yang tidak pernah berhenti dari atmosfer ke bumi dan kembali ke atmosfer melalui proses kondensasi, presipitasi, evaporasi dan transpirasi.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/std_f_edu_1.mp3"
          },
          {
            id: "std_m_news_1",
            title: "Berita Utama",
            voiceId: "id-ID-Standard-B",
            script: "Indeks Harga Saham Gabungan sore ini ditutup menguat nol koma lima persen seiring dengan optimisme investor terhadap pemulihan ekonomi nasional di kuartal ketiga tahun ini.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/std_m_news_1.mp3"
          }
        ]
      }
    ]
  },
  {
    tier: "Flow",
    badge: "PLUS",
    color: "blue",
    voices: [
      { id: "id-ID-Wavenet-A", gender: "Wanita", name: "Lestari" },
      { id: "id-ID-Wavenet-B", gender: "Pria", name: "Joko" }
    ],
    categories: [
      {
        slug: "mystery",
        name: "Mystery & Horror",
        description: "Nada dramatis dengan jeda yang dalam untuk membangun ketegangan.",
        samples: [
          {
            id: "wav_m_horror_1",
            title: "Misteri Tengah Malam",
            voiceId: "id-ID-Wavenet-B",
            script: "Pintu itu... berderit pelan. Di balik kegelapan yang pekat, sepasang mata merah menatap tajam. Keheningan ini... hanyalah awal dari sesuatu yang jauh lebih mengerikan.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/wav_m_horror_1.mp3"
          },
          {
            id: "wav_f_suspense_1",
            title: "Narasi Thriller",
            voiceId: "id-ID-Wavenet-A",
            script: "Setiap langkah yang saya ambil, terasa seperti ada yang mengikuti. Saya berhenti sebentar... menahan napas. Tapi suara itu... tetap ada di belakang saya.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/wav_f_suspense_1.mp3"
          }
        ]
      }
    ]
  },
  {
    tier: "Pulse",
    badge: "PRO",
    color: "purple",
    voices: [
      { id: "id-ID-Neural2-A", gender: "Wanita", name: "Siti" },
      { id: "id-ID-Neural2-B", gender: "Pria", name: "Agus" }
    ],
    categories: [
      {
        slug: "social",
        name: "TikTok & Social",
        description: "Energi tinggi dan ekspresif untuk konten video pendek yang viral.",
        samples: [
          {
            id: "neu_f_tiktok_1",
            title: "Lifestyle VLOG",
            voiceId: "id-ID-Neural2-A",
            script: "A Day in My Life as a Content Creator! Hari ini produktif banget, mulai dari shooting konten bareng tim, sampai mampir ke cafe baru yang lagi viral. Keren banget tempatnya!",
            url: "https://storage.googleapis.com/shinerva-assets/playground/neu_f_tiktok_1.mp3"
          },
          {
            id: "neu_m_hype_1",
            title: "Motivational Hook",
            voiceId: "id-ID-Neural2-B",
            script: "Berhenti mengeluh dan mulai bertindak! Kesempatan itu tidak datang dua kali. Kalau lo nggak ambil sekarang, jangan menyesal kalau orang lain yang dapetin hasilnya!",
            url: "https://storage.googleapis.com/shinerva-assets/playground/neu_m_hype_1.mp3"
          }
        ]
      }
    ]
  },
  {
    tier: "Aura",
    badge: "ULTRA",
    color: "terracotta",
    voices: [
      { id: "Charon", gender: "Pria", name: "Eko" },
      { id: "Kore", gender: "Wanita", name: "Maya" }
    ],
    categories: [
      {
        slug: "conversational",
        name: "Conversational",
        description: "Suara 'nyablak' dan emosional yang tidak bisa dibedakan dengan manusia asli.",
        samples: [
          {
            id: "stu_f_gossip_expressive",
            title: "Gossip Expressive",
            voiceId: "Kore",
            script: "Gila parah banget sih! Eh, serius deh... gue tuh langsung bengong pas denger berita itu. Kayak... kok bisa gitu lho? Dan yang bikin gue kesel, dia tuh pura-pura gak tau apa-apa. Anjir... parah banget!",
            url: "https://storage.googleapis.com/shinerva-assets/playground/stu_f_gossip_expressive.mp3"
          },
          {
            id: "stu_m_breakdown",
            title: "Emotional Breakdown",
            voiceId: "Charon",
            script: "Gue udah coba semuanya... beneran. Tapi dunia kayak nggak pernah kasih gue kesempatan. Capek banget rasanya... tapi ya mau gimana lagi kan? Harus tetap jalan.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/stu_m_breakdown.mp3"
          },
          {
            id: "stu_f_sarcasm",
            title: "Sarcastic Commentary",
            voiceId: "Kore",
            script: "Wah, hebat banget ya dia. Udah salah, malah nyalahin orang lain. Sumpah ya, level percaya dirinya itu... sesuatu banget sih. Luar biasa!",
            url: "https://storage.googleapis.com/shinerva-assets/playground/stu_f_sarcasm.mp3"
          }
        ]
      }
    ]
  }
];
