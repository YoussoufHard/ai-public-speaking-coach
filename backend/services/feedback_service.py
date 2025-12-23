from feedback.feedback_generator import generate_feedback, detect_weaknesses

def generate_feedback_response(scores: dict) -> dict:
    """Generate feedback from scores"""
    # scores dict now contains both original and simplified keys
    weaknesses = detect_weaknesses(scores)
    global_score = scores["global_score"]
    feedback = generate_feedback(scores, global_score, weaknesses)
    return feedback