/**
 * Inject cinematic SSML tags into raw text.
 * Rules:
 * 1. Double line breaks (\n\n) -> <break time="850ms"/>
 * 2. Periods (.) -> <break time="450ms"/>
 * 3. Commas (,) -> <break time="180ms"/>
 * 4. ALL‑CAPS words longer than 2 characters -> <emphasis level="strong">WORD</emphasis>
 * 5. Wrap whole string in <speak><prosody rate="0.94" pitch="-1.5st">…</prosody></speak>
 */
export function injectSSML(rawText: string): string {
  if (!rawText) return '';
  // Escape special XML characters
  let processed = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  // Paragraph breaks
  processed = processed.replace(/\n\n+/g, '<break time="850ms"/>');

  // Replace commas and periods with breaks (avoid interfering with the tags we just added)
  // Work character by character to avoid breaking tags
  processed = processed.replace(/([.,])/g, (match) => {
    if (match === '.') return '<break time="450ms"/>'; // period
    return '<break time="180ms"/>'; // comma
  });

  // ALL‑CAPS emphasis (words >2 chars, only letters)
  processed = processed.replace(/\b[A-Z]{3,}\b/g, (word) => {
    return `<emphasis level="strong">${word}</emphasis>`;
  });

  // Global wrapper
  return `<speak><prosody rate="0.94" pitch="-1.5st">${processed}</prosody></speak>`;
}
