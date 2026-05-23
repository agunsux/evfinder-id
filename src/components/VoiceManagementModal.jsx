import React from 'react';
import { X, Settings2, Loader2 } from 'lucide-react';

const VoiceManagementModal = ({
  voiceConfigLoading,
  voiceConfig,
  setVoiceConfig,
  setIsVoiceMgmtOpen,
  saveVoiceConfig
}) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={() => setIsVoiceMgmtOpen(false)}
      ></div>
      <div className="bg-surface border border-surface2 p-8 rounded-3xl w-full max-w-xl relative z-10 shadow-2xl mx-4 max-h-[90vh] flex flex-col">
        <button
          onClick={() => setIsVoiceMgmtOpen(false)}
          className="absolute top-4 right-4 text-text-muted hover:text-text cursor-pointer bg-transparent border-none"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-8">
          <Settings2 className="w-16 h-16 text-terracotta mx-auto mb-4" />
          <h2 className="text-2xl font-black text-text">Voice Management</h2>
          <p className="text-text-muted text-sm mt-2">
            Atur pengali biaya kredit (multiplier) untuk setiap tingkatan suara.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {voiceConfigLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-terracotta animate-spin mb-4" />
              <p className="text-text-muted">Memuat data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(voiceConfig.tiers || {}).map(([tier, multiplier]) => (
                <div key={tier} className="bg-dark p-4 rounded-xl border border-surface2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-text uppercase text-xs tracking-wider">
                      Tier: {tier}
                    </label>
                    <span className="text-terracotta font-bold">{multiplier}x Multiplier</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={multiplier}
                      onChange={(e) => {
                        const newTiers = { ...voiceConfig.tiers, [tier]: parseInt(e.target.value) };
                        setVoiceConfig({ ...voiceConfig, tiers: newTiers });
                      }}
                      className="flex-1 h-1.5 bg-surface2 rounded-lg appearance-none cursor-pointer accent-terracotta"
                    />
                    <input
                      type="number"
                      value={multiplier}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const newTiers = { ...voiceConfig.tiers, [tier]: val };
                        setVoiceConfig({ ...voiceConfig, tiers: newTiers });
                      }}
                      className="w-16 bg-dark text-text border border-surface2 rounded px-2 py-1 text-center font-bold text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-2">
                    1 Karakter = {multiplier} Kredit
                  </p>
                </div>
              ))}

              <div className="pt-6 border-t border-surface2">
                <h3 className="text-text font-bold mb-4 flex items-center gap-2">
                   <Settings2 className="w-4 h-4 text-terracotta" /> Global Limits Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark p-4 rounded-xl border border-surface2">
                    <label className="block text-[10px] text-text-muted font-bold uppercase mb-2">Free Char Limit</label>
                    <input
                       type="number"
                       value={voiceConfig.limits?.free_request_chars || 500}
                       onChange={(e) => {
                         setVoiceConfig({ ...voiceConfig, limits: { ...voiceConfig.limits, free_request_chars: parseInt(e.target.value) || 0 } });
                       }}
                       className="w-full bg-surface2 text-text border border-surface2 rounded px-3 py-2 font-bold text-sm"
                    />
                  </div>
                  <div className="bg-dark p-4 rounded-xl border border-surface2">
                    <label className="block text-[10px] text-text-muted font-bold uppercase mb-2">Paid Char Limit</label>
                    <input
                       type="number"
                       value={voiceConfig.limits?.paid_request_chars || 5000}
                       onChange={(e) => {
                         setVoiceConfig({ ...voiceConfig, limits: { ...voiceConfig.limits, paid_request_chars: parseInt(e.target.value) || 0 } });
                       }}
                       className="w-full bg-surface2 text-text border border-surface2 rounded px-3 py-2 font-bold text-sm"
                    />
                  </div>
                  <div className="bg-dark p-4 rounded-xl border border-surface2">
                    <label className="block text-[10px] text-text-muted font-bold uppercase mb-2">Free Cooldown (sec)</label>
                    <input
                       type="number"
                       value={voiceConfig.limits?.free_cooldown || 30}
                       onChange={(e) => {
                         setVoiceConfig({ ...voiceConfig, limits: { ...voiceConfig.limits, free_cooldown: parseInt(e.target.value) || 0 } });
                       }}
                       className="w-full bg-surface2 text-text border border-surface2 rounded px-3 py-2 font-bold text-sm"
                    />
                  </div>
                  <div className="bg-dark p-4 rounded-xl border border-surface2">
                    <label className="block text-[10px] text-text-muted font-bold uppercase mb-2">Paid Cooldown (sec)</label>
                    <input
                       type="number"
                       value={voiceConfig.limits?.paid_cooldown || 5}
                       onChange={(e) => {
                         setVoiceConfig({ ...voiceConfig, limits: { ...voiceConfig.limits, paid_cooldown: parseInt(e.target.value) || 0 } });
                       }}
                       className="w-full bg-surface2 text-text border border-surface2 rounded px-3 py-2 font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            
            </div>
        )}
        </div>
            
            <div className="mt-8 flex gap-4">
               <button 
                onClick={() => setIsVoiceMgmtOpen(false)}
                className="flex-1 bg-surface2 hover:bg-gray-700 text-text py-3 rounded-xl font-bold cursor-pointer border-none"
               >
                 Batal
               </button>
               <button 
                onClick={() => saveVoiceConfig(voiceConfig.tiers, voiceConfig.limits)}
                className="flex-1 bg-terracotta hover:bg-trdark text-text py-3 rounded-xl font-bold cursor-pointer border-none shadow-lg shadow-terracotta/20"
               >
                 Simpan Perubahan
               </button>
            </div>
          </div>
        
    </div>

  );
};

export default VoiceManagementModal;
