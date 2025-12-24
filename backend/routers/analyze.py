from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import AnalysisResponse
from services.vision_service import extract_vision_metrics
from services.audio_service import extract_audio_metrics
from services.scoring_service import calculate_scores
from services.feedback_service import generate_feedback_response
from utils.file_handler import save_uploaded_video, cleanup_video
import uuid

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(file: UploadFile = File(...)):
    """Analyze uploaded video and return scores, timeline, and feedback"""
    if not file.filename.endswith('.mp4'):
        raise HTTPException(status_code=400, detail="Only MP4 files are supported")

    # Save uploaded video
    filename = f"{uuid.uuid4()}.mp4"
    video_path = save_uploaded_video(file.file, filename)

    try:
        # Extract metrics
        vision_metrics = extract_vision_metrics(video_path)
        audio_metrics = extract_audio_metrics(video_path)

        # Calculate scores
        scores = calculate_scores(vision_metrics, audio_metrics)

        # Generate feedback
        feedback = generate_feedback_response(scores, audio_metrics)

        # Mock timeline (for now, based on scores)
        timeline = []
        if scores["eye_contact"] < 6:
            timeline.append({"time": 10, "event": "Low eye contact"})
        if scores["speech_rate"] < 6:
            timeline.append({"time": 23, "event": "Fast speech rate"})

        return {
            "scores": scores,
            "timeline": timeline,
            "feedback": feedback
        }

    finally:
        # Cleanup
        cleanup_video(video_path)

@router.get("/analyze/mock", response_model=AnalysisResponse)
async def analyze_mock():
    """Return mock analysis data for testing UI"""
    return {
        "scores": {
            "posture": 7,
            "gestures": 6,
            "eye_contact": 5,
            "speech_rate": 6,
            "voice_modulation": 7,
            "global_score": 6.2
        },
        "timeline": [
            {"time": 10, "event": "Low eye contact"},
            {"time": 23, "event": "Fast speech rate"}
        ],
        "feedback": {
            "summary": "Good posture but speech is too fast.",
            "recommendations": [
                "Slow down your speaking rate",
                "Maintain eye contact",
                "Use gestures more intentionally"
            ]
        }
    }