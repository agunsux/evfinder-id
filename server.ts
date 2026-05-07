import { GoogleGenAI } from "@google/genai";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { Xendit } from "xendit-node";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route for Gemini AI
  app.post("/api/ai", async (req, res) => {
    try {
      const { prompt, system } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment.");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: system ? { systemInstruction: system } : undefined,
      });
      
      res.json({ text: response.text || "" });
    } catch (error) {
      console.error("Gemini AI Error:", error);
      res.status(500).json({ 
        error: { 
          message: error instanceof Error ? error.message : "Failed to generate AI content." 
        } 
      });
    }
  });

  // API Route for TTS Synthesis
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice, pitch, speed } = req.body;
      const apiKey = process.env.GOOGLE_API_KEY; // Prefer specific TTS key

      if (!apiKey || apiKey === "MY_GOOGLE_API_KEY") {
        return res.status(401).json({ 
          error: {
            message: "GOOGLE_API_KEY belum terpasang atau masih menggunakan placeholder. Silakan tambahkan API Key dari Google Cloud Console di panel Secrets.",
            status: "MISSING_CONFIG"
          }
        });
      }

      const synthesizeVoice = async (voiceName: string) => {
        // Detect if input is SSML or should be treated as SSML
        const isSSML = text.trim().startsWith("<speak>") || text.includes("<break") || text.includes("<emphasis") || text.includes("<phoneme") || text.includes("<prosody");
        const inputPayload = isSSML 
          ? { ssml: text.trim().startsWith("<speak>") ? text : `<speak>${text}</speak>` }
          : { text };

        return await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              input: inputPayload,
              voice: {
                languageCode: "id-ID",
                name: voiceName,
              },
              audioConfig: {
                audioEncoding: "MP3",
                pitch: pitch || 0,
                speakingRate: speed || 1.0,
              },
            }),
          }
        );
      };

      let response = await synthesizeVoice(voice);
      let responseData: any;

      const getBody = async (resp: Response) => {
        const contentType = resp.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await resp.json();
        }
        const text = await resp.text();
        // If it's a 403 HTML page from Google/Proxy
        if (resp.status === 403) {
          return { error: { message: "Akses Ditolak (403): API Key Anda tidak memiliki izin untuk Text-to-Speech atau layanan belum diaktifkan di Google Cloud Console.", status: "PERMISSION_DENIED" } };
        }
        if (resp.status === 402) {
          return { error: { message: "Kuota Terlampaui (402): Pastikan Billing aktif di Google Cloud Project Anda.", status: "QUOTA_EXCEEDED" } };
        }
        return { error: { message: text.substring(0, 500) || "Respon server tidak dikenal", status: "UNKNOWN_FORMAT" } };
      };

      responseData = await getBody(response);

      // Handle fallback if necessary (e.g. voice name changed in API)
      if (!response.ok && response.status === 400) {
        const msg = responseData.error?.message || "";
        if (typeof msg === 'string' && (msg.includes("not found") || msg.includes("invalid voice") || msg.includes("not supported"))) {
          console.log(`Voice ${voice} fallback to id-ID-Standard-A.`);
          const fallbackResp = await synthesizeVoice("id-ID-Standard-A");
          if (fallbackResp.ok) {
             response = fallbackResp;
             responseData = await getBody(response);
          }
        }
      }

      if (!response.ok) {
        console.error("Google TTS Error Object:", JSON.stringify(responseData, null, 2));
        
        // Final polish of error message for 403
        if (response.status === 403 || responseData.error?.status === "PERMISSION_DENIED") {
           responseData.error = responseData.error || {};
           responseData.error.message = "Akses Ditolak (403): API Key Google Cloud Anda tidak memiliki akses ke 'Cloud Text-to-Speech API'. Silakan aktifkan API tersebut di Google Cloud Console dan pastikan API Key tidak dibatasi.";
        }
        
        return res.status(response.status).json(responseData);
      }

      res.json(responseData);
    } catch (error) {
      console.error("Fatal Server Error:", error);
      res.status(500).json({ 
        error: { 
          message: error instanceof Error ? error.message : "Gagal memproses permintaan suara." 
        } 
      });
    }
  });

  // API Route for Xendit Checkout
  app.post("/api/checkout", async (req, res) => {
    try {
      const { planName, amount } = req.body;
      const xenditKey = process.env.XENDIT_SECRET_KEY;

      if (!xenditKey) {
        return res.status(401).json({ 
          error: {
            message: "XENDIT_SECRET_KEY belum dikonfigurasi di environment variables.",
            status: "MISSING_CONFIG"
          }
        });
      }

      const x = new Xendit({ secretKey: xenditKey });
      
      const response = await x.Invoice.createInvoice({
        data: {
          externalId: `langgam-${Date.now()}`,
          amount: amount,
          description: `Pembelian Paket Langgam: ${planName}`,
          currency: "IDR",
          reminderTime: 1,
          successRedirectUrl: `${req.headers.origin}/?status=success`,
          failureRedirectUrl: `${req.headers.origin}/?status=failure`,
        }
      });

      res.json({ invoiceUrl: response.invoiceUrl });
    } catch (error) {
      console.error("Xendit Invoice Error:", error);
      res.status(500).json({ 
        error: { 
          message: error instanceof Error ? error.message : "Gagal membuat invoice pembayaran." 
        } 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
