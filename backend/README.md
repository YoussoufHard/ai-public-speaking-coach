# AI Public Speaking Coach - Backend API

Backend API built with FastAPI for analyzing public speaking videos using computer vision and AI feedback.

## Features

- **Video Analysis**: Upload MP4 videos for comprehensive analysis
- **Vision Metrics**: Pose detection, gesture analysis, eye contact detection
- **Audio Metrics**: Speech rate, voice modulation analysis (currently mock)
- **Scoring System**: Automated scoring for posture, gestures, eye contact, speech rate, voice modulation
- **AI Feedback**: LLM-generated personalized feedback and recommendations
- **Timeline Events**: Key moments identification during the presentation

## API Endpoints

### POST /analyze
Analyze an uploaded video file.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (MP4 video file)

**Response:**
```json
{
  "scores": {
    "posture": 7,
    "gestures": 6,
    "eye_contact": 5,
    "speech_rate": 6,
    "voice_modulation": 7,
    "global_score": 6.2
  },
  "timeline": [
    { "time": 10, "event": "Low eye contact" },
    { "time": 23, "event": "Fast speech rate" }
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
```

### GET /analyze/mock
Returns mock analysis data for UI testing.

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables (optional):
Create a `.env` file with:
```
GOOGLE_API_KEY=your_google_api_key_for_gemini
```

## Running the API

### Development
```bash
cd backend
python main.py
```

The API will be available at `http://localhost:8000`

### Production
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive Swagger documentation.

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── routers/
│   └── analyze.py          # Analysis endpoints
├── services/
│   ├── vision_service.py   # Computer vision processing
│   ├── audio_service.py    # Audio analysis (mock)
│   ├── scoring_service.py  # Score calculation
│   └── feedback_service.py # AI feedback generation
├── models/
│   └── schemas.py          # Pydantic models
└── utils/
    └── file_handler.py     # File upload handling
```

## Dependencies

- FastAPI: Web framework
- MediaPipe: Computer vision and pose detection
- OpenCV: Video processing
- Google GenAI: AI feedback generation
- Uvicorn: ASGI server

## Notes

- Audio analysis is currently mocked. Real audio processing can be implemented using libraries like `librosa` or `speech_recognition`
- The vision service downloads the MediaPipe model automatically on first use
- Videos are temporarily stored during processing and cleaned up automatically