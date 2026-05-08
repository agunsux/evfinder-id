/**
 * RUNGU.id - Studio Editor Core Logic
 * Focus on minimalist writing and clean SSML handling.
 */

document.addEventListener('DOMContentLoaded', () => {
    const mainEditor = document.getElementById('main-editor');
    const ssmlEditor = document.getElementById('ssml-editor');
    const proToggle = document.getElementById('pro-mode-toggle');
    const toggleDot = document.getElementById('toggle-dot');
    const contextualToolbar = document.getElementById('contextual-toolbar');
    const estTime = document.getElementById('est-time');
    const estCost = document.getElementById('est-cost');
    const generateBtn = document.getElementById('generate-btn');
    const visualizer = document.getElementById('visualizer');
    const quotaToast = document.getElementById('low-quota-toast');

    let isProMode = false;
    let selectedTextRange = null;
    let currentQuotaValue = 10000;
    let maxQuotaValue = 10000;

    // 1. PRO MODE TOGGLE
    proToggle.addEventListener('click', () => {
        isProMode = !isProMode;
        if (isProMode) {
            proToggle.classList.replace('bg-zinc-800', 'bg-brand-primary');
            toggleDot.classList.replace('left-1', 'left-7');
            toggleDot.classList.replace('bg-zinc-500', 'bg-black');
            
            // Sync content from main (clean) to SSML (raw)
            const cleanText = mainEditor.value;
            ssmlEditor.value = `<speak>\n  ${cleanText}\n</speak>`;
            
            mainEditor.classList.add('hidden');
            ssmlEditor.classList.remove('hidden');
        } else {
            proToggle.classList.replace('bg-brand-primary', 'bg-zinc-800');
            toggleDot.classList.replace('left-7', 'left-1');
            toggleDot.classList.replace('bg-black', 'bg-zinc-500');
            
            // Sync content back (naive cleaning)
            const rawSSML = ssmlEditor.value;
            const clean = rawSSML.replace(/<[^>]*>/g, '').trim();
            mainEditor.value = clean;

            ssmlEditor.classList.add('hidden');
            mainEditor.classList.remove('hidden');
        }
    });

    // 2. CONTEXTUAL TOOLBAR
    mainEditor.addEventListener('mouseup', handleTextSelection);
    mainEditor.addEventListener('keyup', handleTextSelection);

    function handleTextSelection() {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text && !isProMode) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            contextualToolbar.style.left = `${rect.left + (rect.width / 2) - (contextualToolbar.offsetWidth / 2)}px`;
            contextualToolbar.style.top = `${window.scrollY + rect.top - contextualToolbar.offsetHeight - 15}px`;
            contextualToolbar.classList.remove('hidden');
            
            selectedTextRange = {
                start: mainEditor.selectionStart,
                end: mainEditor.selectionEnd
            };
        } else {
            contextualToolbar.classList.add('hidden');
        }
    }

    // Close toolbar on click outside
    document.addEventListener('mousedown', (e) => {
        if (!contextualToolbar.contains(e.target) && e.target !== mainEditor) {
            contextualToolbar.classList.add('hidden');
        }
    });

    // 3. SSML HELPERS
    window.insertBreak = (time) => {
        const text = mainEditor.value;
        const before = text.substring(0, selectedTextRange.end);
        const after = text.substring(selectedTextRange.end);
        
        // We actually want to insert it AT the selection point
        // In clean mode, we might just store metadata or insert placeholders [PAUSE: 300ms]
        // But for this "Pro" requirement, we'll maintain the SSML hiddenly
        // Let's just insert a visual hint if strictly vanilla
        mainEditor.value = before + ` [Jeda ${time}] ` + after;
        contextualToolbar.classList.add('hidden');
        updateEstimates();
    };

    window.applyEmphasis = () => {
        const text = mainEditor.value;
        const selected = text.substring(selectedTextRange.start, selectedTextRange.end);
        const before = text.substring(0, selectedTextRange.start);
        const after = text.substring(selectedTextRange.end);
        
        mainEditor.value = before + `*${selected}*` + after; // Visual markdown-style emphasis
        contextualToolbar.classList.add('hidden');
        updateEstimates();
    };

    // 4. VOICE SELECTION
    const voiceCards = document.querySelectorAll('.voice-card');
    voiceCards.forEach(card => {
        card.addEventListener('click', () => {
            voiceCards.forEach(c => c.classList.remove('active', 'border-brand-primary'));
            voiceCards.forEach(c => c.classList.add('border-zinc-900'));
            
            card.classList.add('active', 'border-brand-primary');
            card.classList.remove('border-zinc-900');
        });
    });

    // 5. ESTIMATES & QUOTA
    function updateEstimates() {
        const charCount = mainEditor.value.length;
        estTime.textContent = (charCount / 15).toFixed(1) + 's';
        estCost.textContent = charCount.toLocaleString() + ' Karakter';
    }

    mainEditor.addEventListener('input', updateEstimates);

    // Initial Quota Simulation
    updateQuota(7500, 10000);

    function updateQuota(current, max) {
        currentQuotaValue = current;
        maxQuotaValue = max;
        const percent = (current / max) * 100;
        const bar = document.getElementById('quota-bar');
        const text = document.getElementById('quota-text');
        
        bar.style.width = `${percent}%`;
        text.textContent = `Tersisa ${current.toLocaleString()} / ${max.toLocaleString()}`;
        
        if (current < 1000) {
            quotaToast.classList.remove('hidden');
        } else {
            quotaToast.classList.add('hidden');
        }

        if (current <= 0) {
            generateBtn.disabled = true;
            generateBtn.classList.add('opacity-30', 'grayscale');
        } else {
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-30', 'grayscale');
        }
    }

    // 6. GENERATE ACTION
    generateBtn.addEventListener('click', async () => {
        const script = isProMode ? ssmlEditor.value : mainEditor.value;
        const voiceId = document.querySelector('.voice-card.active').dataset.voice;

        if (!script) return alert('Naskah kosong!');
        if (currentQuotaValue <= 0) return alert('Kuota habis! Silakan Top Up.');

        generateBtn.disabled = true;
        generateBtn.textContent = 'Memproses Suara...';
        visualizer.classList.remove('hidden');
        
        try {
            // Simulated API call to PHP handler
            const response = await fetch('api_handler.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: script,
                    voice: voiceId,
                    is_ssml: isProMode
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showResult(data.audio_url);
                updateQuota(data.remaining_quota, data.max_quota);
            } else {
                alert('Gagal: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Terjadi kesalahan koneksi server.');
        } finally {
            generateBtn.disabled = false;
            visualizer.classList.add('hidden');
            generateBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                Hasilkan Audio Premium
            `;
        }
    });

    // 7. RESULT MODAL
    const audioModal = document.getElementById('audio-modal');
    const audioPreview = document.getElementById('audio-preview');
    const downloadLink = document.getElementById('download-link');

    function showResult(url) {
        audioPreview.src = url;
        downloadLink.href = url;
        audioModal.classList.remove('hidden');
    }

    window.closeModal = () => {
        audioModal.classList.add('hidden');
        audioPreview.pause();
    };

    window.scrollToPricing = () => {
        document.getElementById('pricing-section').scrollIntoView({ behavior: 'smooth' });
    };
});
