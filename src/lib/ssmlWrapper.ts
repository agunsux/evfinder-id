/**
 * Rungu Studio - Indonesian SSML Wrapper Utility
 * Optimized for Google Cloud Text-to-Speech
 */

export interface SSMLOptions {
  gender?: 'MALE' | 'FEMALE';
  isSerious?: boolean;
  speed?: number;
  pitch?: string;
}

/**
 * Normalizes Indonesian text for TTS, handling abbreviations and numbers.
 */
function normalizeIndoText(text: string): string {
  let normalized = text;

  // Handle common abbreviations (WIB, WITA, WIT, PT, CV, km/jam, dll)
  const abbreviations = {
    'WIB': 'Waktu Indonesia Barat',
    'WITA': 'Waktu Indonesia Tengah',
    'WIT': 'Waktu Indonesia Timur',
    'PT': 'Perseroan Terbatas',
    'CV': 'Comanditaire Vennootschap',
    'km/jam': 'kilometer per jam',
    's.d.': 'sampai dengan',
    'Rp': 'Rupiah ',
    'dkt': 'dekat',
    'ttg': 'tentang',
    'yg': 'yang',
    'dlm': 'dalam',
  };

  Object.entries(abbreviations).forEach(([abbr, full]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'g');
    normalized = normalized.replace(regex, `<say-as interpret-as="words">${full}</say-as>`);
  });

  // Wrap acronyms for character-by-character reading if they are all caps and 2-4 chars
  normalized = normalized.replace(/\b([A-Z]{2,4})\b/g, (match, p1) => {
    // If not already replaced by abbreviations
    if (match.length > 1 && !match.includes('<say-as')) {
      return `<say-as interpret-as="characters">${p1}</say-as>`;
    }
    return match;
  });

  // Handle Numbers (e.g., 1.000 -> cardinal)
  normalized = normalized.replace(/\b(\d{1,3}(\.\d{3})*)\b/g, (match) => {
    const rawNumber = match.replace(/\./g, '');
    return `<say-as interpret-as="cardinal">${rawNumber}</say-as>`;
  });

  return normalized;
}

/**
 * Main wrapper to convert text to natural Indonesian SSML.
 */
export function convertToIndoSSML(text: string, options: SSMLOptions = {}): string {
  const { isSerious = false, speed = 1.0, pitch = "0st" } = options;

  // 1. Clean and normalize
  let processedText = normalizeIndoText(text);

  // 2. Identify sentence types and apply prosody
  // Split into sentences but keep delimiters
  const sentences = processedText.split(/([.!?])\s*/);
  
  let finalSSML = "";

  for (let i = 0; i < sentences.length; i += 2) {
    let sentence = sentences[i];
    const delimiter = sentences[i + 1] || "";
    
    if (!sentence || sentence.trim() === "") continue;

    // Default rate and pitch
    let currentRate = speed;
    let currentPitch = pitch;

    // Logic: Question tagging (upwards pitch)
    if (delimiter === "?") {
      currentPitch = "+2st";
    }

    // Logic: Serious/Deep Tone (slower rate, lower pitch)
    if (isSerious) {
      currentRate = 0.9 * speed;
      currentPitch = "-1st";
    }

    // Wrap the sentence in prosody
    let wrappedSentence = `<prosody rate="${currentRate}" pitch="${currentPitch}">${sentence}${delimiter}</prosody>`;

    // 3. Human-like Pauses
    // Pause 200ms after commas for emphasis
    wrappedSentence = wrappedSentence.replace(/,/g, ',<break time="200ms"/>');

    // Pause 500ms before punchlines or the very last sentence
    if (i >= sentences.length - 2) {
       wrappedSentence = `<break time="300ms"/>${wrappedSentence}`;
    }

    finalSSML += wrappedSentence;
  }

  // 4. Wrap with speaker and root tags
  return `<speak>${finalSSML}</speak>`;
}

/**
 * Example Usage with @google-cloud/text-to-speech:
 * 
 * const request = {
 *   input: { ssml: convertToIndoSSML(userInput, { isSerious: true }) },
 *   voice: { languageCode: 'id-ID', name: 'id-ID-Wavenet-A' },
 *   audioConfig: { audioEncoding: 'MP3' },
 * };
 */
