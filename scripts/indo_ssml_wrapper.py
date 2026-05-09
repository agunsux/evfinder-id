import re

def convert_to_indo_ssml(text, is_serious=False, speed=1.0, pitch="0st"):
    """
    Rungu Studio - Indonesian SSML Wrapper Utility (Python Version)
    Optimized for Google Cloud Text-to-Speech
    """
    
    # 1. Normalization Logic
    normalized = text
    
    abbreviations = {
        'WIB': 'Waktu Indonesia Barat',
        'WITA': 'Waktu Indonesia Tengah',
        'WIT': 'Waktu Indonesia Timur',
        'PT': 'Perseroan Terbatas',
        'CV': 'Comanditaire Vennootschap',
        'km/jam': 'kilometer per jam',
        's.d.': 'sampai dengan',
        'Rp': 'Rupiah ',
    }
    
    for abbr, full in abbreviations.items():
        normalized = re.sub(rf'\b{abbr}\b', f'<say-as interpret-as="words">{full}</say-as>', normalized)
        
    # Wrap acronyms (ALL CAPS, 2-4 chars)
    normalized = re.sub(r'\b([A-Z]{2,4})\b', lambda m: f'<say-as interpret-as="characters">{m.group(1)}</say-as>' if '<say-as' not in m.group(0) else m.group(0), normalized)
    
    # Handle Numbers
    normalized = re.sub(r'\b(\d{1,3}(\.\d{3})*)\b', lambda m: f'<say-as interpret-as="cardinal">{m.group(1).replace(".", "")}</say-as>', normalized)

    # 2. Sentence Prosody
    # Split by delimiters but keep them
    sentences = re.split(r'([.!?])', normalized)
    
    final_ssml = ""
    
    for i in range(0, len(sentences) - 1, 2):
        sentence = sentences[i].strip()
        delimiter = sentences[i+1] if i+1 < len(sentences) else ""
        
        if not sentence: continue
        
        curr_rate = speed
        curr_pitch = pitch
        
        # Question pitch
        if delimiter == "?":
            curr_pitch = "+2st"
            
        # Serious tone
        if is_serious:
            curr_rate = 0.9 * speed
            curr_pitch = "-1st"
            
        wrapped = f'<prosody rate="{curr_rate}" pitch="{curr_pitch}">{sentence}{delimiter}</prosody>'
        
        # Human-like Pauses
        wrapped = wrapped.replace(',', ',<break time="200ms"/>')
        
        # Punchline pause
        if i >= len(sentences) - 4:
            wrapped = f'<break time="300ms"/>{wrapped}'
            
        final_ssml += wrapped
        
    return f'<speak>{final_ssml}</speak>'

# Example Usage:
# ssml = convert_to_indo_ssml("Halo PT Rungu, jam berapa sekarang WIB?", is_serious=False)
# print(ssml)
