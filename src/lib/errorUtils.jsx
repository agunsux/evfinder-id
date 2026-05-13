import { toast } from 'react-hot-toast';

export const checkResponse = async (res) => {
    if (!res.ok) {
        let errorMsg = `Server returned ${res.status}`;
        try {
            const errorData = await res.json();
            if (errorData.message) errorMsg = errorData.message;
            else if (errorData.error) errorMsg = errorData.error;
        } catch (e) {
            // Ignore if response body is not JSON
        }
        const error = new Error(errorMsg);
        error.status = res.status;
        throw error;
    }
    return res.json();
};

export const handleApiError = (error, defaultMessage = "Terjadi kesalahan.") => {
    let message = defaultMessage;
    let suggestion = "";

    if (typeof error === 'string') {
        message = error;
    } else if (error && typeof error === 'object') {
        if (error.message) {
            message = error.message;
        } else if (error.error) {
            message = error.error;
        } else if (typeof error.toString === 'function') {
            message = error.toString();
        }
    }

    // Comprehensive error categorization
    const errorStatus = error.status;
    const errorStr = message.toLowerCase();

    if (errorStatus === 401 || errorStr.includes('unauthorized')) {
        message = 'Sesi Anda telah berakhir.';
        suggestion = 'Silakan masuk kembali untuk melanjutkan.';
    } else if (errorStatus === 403 || errorStr.includes('forbidden')) {
        message = 'Anda tidak memiliki akses ke fitur ini.';
        suggestion = 'Silakan periksa langganan Anda atau hubungi support.';
    } else if (errorStatus === 404 || errorStr.includes('not found')) {
        message = 'Data yang diminta tidak ditemukan.';
        suggestion = 'Refresh halaman atau hubungi support jika masalah berlanjut.';
    } else if (errorStatus === 429 || errorStr.includes('too many requests') || errorStr.includes('rate limit')) {
        message = 'Terlalu banyak permintaan.';
        suggestion = 'Tunggu beberapa saat sebelum mencoba lagi.';
    } else if (errorStatus === 402 || errorStr.includes('insufficient credit') || errorStr.includes('balance')) {
        message = 'Kredit tidak mencukupi.';
        suggestion = 'Silakan isi ulang kredit Anda untuk melanjutkan.';
    } else if (errorStr.includes('invalid voice')) {
        message = 'Pilihan suara tidak valid.';
        suggestion = 'Silakan pilih suara yang tersedia.';
    } else if (errorStatus >= 500 || errorStr.includes('server error')) {
        message = 'Server sedang mengalami gangguan.';
        suggestion = 'Mohon tunggu beberapa menit dan coba kembali.';
    } else if (errorStr.includes('network') || errorStr.includes('failed to fetch')) {
        message = 'Koneksi internet bermasalah.';
        suggestion = 'Pastikan koneksi internet Anda stabil.';
    } else if (errorStr.includes('unexpected token') || errorStr.includes('json')) {
        message = 'Terjadi kesalahan sistem.';
        suggestion = 'Mohon coba lagi dalam beberapa saat.';
    }
    
    // Auth-specific
    if (errorStr.includes('auth/invalid-email')) {
        message = 'Format email tidak valid.';
    } else if (errorStr.includes('auth/user-not-found') || errorStr.includes("tidak terdaftar")) {
        message = 'Email tidak terdaftar.';
        suggestion = 'Pastikan email yang dimasukkan sudah benar atau lakukan daftar baru.';
    } else if (errorStr.includes('auth/wrong-password') || errorStr.includes("salah")) {
        message = 'Password salah.';
        suggestion = 'Coba masukkan kembali password yang benar.';
    } else if (errorStr.includes('auth/email-already-in-use')) {
        message = 'Email sudah terdaftar.';
        suggestion = 'Silakan login menggunakan email tersebut.';
    }

    console.error("handleApiError:", error);

    toast.error(
        <div>
            <div className="font-bold">{message}</div>
            {suggestion && <div className="text-sm mt-1 text-gray-200">{suggestion}</div>}
        </div>,
        { duration: 5000 }
    );
};
