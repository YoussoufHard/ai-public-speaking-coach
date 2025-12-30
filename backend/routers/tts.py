from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.tts_service import generate_tts_audio
from fastapi.responses import FileResponse
import os

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    lang: str = "fr"

@router.post("/tts")
async def get_tts_audio(request: TTSRequest):
    """Generate and stream audio file"""
    file_path = generate_tts_audio(request.text, request.lang)
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="Failed to generate audio")

    # Return as file for immediate playback
    # Using media_type="audio/mpeg"
    return FileResponse(file_path, media_type="audio/mpeg", filename="speech.mp3")
