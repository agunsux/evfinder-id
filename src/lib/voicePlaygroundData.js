export const PLAYGROUND_VOICES = {
  "ID": [
    {
      tier: "Flow",
      badge: "FREE",
      color: "gray",
      voices: [
        { id: "FLOW_F", gender: "Wanita", name: "Ratna (Flow)" },
        { id: "FLOW_M", gender: "Pria", name: "Bambang (Flow)" }
      ],
      categories: [
        {
          slug: "informative",
          name: "Informative & Calm",
          description: "Suara bersih, tenang, dan profesional dengan pacing lembut.",
          samples: [
            {
              id: "flow_f_sample",
              title: "Narasi Edukasi",
              voiceId: "FLOW_F",
              script: "Siklus air, atau siklus hidrologi, adalah sirkulasi air yang tidak pernah berhenti dari atmosfer ke bumi dan kembali ke atmosfer.",
              url: ""
            },
            {
              id: "flow_m_sample",
              title: "Berita Utama",
              voiceId: "FLOW_M",
              script: "Indeks Harga Saham Gabungan sore ini ditutup menguat seiring dengan optimisme investor terhadap pemulihan ekonomi nasional.",
              url: ""
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
        { id: "PULSE_F", gender: "Wanita", name: "Siti (Pulse)" },
        { id: "PULSE_M", gender: "Pria", name: "Agus (Pulse)" }
      ],
      categories: [
        {
          slug: "social",
          name: "TikTok & Social",
          description: "Energi tinggi, modern, engaging, dan creator-friendly.",
          samples: [
            {
              id: "pulse_f_sample",
              title: "Lifestyle VLOG",
              voiceId: "PULSE_F",
              script: "A Day in My Life as a Content Creator! Hari ini produktif banget, mulai dari shooting konten bareng tim, sampai mampir ke cafe baru yang lagi viral. Keren banget tempatnya!",
              url: ""
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
        { id: "AURA_F", gender: "Wanita", name: "Maya (Aura)" },
        { id: "AURA_M", gender: "Pria", name: "Eko (Aura)" }
      ],
      categories: [
        {
          slug: "conversational",
          name: "Elegant & Conversational",
          description: "Elegan, mewah, dengan tingkat kepercayaan diri yang tinggi.",
          samples: [
            {
              id: "aura_m_sample",
              title: "Luxury Review",
              voiceId: "AURA_M",
              script: "Desain interior mobil ini menghadirkan perpaduan sempurna antara material kulit premium dan sentuhan kayu eksotis, memberikan pengalaman berkendara kelas satu.",
              url: ""
            }
          ]
        }
      ]
    }
  ]
};
