const clean = (val) => {
  if (val === null || val === undefined) return "";
  let res = String(val).trim();
  if (res === "null" || res === "undefined" || res === "") return "";
  if ((res.startsWith('"') && res.endsWith('"')) || (res.startsWith("'") && res.endsWith("'"))) {
    res = res.substring(1, res.length - 1).trim();
  }
  return res.replace(/[\u200B-\u200D\ufeff\u00a0\u0000-\u001F\u007F-\u009F]/g, "");
};

const OPENAI_DEFAULT_MODEL = "gpt-4o-mini-tts";
const OPENAI_API_BASE_DEFAULT = "https://api.openai.com";

const buildGoogleTtsRequest = ({ text, voice, speed, pitch, volume }) => ({
  input: { ssml: `<speak>${text}</speak>` },
  voice: { languageCode: 'id-ID', name: voice || 'id-ID-Standard-A' },
  audioConfig: {
    audioEncoding: 'MP3',
    speakingRate: speed || 1.0,
    pitch: pitch || 0.0,
    volumeGainDb: volume || 0.0,
  },
});

export const invokeTtsProvider = async ({
  provider,
  text,
  voice,
  speed,
  pitch,
  volume,
  isSample,
  format = 'mp3',
}) => {
  provider = (provider || process.env.TTS_PROVIDER || 'google').toLowerCase();
  const googleApiKey = clean(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);
  const openaiApiKey = clean(process.env.OPENAI_API_KEY);
  const openaiBase = clean(process.env.OPENAI_API_BASE) || OPENAI_API_BASE_DEFAULT;
  const antigravityUrl = clean(process.env.ANTIGRAVITY_API_URL);
  const antigravityKey = clean(process.env.ANTIGRAVITY_API_KEY);

  if (provider === 'google') {
    if (!googleApiKey) {
      throw new Error('Missing GOOGLE_API_KEY / GEMINI_API_KEY for Google TTS provider.');
    }
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildGoogleTtsRequest({ text, voice, speed, pitch, volume })),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Google TTS request failed.');
    }
    return { audioContent: data.audioContent, format: 'mp3' };
  }

  if (provider === 'openai') {
    if (!openaiApiKey) {
      throw new Error('Missing OPENAI_API_KEY for OpenAI TTS provider.');
    }
    const model = clean(process.env.OPENAI_TTS_MODEL) || OPENAI_DEFAULT_MODEL;
    const url = `${openaiBase.replace(/\/$/, '')}/v1/audio/speech`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        voice: voice || 'alloy',
        input: text,
        format,
      }),
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI TTS request failed: ${errBody}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return { audioContent: buffer.toString('base64'), format };
  }

  if (provider === 'antigravity') {
    if (!antigravityUrl) {
      throw new Error('Missing ANTIGRAVITY_API_URL for Antigravity provider.');
    }
    const response = await fetch(antigravityUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(antigravityKey ? { Authorization: `Bearer ${antigravityKey}` } : {}),
      },
      body: JSON.stringify({
        text,
        voice,
        speed,
        pitch,
        volume,
        format,
        sample: Boolean(isSample),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Antigravity TTS request failed.');
    }
    const audioContent = data.audioContent || data.audio_base64 || data.audio || data.base64;
    if (!audioContent) {
      throw new Error('Antigravity response did not include audioContent.');
    }
    return { audioContent, format };
  }

  throw new Error(`Unsupported TTS provider: ${provider}`);
};
