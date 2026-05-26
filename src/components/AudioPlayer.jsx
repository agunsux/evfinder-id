import React, { useRef, useEffect, useState } from 'react';
import { Pause, Play, Download, Share2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { getVoiceDisplayName } from '../constants/voices';
import { toast } from 'react-hot-toast';

const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null) return "-";
  if (seconds === 0) return "< 1s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const AudioPlayer = ({ generatedInfo, isTeaser, user }) => {
  const { audioUrl, isAudioVisible, isPlaying, setIsPlaying } = useStudio();
  const audioRef = useRef(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioUrl) {
      console.log("[AudioPlayer] audioUrl set, length:", audioUrl.length, "starts with:", audioUrl.slice(0, 30));
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => {
        console.warn("[AudioPlayer] Autoplay prevented or interrupted:", e);
        setIsPlaying(false);
      });
    } else if (audioRef.current && !isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleShare = async () => {
    if (navigator.share && audioUrl) {
      try {
        await navigator.share({
          title: 'Dengarkan suara AI dari Shinerva',
          text: 'Saya baru saja membuat suara AI super realistis menggunakan Shinerva!',
          url: audioUrl,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      toast('Tautan disalin ke clipboard!', { icon: '📋' });
      navigator.clipboard.writeText(audioUrl);
    }
  };

  if (!isAudioVisible && !audioUrl) return null;

  return (
    <div className="flex-grow flex flex-col justify-end">
      {audioUrl && (
        <audio
          key={audioUrl}
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onTimeUpdate={updateProgress}
          onLoadedMetadata={updateProgress}
            onError={(e) => {
              const error = e.target.error;
              console.error("[Audio] Playback error details:", {
                code: error?.code,
                message: error?.message,
                src: audioUrl ? audioUrl.slice(0, 50) + "..." : "<null>"
              });
            if (error?.code === 4) {
               toast.error("Format audio tidak didukung atau sumber data rusak.");
            }
          }}
          className="hidden"
        />
      )}

      {isAudioVisible && (
        <div className="bg-dark rounded-2xl p-6 border border-surface2 mb-4 shadow-xl">
          {generatedInfo && (
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-surface2/30">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Suara Dipakai</span>
                <span className="text-xs text-text font-bold">{getVoiceDisplayName(generatedInfo.voice)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Estimasi Durasi</span>
                <span className="text-xs text-text font-bold">{formatDuration(generatedInfo.duration)}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
              className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center text-text hover:bg-trdark cursor-pointer border-none flex-shrink-0 transition-transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-1" />
              )}
            </button>

            <div className="flex-1 flex flex-col gap-2">
               <div className="flex justify-between text-xs text-text-muted font-mono" aria-hidden="true">
                <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                <span>{duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
               </div>
               <div 
                  className="h-2 bg-surface2 rounded-full overflow-hidden cursor-pointer" 
                  role="slider"
                  aria-valuemin="0"
                  aria-valuemax={duration || 100}
                  aria-valuenow={currentTime}
                  aria-label="Audio progress bar"
                  tabIndex="0"
                  onClick={(e) => {
                    if(audioRef.current && duration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      audioRef.current.currentTime = percentage * duration;
                    }
                  }}>
                 <div
                   className="h-full bg-terracotta rounded-full transition-all duration-100 ease-linear"
                   style={{
                     width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                   }}
                 ></div>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface2">
            {audioUrl && !isTeaser && user ? (
                <>
                  <a
                    href={audioUrl}
                    download="shinerva-audio.mp3"
                    aria-label="Download Audio"
                    className="flex-1 bg-terracotta hover:bg-trdark text-text font-bold py-2.5 rounded-lg transition-all border-none flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Unduh
                  </a>
                  <button
                    onClick={handleShare}
                    aria-label="Share Audio"
                    className="bg-surface2 hover:bg-gray-700 text-text px-4 py-2.5 rounded-lg transition-all border border-gray-700 flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </>
            ) : (
               <button
                disabled
                aria-label="Masuk untuk Unduh Audio"
                className="w-full bg-surface2 text-text-muted font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm cursor-not-allowed"
              >
                 <Download className="w-4 h-4" /> {user ? "Preview" : "Masuk untuk Unduh"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
