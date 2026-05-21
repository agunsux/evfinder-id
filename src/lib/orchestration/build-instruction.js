import { VOICE_PRESETS, AURA_MODES } from './voice-presets.js';
import { optimizeTextForNarration } from './text-optimizer.js';

export function buildInstruction({ voice, mode, text }) {
  const presetKey = voice?.toLowerCase() || 'flow';
  const preset = VOICE_PRESETS[presetKey] || VOICE_PRESETS['flow'];
  
  let finalInstruction = preset.instruction;

  // If voice is Aura and a premium mode is selected, append the premium instruction
  if (presetKey === 'aura' && mode) {
    const premiumModeInstruction = AURA_MODES[mode.toLowerCase()];
    if (premiumModeInstruction) {
      finalInstruction += `\n\nAdvanced Orchestration:\n${premiumModeInstruction}`;
    }
  }

  const optimizedText = optimizeTextForNarration(text);

  return {
    voiceName: preset.voiceName,
    finalInstruction,
    optimizedText
  };
}
