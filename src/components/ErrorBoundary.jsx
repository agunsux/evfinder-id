import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-surface text-center rounded-2xl border border-surface2">
          <AlertTriangle className="w-12 h-12 text-terracotta mb-4" />
          <h2 className="text-xl font-bold text-text mb-2">Terjadi Kesalahan Tidak Terduga</h2>
          <p className="text-text-muted text-sm mb-6 max-w-md">
            Komponen ini mengalami masalah saat dimuat. Coba muat ulang halaman atau hubungi dukungan jika masalah berlanjut.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-trdark transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Muat Ulang Halaman</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
