import React from 'react';
import { Play, Download, Trash2, FolderHeart, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LibraryTab = ({ user, refreshUser }) => {
  const history = user?.history || [];

  const handlePlay = (item) => {
    toast("Fitur memutar dari history sedang dalam pengembangan.", { icon: '🚧' });
  };

  const handleDownload = (item) => {
    toast("Fitur unduh dari history sedang dalam pengembangan.", { icon: '🚧' });
  };

  const handleDelete = (item) => {
    toast("Fitur hapus history sedang dalam pengembangan.", { icon: '🚧' });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Library</h1>
          <p className="text-zinc-400 font-medium">Semua mahakarya suaramu tersimpan di sini.</p>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item, idx) => (
            <div key={idx} className="bg-surface rounded-3xl p-5 border border-surface2 hover:border-terracotta/30 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate max-w-[200px]">
                    {item.text?.substring(0, 30) || 'Audio Generation'}...
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                    <span className="text-terracotta">{item.voice.replace('shinerva-', '')}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-zinc-600">-{item.credits_used}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-4 border-t border-surface2/50">
                <button onClick={() => handlePlay(item)} className="p-2.5 bg-zinc-800 hover:bg-terracotta hover:text-white rounded-full text-zinc-300 transition-colors">
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </button>
                <button onClick={() => handleDownload(item)} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <div className="flex-1"></div>
                <button onClick={() => handleDelete(item)} className="p-2.5 hover:bg-red-500/10 rounded-full text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="w-24 h-24 bg-surface2 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderHeart className="w-10 h-10 text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Library Masih Kosong</h3>
          <p className="text-zinc-400">Buat suara pertamamu di tab Generate, dan hasilnya akan tersimpan di sini.</p>
        </div>
      )}
    </div>
  );
};

export default LibraryTab;
