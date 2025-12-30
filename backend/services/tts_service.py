from gtts import gTTS
import os
import uuid

AUDIO_TEMP_DIR = "static/audio"

# Ensure directory exists
if not os.path.exists(AUDIO_TEMP_DIR):
    os.makedirs(AUDIO_TEMP_DIR)

def generate_tts_audio(text: str, lang: str = 'fr') -> str:
    """
    Generate TTS audio from text using gTTS.
    Returns the path to the generated file.
    """
    try:
        print(f"--- TTS Generation Start ---")
        print(f"Text length: {len(text)} characters")
        print(f"Language: {lang}")
        
        # Ensure directory is writable/exists every time just in case of disk mounts or similar
        if not os.path.exists(AUDIO_TEMP_DIR):
            os.makedirs(AUDIO_TEMP_DIR)
            print(f"Created missing directory: {AUDIO_TEMP_DIR}")

        # Generate unique filename
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(AUDIO_TEMP_DIR, filename)

        # Generate audio - explicitly use gTTS
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(filepath)
        
        if os.path.exists(filepath):
            file_size = os.path.getsize(filepath)
            print(f"SUCCESS: TTS saved to {filepath} ({file_size} bytes)")
            return filepath
        else:
            print("ERROR: tts.save() finished but file NOT found on disk")
            return None
            
    except Exception as e:
        print(f"CRITICAL ERROR generating TTS: {str(e)}")
        import traceback
        traceback.print_exc()
        return None
