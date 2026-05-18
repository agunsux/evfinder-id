
export const PLAYGROUND_VOICES = [
  {
    tier: "Standard",
    badge: "FREE",
    color: "gray",
    voices: [
      { id: "id-ID-Standard-A", gender: "Wanita", name: "Ratna" },
      { id: "id-ID-Standard-B", gender: "Pria", name: "Bambang" }
    ],
    categories: [
      {
        slug: "podcast",
        name: "Podcast & Edukasi",
        samples: [
          {
            id: "std_f_pod_1",
            title: "Podcast Intro (Wanita)",
            voiceId: "id-ID-Standard-A",
            script: "Selamat datang kembali di kanal Shinerva Podcast. Hari ini kita akan membahas bagaimana teknologi AI mengubah cara kita mengonsumsi konten audio secara global. Mari kita mulai diskusinya.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/std_f_pod_1.mp3"
          },
          {
            id: "std_m_edu_1",
            title: "Edukasi (Pria)",
            voiceId: "id-ID-Standard-B",
            script: "Tahukah Anda bahwa Pluto pernah dianggap sebagai planet kesembilan? Namun, pada tahun dua ribu enam, statusnya diubah menjadi planet kerdil oleh Persatuan Astronomi Internasional.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/std_m_edu_1.mp3"
          }
        ]
      }
    ]
  },
  {
    tier: "Wavenet",
    badge: "PLUS",
    color: "blue",
    voices: [
      { id: "id-ID-Wavenet-A", gender: "Wanita", name: "Lestari" },
      { id: "id-ID-Wavenet-B", gender: "Pria", name: "Joko" }
    ],
    categories: [
      {
        slug: "mystery",
        name: "Misteri & Horor",
        samples: [
          {
            id: "wav_m_hor_1",
            title: "Narasi Horor (Pria)",
            voiceId: "id-ID-Wavenet-B",
            script: "Malam itu... begitu sunyi. Hanya ada suara detak jam yang memacu detak jantung saya. Tidak ada yang menduga kalau rahasia ini baru akan terungkap... sekarang.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/wav_m_hor_1.mp3"
          },
          {
            id: "wav_f_mys_1",
            title: "Suspense (Wanita)",
            voiceId: "id-ID-Wavenet-A",
            script: "Langkah kaki itu semakin dekat. Saya tidak berani menoleh. Di dalam kegelapan ini, sesuatu sedang menunggu... dengan sangat sabar.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/wav_f_mys_1.mp3"
          }
        ]
      }
    ]
  },
  {
    tier: "Neural2",
    badge: "PRO",
    color: "purple",
    voices: [
      { id: "id-ID-Neural2-A", gender: "Wanita", name: "Siti" },
      { id: "id-ID-Neural2-D", gender: "Pria", name: "Agus" }
    ],
    categories: [
      {
        slug: "social",
        name: "TikTok & Comedy",
        samples: [
          {
            id: "neu_f_com_1",
            title: "Cerita Lucu (Wanita)",
            voiceId: "id-ID-Neural2-A",
            script: "Aduh, kalian tau nggak sih? Barusan gue nabrak kaca mall gara-gara keasikan main HP. Sumpah ya, itu sakit banget tapi malunya... ya ampun! HAHA! Parah banget!",
            url: "https://storage.googleapis.com/shinerva-assets/playground/neu_f_com_1.mp3"
          },
          {
            id: "neu_m_tts_1",
            title: "TikTok Hook (Pria)",
            voiceId: "id-ID-Neural2-D",
            script: "STOP SCROLLING! Kalian harus tau cara dapetin sepuluh juta pertama cuma modal HP doang. Eh, serius deh, cara ini belum banyak orang yang tau lho!",
            url: "https://storage.googleapis.com/shinerva-assets/playground/neu_m_tts_1.mp3"
          }
        ]
      }
    ]
  },
  {
    tier: "Studio",
    badge: "ULTRA",
    color: "terracotta",
    voices: [
      { id: "id-ID-Studio-A", gender: "Pria", name: "Eko" },
      { id: "id-ID-Studio-D", gender: "Wanita", name: "Maya" }
    ],
    categories: [
      {
        slug: "viral",
        name: "Viral & Gosip",
        samples: [
          {
            id: "stu_f_gossip_1",
            title: "Cewek Ngegosip (Wanita)",
            voiceId: "id-ID-Studio-D",
            script: "Gila parah banget sih! Eh, serius deh... gue tuh langsung bengong pas denger berita itu. Kayak... kok bisa gitu lho? Dan yang bikin gue kesel, dia tuh pura-pura gak tau apa-apa. Anjir... parah banget!",
            url: "https://storage.googleapis.com/shinerva-assets/playground/stu_f_gossip_1.mp3"
          },
          {
            id: "stu_m_viral_1",
            title: "Podcast Viral (Pria)",
            voiceId: "id-ID-Studio-A",
            script: "Menurut gue ya, kalau lo emang mau sukses, lo harus berani ambil risiko. Jangan cuma dengerin omongan orang lain terus. Eh tapi beneran deh, ini tuh kuncinya.",
            url: "https://storage.googleapis.com/shinerva-assets/playground/stu_m_viral_1.mp3"
          }
        ]
      }
    ]
  }
];
