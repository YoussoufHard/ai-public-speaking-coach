from scoring.scoring_engine import compute_scores
from scoring.global_score import compute_global_score

def calculate_scores(vision_metrics: dict, audio_metrics: dict) -> dict:
    """Calculate all scores from vision and audio metrics"""
    scores = compute_scores(vision_metrics, audio_metrics)
    global_score = compute_global_score(scores)

    # Return unified scores with suffix for consistency in UI
    # This prevents duplication in the dashboard
    return {
        **scores,
        "global_score": global_score
    }