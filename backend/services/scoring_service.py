from scoring.scoring_engine import compute_scores
from scoring.global_score import compute_global_score

def calculate_scores(vision_metrics: dict, audio_metrics: dict) -> dict:
    """Calculate all scores from vision and audio metrics"""
    scores = compute_scores(vision_metrics, audio_metrics)
    global_score = compute_global_score(scores)

    # Return both formats: original for internal use, simplified for API
    return {
        # Original keys for feedback system compatibility
        **scores,
        "global_score": global_score,
        # Simplified keys for API response
        "posture": scores["posture_score"],
        "gestures": scores["gesture_score"],
        "eye_contact": scores["eye_contact_score"],
        "speech_rate": scores["speech_rate_score"],
        "voice_modulation": scores["voice_modulation_score"]
    }