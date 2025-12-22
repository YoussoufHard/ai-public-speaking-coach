"""
Scoring rules for AI Public Speaking Coach
Increment 3
Group 1: Youssouf & Hajar
"""

def score_posture(posture_raw):
    if posture_raw >= 0.8:
        return 9
    elif posture_raw >= 0.6:
        return 8
    elif posture_raw >= 0.4:
        return 6
    else:
        return 4


def score_gesture(activity):
    if activity < 0.8:
        return 4  # trop peu de gestes
    elif 0.8 <= activity <= 1.5:
        return 8  # gestuelle naturelle
    elif 1.5 < activity <= 2.2:
        return 6  # un peu excessive
    else:
        return 4  # trop agitée


def score_eye_contact(direction):
    if direction == "front":
        return 8
    else:
        return 5


def score_speech_rate(rate):
    if 120 <= rate <= 160:
        return 8
    elif 100 <= rate < 120 or 160 < rate <= 180:
        return 6
    else:
        return 4


def score_voice_modulation(pitch_var):
    if pitch_var >= 40:
        return 8
    elif pitch_var >= 25:
        return 6
    else:
        return 4