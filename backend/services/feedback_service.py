from feedback.feedback_generator import generate_feedback, detect_weaknesses

def generate_feedback_response(scores: dict, audio_metrics: dict = None) -> dict:
    """Generate feedback from scores in the appropriate language"""
    # scores dict now contains both original and simplified keys
    weaknesses = detect_weaknesses(scores)
    global_score = scores["global_score"]

    # Detect language from audio metrics if available
    detected_language = "fr"  # default
    transcription = ""
    if audio_metrics:
        if "detected_language" in audio_metrics:
            lang = audio_metrics["detected_language"]
            print(f"Raw detected language from Whisper: '{lang}'")  # Debug log
            # Map Whisper language codes to our supported languages
            lang_lower = str(lang).lower()
            if lang_lower.startswith("en") or lang_lower in ["english", "eng"]:
                detected_language = "en"
            elif lang_lower.startswith("fr") or lang_lower in ["french", "fra", "français"]:
                detected_language = "fr"
            else:
                print(f"Unknown language '{lang}', defaulting to French")
                detected_language = "fr"  # fallback to French

        if "transcription" in audio_metrics:
            transcription = audio_metrics["transcription"]

    print(f"Using language for feedback: {detected_language}")  # Debug log
    feedback = generate_feedback(scores, global_score, weaknesses, transcription, detected_language)
    return feedback