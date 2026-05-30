import type { Request, Response } from 'express';
import { injectSSML } from '../lib/ssmlHelper.js';
import type { MidtransResponse } from '../types/midtrans.js'; // placeholder for response type if needed

/**
 * Generate speech using Google Cloud Text‑to‑Speech.
 * Expects JSON body: { text: string }
 * Returns { audioContent: string (base64), mimeType: 'audio/mpeg' }
 */
export async function generateSpeech(req: Request, res: Response): Promise<Response> {
  try {
    const { text } = req.body as { text?: string };
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "text" field' });
    }

    // Prepare SSML payload
    const ssml = injectSSML(text);

    // Build request URL – prefer API key, fallback to OAuth not implemented here
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI engine keys not configured' });
    }
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    const body = {
      input: { ssml },
      voice: { languageCode: 'id-ID', name: 'id-ID-Standard-A' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `Google TTS error ${response.status}: ${errText}` });
    }

    const data = await response.json();
    if (!data.audioContent) {
      return res.status(500).json({ error: 'Google TTS returned no audioContent' });
    }

    return res.json({ audioContent: data.audioContent, mimeType: 'audio/mpeg' } as MidtransResponse);
  } catch (e: any) {
    console.error('[AI] generateSpeech failed:', e);
    return res.status(500).json({ error: e.message ?? 'Unexpected error' });
  }
}
