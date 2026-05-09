import { GoogleGenAI } from "@google/genai";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import midtransClient from "midtrans-client";
import fs from "fs";
import crypto from "crypto";
import admin from "firebase-admin";

import { convertToIndoSSML } from "./src/lib/ssmlWrapper.ts";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}
const fdb = admin.firestore();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Persistence-ready Cache Configuration
const CACHE_DIR = path.join(process.cwd(), "cache-tts");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Simple in-memory cache for fast access (first layer)
const ttsMemoryCache = new Map<string, any>();

/**
 * Generates a stable hash for cache keys based on TTS parameters
 */
function getCacheKey(params: { text: string; voice: string; pitch?: number; speed?: number; format?: string }) {
  const normalizedParams = {
    text: params.text.trim(),
    voice: params.voice,
    pitch: params.pitch || 0,
    speed: params.speed || 1.0,
    format: params.format || 'MP3'
  };
  return crypto.createHash('sha256').update(JSON.stringify(normalizedParams)).digest('hex');
}

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
      const { text, voice, pitch, speed, mood, format } = req.body;
      const apiKey = process.env.GOOGLE_API_KEY; // Prefer specific TTS key

      if (!apiKey || apiKey === "MY_GOOGLE_API_KEY") {
        return res.status(401).json({ 
          error: {
            message: "GOOGLE_API_KEY belum terpasang atau masih menggunakan placeholder. Silakan tambahkan API Key dari Google Cloud Console di panel Secrets.",
            status: "MISSING_CONFIG"
          }
        });
      }

      // Generate a persistent cache key
      const cacheKey = getCacheKey({ text, voice, pitch, speed, format });
      const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.json`);

      // 1. Check Memory Cache
      if (ttsMemoryCache.has(cacheKey)) {
        console.log("TTS Memory Cache Hit for:", voice);
        return res.json(ttsMemoryCache.get(cacheKey));
      }

      // 2. Check File Cache
      if (fs.existsSync(cacheFilePath)) {
        try {
          const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
          console.log("TTS Disk Cache Hit for:", voice);
          // Update memory cache
          ttsMemoryCache.set(cacheKey, cachedData);
          return res.json(cachedData);
        } catch (readError) {
          console.error("Error reading cache file:", readError);
        }
      }

      const synthesizeVoice = async (voiceName: string) => {
        // Detect if input is SSML or should be treated as SSML
        const isSSML = text.trim().startsWith("<speak>") || text.includes("<break") || text.includes("<emphasis") || text.includes("<phoneme") || text.includes("<prosody");
        
        let finalInput = text;
        
        // Auto-naturalize if not already SSML and mood/intent suggests it (or if explicitly requested)
        const shouldNaturalize = !isSSML && (mood === 'natural' || !mood);
        
        if (shouldNaturalize) {
          finalInput = convertToIndoSSML(text, { 
            isSerious: mood === 'serious',
            speed: speed || 1.0,
            pitch: pitch ? `${pitch}st` : "0st"
          });
        }

        const inputPayload = (isSSML || shouldNaturalize)
          ? { ssml: (finalInput.trim().startsWith("<speak>") ? finalInput : `<speak>${finalInput}</speak>`) }
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
                audioEncoding: format === 'WAV' ? 'LINEAR16' : (format === 'OGG' ? 'OGG_OPUS' : 'MP3'),
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

      // Save to cache before returning
      try {
        ttsMemoryCache.set(cacheKey, responseData);
        fs.writeFileSync(cacheFilePath, JSON.stringify(responseData));
      } catch (saveError) {
        console.error("Failed to save to cache:", saveError);
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

  // API Route for Midtrans Client Key
  app.get("/api/config/midtrans", (req, res) => {
    res.json({ clientKey: process.env.MIDTRANS_CLIENT_KEY });
  });

  // API Route for Midtrans Checkout
  app.post("/api/checkout", async (req, res) => {
    try {
      const { planName, amount, userEmail, userName, userId } = req.body;
      const serverKey = process.env.MIDTRANS_SERVER_KEY;

      if (!serverKey) {
        return res.status(401).json({ 
          error: {
            message: "MIDTRANS_SERVER_KEY belum dikonfigurasi di environment variables.",
            status: "MISSING_CONFIG"
          }
        });
      }

      const snap = new midtransClient.Snap({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
        serverKey: serverKey,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
      });
      
      const parameter = {
        transaction_details: {
          order_id: `rungu-${Date.now()}`,
          gross_amount: amount
        },
        item_details: [{
          id: planName.toLowerCase().replace(/\s+/g, '-'),
          price: amount,
          quantity: 1,
          name: `Top Up Rungu: ${planName}`
        }],
        customer_details: {
          email: userEmail || "customer@example.com",
          first_name: userName || "Customer"
        },
        custom_field1: userId,
        credit_card: {
          secure: true
        }
      };

      const transaction = await snap.createTransaction(parameter);
      res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
    } catch (error) {
      console.error("Midtrans Transaction Error:", error);
      res.status(500).json({ 
        error: { 
          message: error instanceof Error ? error.message : "Gagal membuat transaksi pembayaran." 
        } 
      });
    }
  });

  // API Route for Midtrans Notification Callback
  app.post("/api/payment-callback", async (req, res) => {
    try {
      const notification = req.body;
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      
      const snap = new midtransClient.Snap({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
        serverKey: serverKey,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
      });

      const statusResponse = await snap.transaction.notification(notification);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. Fraud Status: ${fraudStatus}`);

      if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
        if (fraudStatus === 'challenge') {
          console.log(`Transaction challenge for ${orderId}`);
        } else if (fraudStatus === 'accept' || !fraudStatus) {
          const userId = notification.custom_field1;
          const planName = notification.item_details?.[0]?.name?.split(": ")?.[1] || "";
          
          if (userId) {
            console.log(`Updating quota for user ${userId} based on plan ${planName}`);
            const userRef = fdb.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
              const userData = userDoc.data() || {};
              let currentQuota = userData.currentQuota || 0;
              let rolloverQuota = userData.rolloverQuota || 0;
              let addedQuota = 0;
              let isSubscription = false;

              const quotas: Record<string, number> = {
                "Starter": 25000,
                "Creator": 180000,
                "Produktif": 420000,
                "Bisnis": 1150000,
                "Top-up Kecil": 50000,
                "Top-up Medium": 150000,
                "Top-up Jumbo": 500000
              };

              addedQuota = quotas[planName] || 0;
              isSubscription = ["Creator", "Produktif", "Bisnis"].includes(planName);

              if (addedQuota > 0) {
                const batch = fdb.batch();
                
                if (isSubscription) {
                  batch.update(userRef, {
                    plan: planName,
                    currentQuota: addedQuota,
                    maxQuota: addedQuota,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                  });
                } else {
                  batch.update(userRef, {
                    rolloverQuota: rolloverQuota + addedQuota,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                  });
                }

                // Record transaction
                const transactionRef = fdb.collection('transactions').doc(orderId);
                batch.set(transactionRef, {
                  userId,
                  orderId,
                  planName,
                  amount: statusResponse.gross_amount,
                  status: transactionStatus,
                  paymentType: statusResponse.payment_type,
                  createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                await batch.commit();
                console.log(`Successfully updated quota and recorded transaction for ${userId}: +${addedQuota}`);
              }
            } else {
              console.error(`User document ${userId} not found for payment processing.`);
            }
          }
        }
      } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
        // Record failed transaction too
        const userId = notification.custom_field1;
        if (userId) {
          await fdb.collection('transactions').doc(orderId).set({
            userId,
            orderId,
            status: transactionStatus,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error("Midtrans Callback Error:", error);
      res.status(500).send('Error');
    }
  });

  // API Route for Transaction History
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const snapshot = await fdb.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json(transactions);
    } catch (error) {
      console.error("Fetch Transactions Error:", error);
      res.status(500).json({ error: "Failed to fetch transactions." });
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
