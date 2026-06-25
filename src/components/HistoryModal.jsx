import React from 'react';
import { X, History, Loader2 } from 'lucide-react';
import { getVoiceDisplayName } from '../constants/voices';

const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null) return "-";
  if (seconds === 0) return "< 1s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const HistoryModal = ({
  historyLoading,
  history,
  setIsHistoryOpen
}) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={() => setIsHistoryOpen(false)}
      ></div>
      <div className="bg-surface border border-surface2 p-4 sm:p-6 md:p-8 rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl mx-4 max-h-[90vh] flex flex-col">
        <button
          onClick={() => setIsHistoryOpen(false)}
          className="absolute top-4 right-4 text-text-muted hover:text-text cursor-pointer bg-transparent border-none"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-8">
          <History className="w-16 h-16 text-terracotta mx-auto mb-4" />
          <h2 className="text-2xl font-black text-text">Riwayat Penggunaan</h2>
          <p className="text-text-muted text-sm mt-2">
            Daftar penggunaan kredit karakter untuk setiap suara yang dihasilkan.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {historyLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-terracotta animate-spin mb-4" />
              <p className="text-text-muted">Memuat data riwayat...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface2 text-text-muted text-xs uppercase tracking-wider">
                    <th className="py-3 font-bold">Tanggal</th>
                    <th className="py-3 font-bold">Detail Suara</th>
                    <th className="py-3 font-bold">Durasi</th>
                    <th className="py-3 font-bold">Kredit</th>
                    <th className="py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface2/50">
                  {history.map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="py-4">
                        <div className="text-text font-medium text-xs">
                          {new Date(item.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        <div className="text-text-muted text-[10px]">
                          {new Date(item.date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-text font-bold text-xs uppercase">
                          {getVoiceDisplayName(item.voice)}
                        </div>
                        <div className="text-text-muted text-[10px]">
                          {item.voice.split("-").slice(-2).join("-")}
                        </div>
                        {item.is_teaser && (
                          <span className="text-[10px] bg-terracotta/20 text-terracotta px-1.5 py-0.5 rounded italic">
                            Preview
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="text-text-muted text-xs">
                          {formatDuration(item.duration)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-text font-bold text-xs">
                          {item.credits_used?.toLocaleString("id-ID") || 0}
                        </span>
                      </td>
                      <td className="py-4 text-green-500 font-bold text-[10px] uppercase">
                        Berhasil
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted italic">Belum ada riwayat penggunaan.</p>
            </div>
          )}
        </div>
        <div className="mt-6 pt-6 border-t border-surface2 text-center">
           <button 
            onClick={() => setIsHistoryOpen(false)}
            className="bg-surface2 hover:bg-gray-700 text-text px-8 py-2.5 rounded-xl font-bold cursor-pointer border-none"
           >
             Tutup
           </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
