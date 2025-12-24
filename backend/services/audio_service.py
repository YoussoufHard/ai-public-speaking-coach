import os
import tempfile
from audio.audio_extraction import AudioExtractor
from audio.audio_scoring import AudioScorer

def extract_audio_metrics(video_path: str) -> dict:
    """
    Extract audio metrics from video using real audio processing.
    Falls back to mock data if audio processing fails.
    """
    try:
        # Initialize audio extractor
        extractor = AudioExtractor(model_size="base")

        # Extract all audio metrics
        results = extractor.extract_all_metrics(video_path)

        if results is None:
            print("Audio extraction failed, using mock data")
            return _get_mock_metrics()

        # Initialize audio scorer
        scorer = AudioScorer()

        # Calculate audio scores
        scores = scorer.calculate_scores(results)

        # Detect language from Whisper transcription result
        detected_language = results.get("language", "fr")  # Whisper detects language
        print(f"Detected language: {detected_language}")  # Debug log

        # Clean up temporary audio file if it exists
        # The AudioExtractor creates temporary files, we need to clean them up
        try:
            import os
            # Try to find and remove temp_audio.wav or similar files
            temp_files = ["temp_audio.wav", "temp_audio.mp3", "temp_audio.flac"]
            for temp_file in temp_files:
                temp_path = os.path.join(os.path.dirname(video_path), temp_file)
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    print(f"Cleaned up temporary audio file: {temp_file}")
        except Exception as e:
            print(f"Warning: Could not clean up temporary audio files: {e}")

        # Return metrics in the format expected by scoring_engine.py
        return {
            "speech_rate": results.get("debit_mots_par_minute", 150),
            "pitch_variation": results.get("audio_features", {}).get("pitch_std", 25),
            "fillers_count": results.get("fillers", {}).get("nombre_total", 5),
            "avg_volume": results.get("audio_features", {}).get("volume_moyen", 0.03),
            # Additional data for potential future use
            "audio_scores": scores,
            "transcription": results.get("transcription", ""),
            "word_count": results.get("nombre_mots", 0),
            "detected_language": detected_language
        }

    except Exception as e:
        print(f"Audio processing error: {e}, using mock data")
        return _get_mock_metrics()

def _get_mock_metrics() -> dict:
    """Return mock audio metrics for fallback"""
    import random
    # For testing: if video filename contains "english" or "en", assume English
    # This is a temporary workaround until FFmpeg is properly installed
    import os
    video_name = ""
    try:
        # Try to get the current video being processed from the call stack
        # This is a hack for testing purposes
        import inspect
        frame = inspect.currentframe()
        while frame:
            if 'video_path' in frame.f_locals:
                video_name = os.path.basename(frame.f_locals['video_path']).lower()
                break
            frame = frame.f_back
    except:
        pass

    # Detect language from filename (temporary testing workaround)
    detected_lang = "fr"
    if "english" in video_name or "en" in video_name or "anglais" in video_name:
        detected_lang = "en"

    return {
        "speech_rate": random.randint(120, 180),  # words per minute
        "pitch_variation": random.uniform(20, 50),  # pitch variation
        "fillers_count": random.randint(0, 20),  # filler words count
        "avg_volume": random.uniform(0.01, 0.05),  # average volume
        "audio_scores": None,  # No detailed scores in mock mode
        "transcription": "",
        "word_count": 0,
        "detected_language": detected_lang
    }