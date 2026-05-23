import React, { useRef } from 'react';
import { AlertTriangle, Loader2, Play, Check } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import VoicePicker from './VoicePicker';
import TurnstileWidget from './TurnstileWidget';

const StudioSection = ({ 
  user, 
  handleGenerate, 
  cooldown, 
  estimatedCost, 
  currentMaxRequestChars, 
  remainingCredits, 
  isCappedByRequest, 
  isCappedByQuota, 
  isNearLimit, 
  t 
}) => {
  const { 
    text, setText, 
    status, 
    loadingMessage, 
    setTurnstileToken 
  } = useStudio();
  
  const textAreaRef = useRef(null);

  return (
    <div className="w-full md:flex-1 flex flex-col justify-end">
      <div className="bg-dark rounded-[24px] p-6 mb-4 border border-surface2 shadow-2xl relative overflow-hidden group/editor">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover/editor:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight text-text flex items-center gap-2">
              {t('studio.label')}
            </h2>
            {estimatedCost > 0 && (
              <span className="text-[10px] font-bold text-text-muted bg-surface2 px-2 py-0.5 rounded w-fit mt-2">
                {t('studio.cost')}: {estimatedCost.toLocaleString("id-ID")} Kredit
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
            {(isCappedByRequest || isCappedByQuota) && (
              <span className="text-[10px] text-terracotta font-bold mt-1 animate-pulse">
                {isCappedByRequest ? t('studio.limit_reached') : t('studio.insufficient')}
              </span>
            )}
            {!isCappedByRequest && !isCappedByQuota && isNearLimit && (
              <span className="text-[10px] text-terracotta font-bold mt-1">
                Hampir Mencapai Batas!
              </span>
            )}
          </div>
        </div>

        <textarea
          ref={textAreaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`w-full h-48 bg-dark text-text rounded-lg p-4 border border-surface2 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none resize-none transition-all relative z-10 ${(isNearLimit || isCappedByRequest || isCappedByQuota) ? "border-terracotta ring-1 ring-terracotta" : ""}`}
          placeholder={t('studio.placeholder')}
          aria-label="Teks naskah"
        />

        {user && (
          <div className="mt-2 flex justify-between items-center text-[10px] font-bold">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-text-muted">
                <span>{t('studio.length')}:</span>
                <span className={`${isCappedByRequest ? "text-terracotta" : "text-text"} font-mono`}>
                  {text.length.toLocaleString("id-ID")} / {currentMaxRequestChars.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted border-l border-surface2/30 pl-4">
                <span>{t('studio.remaining')}:</span>
                <span className={remainingCredits < 1000 ? "text-terracotta" : "text-text"}>
                  {remainingCredits.toLocaleString("id-ID")} karakter (~{Math.ceil(remainingCredits / 1000)} menit durasi)
                </span>
              </div>
            </div>
            {user.tier === 'FREE' && (
              <div className="text-terracotta bg-terracotta/5 px-2 py-0.5 rounded border border-terracotta/10">
                {t('studio.quota')}: {Math.max(0, 20 - (user.generation_count || 0))} / 20
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <VoicePicker user={user} />
        
        <button
          onClick={handleGenerate}
          disabled={status === "loading" || status === "success" || cooldown > 0}
          aria-label="Hasilkan Suara"
          className={`w-full h-[44px] rounded-xl font-bold flex flex-col justify-center items-center transition-all shadow-lg border-none cursor-pointer ${
            status === "success"
              ? "bg-green-600 text-white"
              : status === "loading"
                ? "bg-terracotta/75 text-text cursor-not-allowed"
                : (cooldown > 0)
                  ? "bg-surface2 text-text-muted cursor-not-allowed border border-surface2"
                  : "bg-terracotta hover:bg-trdark shadow-terracotta/20 text-text"
          }`}
          title="Hasilkan Suara"
        >
          <div className="flex items-center justify-center gap-1.5 text-sm whitespace-nowrap">
            {status === "idle" && cooldown === 0 && (
              isCappedByRequest ? (
                <><AlertTriangle className="w-4 h-4" /> <span>Limit</span></>
              ) : isCappedByQuota ? (
                <><AlertTriangle className="w-4 h-4" /> <span>Habis</span></>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> <span>{t('studio.generate')}</span></>
              )
            )}
            {status === "loading" && (
              <><Loader2 className="w-4 h-4 animate-spin" /> <span>{t('studio.generating')}</span></>
            )}
            {status === "success" && (
              <><Check className="w-4 h-4" /> <span>Selesai</span></>
            )}
            {cooldown > 0 && status !== "loading" && status !== "success" && (
              <span>Tunggu {cooldown}s</span>
            )}
          </div>
        </button>

        {status === "loading" && loadingMessage && (
          <div className="text-center mt-2">
             <span className="text-xs text-text-muted font-mono animate-pulse">{loadingMessage}</span>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <TurnstileWidget 
            onVerify={(token) => {
              setTurnstileToken(token);
            }}
            onError={() => {
              setTurnstileToken("");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StudioSection;
