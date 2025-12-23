import random

def extract_audio_metrics(video_path: str) -> dict:
    """Extract audio metrics from video (mock implementation)"""
    # Mock audio metrics
    return {
        "speech_rate": random.randint(120, 180),  # words per minute
        "pitch_variation": random.uniform(20, 50),  # pitch variation
        "fillers_count": random.randint(0, 20),  # filler words count
        "avg_volume": random.uniform(0.01, 0.05)  # average volume
    }