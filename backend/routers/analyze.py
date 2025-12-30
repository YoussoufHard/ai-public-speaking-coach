from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import AnalysisResponse
from services.vision_service import extract_vision_metrics
from services.audio_service import extract_audio_metrics
from services.scoring_service import calculate_scores
from services.feedback_service import generate_feedback_response
from services.tts_service import generate_tts_audio
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
        feedback_result = generate_feedback_response(scores, audio_metrics)
        feedback = feedback_result["feedback"]
        detected_language = feedback_result["detected_language"]

        # Combine Timelines (Vision + Mock Audio/Rules for now if needed)
        timeline = vision_metrics.get("timeline", [])
        
        # Add audio-based events if derived from scores (fallback logic)
        if scores["speech_rate_score"] < 6 and not any(e["event"] == "Fast speech rate" for e in timeline):
             timeline.append({"time": 5, "event": "Fast speech rate (Avg)"})

        # Sort timeline by time
        timeline.sort(key=lambda x: x["time"])

        # Generate Audio URL (Unified Feedback Audio)
        # We use the full summary and all recommendations
        recs_text = ". ".join(feedback.get("recommendations", []))
        tts_text = f"Analyse terminée. Score global : {int(scores['global_score']*10)} pourcent. {feedback.get('summary', '')}. Voici nos recommandations : {recs_text}"
        
        audio_path = generate_tts_audio(tts_text, detected_language)
        audio_url = None
        if audio_path:
            # Construct the public URL (assuming backend is at localhost:8000)
            # audio_path is 'static/audio/uuid.mp3'
            audio_url = f"http://localhost:8000/{audio_path}"

        return {
            "scores": scores,
            "timeline": timeline,
            "feedback": feedback,
            "detected_language": detected_language,
            "audio_url": audio_url
        }

    finally:
        # Cleanup
        cleanup_video(video_path)

@router.get("/analyze/mock", response_model=AnalysisResponse)
async def analyze_mock():
    """Return mock analysis data for testing UI"""
    return {
        "scores": {
            "posture_score": 7,
            "gesture_score": 6,
            "eye_contact_score": 5,
            "speech_rate_score": 6,
            "voice_modulation_score": 7,
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