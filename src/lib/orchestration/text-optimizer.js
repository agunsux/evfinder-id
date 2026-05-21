export function optimizeTextForNarration(text) {
  if (!text) return "";

  let optimized = text;

  // 1. Normalize whitespace (remove multiple spaces/tabs, keep line breaks intact)
  optimized = optimized.replace(/[ \t]+/g, ' ');

  // 2. Preserve dramatic ellipsis (... or ..) but ensure they aren't stripped
  optimized = optimized.replace(/\.{2,}/g, '...');

  // 3. Add slight pauses after questions or exclamations
  optimized = optimized.replace(/([?!])\s*/g, '$1\n\n');

  // 4. Ensure paragraphs have clean breathing room
  optimized = optimized.replace(/\n{3,}/g, '\n\n');

  return optimized.trim();
}
