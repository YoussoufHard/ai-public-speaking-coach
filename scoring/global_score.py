import json

def compute_global_score(scores):
    """
    Compute global score from individual scores
    Weights: posture 30%, gesture 25%, eye_contact 15%, voice 30% (avg of speech_rate and voice_modulation)
    """
    voice_avg = (scores["speech_rate_score"] + scores["voice_modulation_score"]) / 2
    global_score = (
        scores["posture_score"] * 0.3 +
        scores["gesture_score"] * 0.25 +
        scores["eye_contact_score"] * 0.15 +
        voice_avg * 0.3
    )
    return round(global_score, 1)

if __name__ == "__main__":
    # Load scores from scores_output.json
    with open("scoring/scores_output.json", "r") as f:
        scores = json.load(f)

    global_score = compute_global_score(scores)

    result = {"global_score": global_score}

    with open("scoring/global_score.json", "w") as f:
        json.dump(result, f, indent=4)

    print("Global score computed:", result)