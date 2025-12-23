import json
from .scoring_rules import *

def compute_scores(vision_metrics, audio_metrics):
    scores = {
        "posture_score": score_posture(vision_metrics["posture_score_raw"]),
        "gesture_score": score_gesture(vision_metrics["gesture_activity"]),
        "eye_contact_score": score_eye_contact(vision_metrics["head_orientation"]),
        "speech_rate_score": score_speech_rate(audio_metrics["speech_rate"]),
        "voice_modulation_score": score_voice_modulation(audio_metrics["pitch_variation"])
    }
    return scores


if __name__ == "__main__":
    # Mock data (en attendant l’audio réel)
    vision_metrics = {
        "posture_score_raw": 0.72,
        "gesture_activity": 1.34,
        "head_orientation": "front"
    }

    audio_metrics = {
        "speech_rate": 172,
        "fillers_count": 14,
        "avg_volume": 0.021,
        "pitch_variation": 32.5
    }

    scores = compute_scores(vision_metrics, audio_metrics)

    with open("scoring/scores_output.json", "w") as f:
        json.dump(scores, f, indent=4)

    print("Scores generated:", scores)