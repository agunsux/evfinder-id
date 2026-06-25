import React from 'react';
import { Mail, MessageSquare, Clock } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 min-h-screen">
      <div className="bg-surface border border-surface2 p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-terracotta" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-text mb-4">Hubungi Kami</h1>
        <p className="text-text-muted mb-8 leading-relaxed">
          Punya pertanyaan tentang integrasi, kendala transaksi, atau butuh solusi kustom? Tim support Shinerva AI siap membantu Anda.
        </p>

        <div className="space-y-6 text-left max-w-md mx-auto bg-dark/40 p-6 rounded-2xl border border-surface2/50">
          <div className="flex items-start gap-4">
            <Mail className="w-5 h-5 text-terracotta mt-0.5" />
            <div>
              <p className="text-sm font-bold text-text">Email Support</p>
              <a href="mailto:support@shinerva.id" className="text-sm text-terracotta hover:underline font-medium">
                support@shinerva.id
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 border-t border-surface2/30 pt-4">
            <Clock className="w-5 h-5 text-terracotta mt-0.5" />
            <div>
              <p className="text-sm font-bold text-text">Waktu Respon (SLA)</p>
              <p className="text-sm text-text-muted">
                Kami merespon semua tiket masuk dalam waktu 24 - 48 jam kerja.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 border-t border-surface2/30 pt-4">
            <MessageSquare className="w-5 h-5 text-terracotta mt-0.5" />
            <div>
              <p className="text-sm font-bold text-text">WhatsApp Support (Alternatif)</p>
              <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="text-sm text-terracotta hover:underline font-medium">
                +62 812-3456-789
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-text-muted">
          Shinerva AI — Layanan Digital AI Text-to-Speech Indonesia.
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
