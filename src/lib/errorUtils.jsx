import { toast } from 'react-hot-toast';

export const checkResponse = async (res, retryCount = 0, optionsOrMethod = 'GET') => {
    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const isBackend = res.headers.get("x-backend-server") === "Shinerva";

    // If we get HTML from an API route with 200 status, it's likely the "Starting Server" infrastructure page.
    // Also retry on 503 Service Unavailable which often happens during cold starts.
    const isRetryableError = res.status === 503;
    let text = "";
    if (res.ok && !isJson) {
        try {
            text = await res.clone().text();
        } catch (e) {
            console.warn("[checkResponse] Clone failed:", e);
        }
    }
    
    // Robust API route detection
    const urlStr = (res.url || "").toLowerCase();
    const isApiRoute = urlStr.includes("/api/") || urlStr.includes("/api?") || urlStr.includes("/api");

    const textLower = text.toLowerCase();
    const isHtml = textLower.includes("<html") || textLower.includes("<!doctype") || textLower.includes("<head") || textLower.includes("<body") || textLower.includes("<title");
    const isStartingPage = (res.ok || res.status === 200) && !isJson && (textLower.includes("starting server") || textLower.includes("starting container") || textLower.includes("wait while your application starts") || isHtml);

    // Critical check: if it's an API route but NOT our backend, it's intercepted by the infrastructure
    const isIntercepted = isApiRoute && !isBackend;

    if ((isStartingPage || isRetryableError || isIntercepted) && isApiRoute && retryCount < 100) {
        const platformReason = isRetryableError ? '503 Service Unavailable' : (isIntercepted ? 'Platform Interception (Missing X-Backend-Server)' : 'Infrastructure Starting Page (HTML 200)');
        const waitTime = retryCount < 5 ? 6000 : 4000;
        console.warn(`[API Retry] ${platformReason} at ${res.url}. Wait ${waitTime}ms... (Attempt ${retryCount + 1}/100)`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Handle optionsOrMethod
        const fetchOptions = typeof optionsOrMethod === 'string' ? { method: optionsOrMethod } : optionsOrMethod;
        
        try {
            const retryRes = await fetch(res.url, fetchOptions);
            return checkResponse(retryRes, retryCount + 1, optionsOrMethod);
        } catch (err) {
            console.error(`[API Retry] Network error fetching ${res.url}:`, err);
            await new Promise(resolve => setTimeout(resolve, 6000));
            const fakeRes = {
                ok: false,
                status: 503,
                url: res.url,
                headers: new Headers(),
                text: () => Promise.resolve("Network Error"),
                json: () => Promise.resolve({ error: "Network Error" })
            };
            return checkResponse(fakeRes, retryCount + 1, optionsOrMethod);
        }
    }

    if (!res.ok) {
        let errorMsg = `Server returned ${res.status} for ${res.url}`;
        let errorData = null;
        if (isJson) {
            try {
                errorData = await res.json();
                if (errorData.message) errorMsg = errorData.message;
                else if (errorData.error) errorMsg = errorData.error;
            } catch (e) {
                // Ignore
            }
        } else {
            const bodyText = await res.text();
            console.error(`Non-JSON error response from ${res.url} (isApiRoute: ${isApiRoute}, isBackend: ${isBackend}, isIntercepted: ${isIntercepted}):`, bodyText.slice(0, 200));
        }
        const error = new Error(errorMsg);
        error.status = res.status;
        error.data = errorData;
        throw error;
    }

    if (!isJson) {
        const bodyText = await res.text();
        const textLow = bodyText.toLowerCase();
        
        // Re-check for starting page here just in case it escaped detection above
        const isDefinitelyStarting = textLow.includes("starting server") || textLow.includes("starting container") || textLow.includes("wait while") || (textLow.includes("<html") && textLow.includes("<title"));

        if ((isDefinitelyStarting || !isBackend) && isApiRoute && retryCount < 100) {
            console.warn(`[API Emergency Retry] Deep inspection found non-JSON infrastructure page on ${res.url}. Retrying... (Attempt ${retryCount + 1}/100)`);
            await new Promise(resolve => setTimeout(resolve, 6000));
            const fetchOptions = typeof optionsOrMethod === 'string' ? { method: optionsOrMethod } : optionsOrMethod;
            try {
               const retryRes = await fetch(res.url, fetchOptions);
               return checkResponse(retryRes, retryCount + 1, optionsOrMethod);
            } catch (e) {
               console.error("[API Emergency Retry] Failed:", e);
            }
        }

        console.error(`Unexpected non-JSON response from ${res.url} (Status: ${res.status}, Attempt: ${retryCount}, isApiRoute: ${isApiRoute}, isBackend: ${isBackend}, isStartingPage: ${isStartingPage}):`, bodyText.slice(0, 200));
        
        if (res.status === 503 || bodyText.includes("Starting Server")) {
             throw new Error("Layanan sedang dipersiapkan atau infrastruktur sedang sibuk. Silakan tunggu sebentar dan segarkan halaman.");
        }
        
        throw new Error(`Sistem menerima respon yang tidak valid (Bukan JSON, Status: ${res.status}, isBackend: ${isBackend}). Silakan coba lagi.`);
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
    const errorStatus = (error && typeof error === 'object') ? (error.status || error.data?.status) : null;
    const errorStr = (message || "").toLowerCase();
    
    console.error("handleApiError DEBUG:", { message, errorStatus, error });

    if (errorStatus === 401 || errorStr.includes('unauthorized') || errorStr.includes('api key')) {
        message = 'Masalah Autentikasi / API Key.';
        suggestion = 'Pastikan Anda sudah login dan GOOGLE_API_KEY atau GEMINI_API_KEY sudah benar.';
    } else if (errorStatus === 403 || errorStr.includes('forbidden')) {
        message = 'Anda tidak memiliki akses ke fitur ini.';
        suggestion = 'Silakan periksa langganan Anda atau hubungi support.';
    } else if (errorStatus === 404 || errorStr.includes('not found')) {
        message = `Data tidak ditemukan (Status: ${errorStatus})`;
        suggestion = 'Pastikan URL benar atau hubungi support.';
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
    } else if (errorStr.includes('network') || errorStr.includes('failed to fetch') || errorStr.includes('network-request-failed')) {
        if (typeof window !== 'undefined' && !window.navigator.onLine) {
            message = 'Koneksi internet terputus (Offline).';
            suggestion = 'Silakan periksa koneksi WiFi atau paket data Anda.';
        } else if (errorStr.includes('auth') || errorStr.includes('sign-in')) {
            message = 'Autentikasi Gagal (Network Error).';
            suggestion = 'Browser Anda mungkin memblokir popup/cookie di dalam preview. Silakan buka aplikasi di tab baru (klik ikon panah di pojok kanan atas) untuk login.';
        } else {
            message = 'Gagal menghubungi server.';
            suggestion = 'Pastikan koneksi stabil. Jika masalah berlanjut, coba refresh halaman atau buka di tab baru.';
        }
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

    toast.error(
        <div>
            <div className="font-bold">{message}</div>
            {suggestion && <div className="text-sm mt-1 text-gray-200">{suggestion}</div>}
        </div>,
        { duration: 5000 }
    );
};
