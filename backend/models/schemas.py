from pydantic import BaseModel
from typing import List, Dict, Any

class TimelineEvent(BaseModel):
    time: float
    event: str

class Feedback(BaseModel):
    summary: str
    recommendations: List[str]

class AnalysisResponse(BaseModel):
    scores: Dict[str, float]
    timeline: List[TimelineEvent]
    feedback: Feedback
    detected_language: str = "fr"
    audio_url: str = None