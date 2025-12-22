from scoring_engine import compute_scores

vision_test = {
    "posture_score_raw": 0.5,
    "gesture_activity": 2.0,
    "head_orientation": "left"
}

audio_test = {
    "speech_rate": 190,
    "fillers_count": 20,
    "avg_volume": 0.015,
    "pitch_variation": 18
}

scores = compute_scores(vision_test, audio_test)
print(scores)