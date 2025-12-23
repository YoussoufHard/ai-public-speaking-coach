import os
import shutil
from pathlib import Path

UPLOAD_DIR = Path("data/videos")

def save_uploaded_video(file, filename: str) -> str:
    """Save uploaded video file and return the path"""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file, buffer)
    return str(file_path)

def cleanup_video(file_path: str):
    """Remove the video file after processing"""
    if os.path.exists(file_path):
        os.remove(file_path)