import { GoogleGenAI, Modality } from "@google/genai";

const PRESETS = {
  FLOW_F: {
    voiceName: "charon",
    style: "Speak calmly, emotionally, naturally, with cinematic softness and gentle pacing."
  },
  FLOW_M: {
    voiceName: "Puck",
    style: "Speak calmly, emotionally, naturally, with cinematic softness and gentle pacing."
  },
  AURA_F: {
    voiceName: "Kore",
    style: "Speak elegantly, luxuriously, with refined confidence and smooth clarity."
  },
  AURA_M: {
    voiceName: "Enceladus",
    style: "Speak elegantly, luxuriously, with refined confidence and smooth clarity."
  },
  PULSE_F: {
    voiceName: "Zephyr",
    style: "Speak energetically, modern, engaging, confident, and creator-friendly."
  },
  PULSE_M: {
    voiceName: "Fenrir",
    style: "Speak energetically, modern, engaging, confident, and creator-friendly."
  }
};

// Default fallback
const DEFAULT_PRESET = PRESETS.FLOW_F;

/**
 * Converts raw PCM base64 data to WAV base64
 * @param {string} pcmBase64 - Base64 encoded PCM data
 * @param {number} sampleRate - Sample rate (default 24000)
 * @returns {string} - Base64 encoded WAV data
 */
export function pcmToWav(pcmBase64, sampleRate = 24000) {
  const pcmData = Buffer.from(pcmBase64, 'base64');
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmData.length, true);
  // WAVE identifier
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // format chunk size
  view.setUint16(20, 1, true); // sample format (PCM)
  view.setUint16(22, 1, true); // channel count (mono)
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmData.length, true);

  // PCM data
  const pcmBytes = new Uint8Array(pcmData);
  new Uint8Array(buffer, 44).set(pcmBytes);

  return Buffer.from(buffer).toString('base64');
}

/**
 * Generates audio using Gemini TTS
 * @param {string} text - The text to synthesize
 * @param {string} presetId - The Shinerva voice preset ID (e.g., FLOW_F)
 * @returns {Promise<string>} - Base64 encoded WAV data
 */
export async function generateGeminiTts(text, presetId) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const preset = PRESETS[presetId] || DEFAULT_PRESET;

  const prompt = `${preset.style}\n\nText to speak:\n${text}`;

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts',
      contents: prompt,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: preset.voiceName
            }
          }
        }
      }
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("Invalid response from Gemini API");
    }

    const candidate = response.candidates[0];
    const parts = candidate.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error("No audio parts returned from Gemini API");
    }

    // Find the inlineData containing audio
    const audioPart = parts.find(p => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith("audio/"));
    
    if (!audioPart) {
      throw new Error("No audio payload found in Gemini response");
    }

    const rawPcmBase64 = audioPart.inlineData.data;
    
    if (!rawPcmBase64 || rawPcmBase64.length < 50) {
      console.error(`[Gemini TTS] Empty or too-small PCM data (${rawPcmBase64?.length || 0} chars)`);
      throw new Error("Gemini returned empty audio data");
    }

    // Gemini 2.5 Flash typically outputs 24kHz PCM by default for AUDIO modality
    const wavBase64 = pcmToWav(rawPcmBase64, 24000);
    
    const decodedSize = Buffer.from(wavBase64, 'base64').length;
    console.log(`[Gemini TTS] WAV size: ${decodedSize} bytes (base64: ${wavBase64.length} chars)`);
    if (decodedSize <= 44) {
      throw new Error("Gemini produced empty WAV (header only, no audio data)");
    }
    
    return wavBase64;
  } catch (error) {
    console.error("[Gemini TTS Error]", error);
    throw new Error(`Gemini TTS Error: ${error.message}`);
  }
}
