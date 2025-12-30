# AI Public Speaking Coach - Project Analysis & Demo Script

## Project Overview

The AI Public Speaking Coach is an innovative application that analyzes public speaking performances through video recordings, providing real-time feedback and scoring to help users improve their presentation skills. The system combines computer vision for body language analysis, speech recognition for content evaluation, and AI-powered feedback generation with text-to-speech capabilities.

## Architecture Overview

### Backend (Python/FastAPI)

**Main Components:**
- **FastAPI Server** (`backend/main.py`): REST API with CORS enabled, serving static files and handling video analysis requests
- **Routers**: `/analyze` for video processing, `/tts` for text-to-speech generation
- **Services Layer**: Modular architecture for vision, audio, scoring, feedback, and TTS processing

**Key Services:**

#### Vision Service (`backend/services/vision_service.py`)
- Uses **MediaPipe Pose Landmarker** for real-time pose detection
- Analyzes posture, gesture activity, and head orientation
- Generates timeline events for poor posture, dynamic/static body language
- Processes video frames at 30fps, limited to 900 frames for performance

#### Audio Service (`backend/services/audio_service.py`)
- Leverages **OpenAI Whisper** for speech transcription and language detection
- Extracts metrics: speech rate (words/minute), pitch variation, filler words count, average volume
- Supports multiple languages with automatic detection
- Falls back to mock data if processing fails

#### Scoring Service (`backend/services/scoring_service.py`)
- Combines vision and audio metrics into performance scores
- Categories: posture, gesture, eye contact, speech rate, voice modulation
- Calculates global score as weighted average
- Uses rule-based scoring engine (`scoring/scoring_engine.py`)

#### Feedback Service (`backend/services/feedback_service.py`)
- Generates contextual feedback in detected language (French/English)
- Provides summary and actionable recommendations
- Adapts language based on audio analysis

#### TTS Service (`backend/services/tts_service.py`)
- Uses **Google Text-to-Speech (gTTS)** for audio feedback generation
- Supports multiple languages
- Saves audio files to static directory for serving

### Frontend (React/TypeScript)

**Main UIs:**
1. **Public Speaking Coach** (`public-speaking-coach/`): Full-featured application with 3D avatar
2. **Simple UI** (`ui/`): Basic interface for testing
3. **Avatar Demo** (`avatart/`): Avatar-focused demonstration

**Key Components:**

#### RecordSession (`public-speaking-coach/src/components/RecordSession.tsx`)
- Real-time video recording with MediaRecorder API
- File upload support for existing videos
- Live transcription display during recording
- Integrated 3D avatar for feedback delivery

#### Dashboard (`public-speaking-coach/src/components/Dashboard.tsx`)
- Overview with mock metrics and 3D avatar display
- Glass morphism UI design with cyan accent colors

#### AnalysisResults (`public-speaking-coach/src/components/AnalysisResults.tsx`)
- Displays AI feedback summary and recommendations
- TTS playback controls for audio feedback
- Timeline visualization for performance events

#### RealisticAvatarIntegrated (`public-speaking-coach/src/components/RealisticAvatarIntegrated.tsx`)
- Three.js powered 3D avatar with facial animations
- Synchronizes with TTS audio playback
- Multiple animation states: idle, talking, thinking, thankful

## Data Flow

```
1. Video Input
   ├── Live Recording (MediaRecorder API)
   └── File Upload (.mp4 files)

2. Backend Processing
   ├── Vision Analysis: MediaPipe → Pose metrics → Timeline events
   ├── Audio Analysis: Whisper → Transcription + Speech metrics
   ├── Scoring: Combine metrics → Performance scores (0-10 scale)
   ├── Feedback: Generate summary + recommendations in detected language
   └── TTS: Convert feedback to speech audio

3. Frontend Display
   ├── Video playback with timeline markers
   ├── Score visualization (radial charts)
   ├── AI feedback with TTS controls
   └── 3D avatar speaking feedback
```

## Technologies Used

### AI/ML Frameworks
- **MediaPipe**: Real-time pose detection and tracking
- **OpenAI Whisper**: Speech recognition and language detection
- **Google TTS**: Text-to-speech synthesis

### Backend Stack
- **FastAPI**: High-performance async web framework
- **OpenCV**: Video processing and frame extraction
- **NumPy**: Numerical computations for pose analysis
- **FFmpeg**: Audio extraction from video (via audio processing libraries)

### Frontend Stack
- **React 18**: Component-based UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Three.js**: 3D graphics and avatar rendering
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Python 3.8+**: Backend runtime
- **Node.js 16+**: Frontend build environment
- **MediaRecorder API**: Browser-based video recording
- **WebRTC**: Real-time media streaming

## Key Features

### Multi-Modal Analysis
- **Body Language**: Posture, gestures, head orientation tracking
- **Speech Analysis**: Rate, pitch variation, filler words, volume
- **Language Detection**: Automatic French/English recognition

### Real-Time Processing
- Live video recording with instant analysis
- Streaming transcription during recording
- Immediate feedback generation

### Interactive Feedback
- 3D animated avatar delivering personalized advice
- Text-to-speech audio feedback
- Timeline-based performance review
- Actionable improvement recommendations

### User Experience
- Modern glass morphism design
- Responsive layout for different screen sizes
- Intuitive navigation with sidebar
- Real-time visual feedback during recording

## Setup Instructions

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
# Server runs on http://localhost:8000
```

### Frontend Setup
```bash
cd public-speaking-coach
npm install
npm run dev
# App runs on http://localhost:5173
```

### Model Downloads
- MediaPipe pose model downloads automatically
- Whisper model uses base size for performance
- Ensure stable internet for initial model downloads

## Demo Script (7 Minutes)

### Introduction (1 minute)
"Bonjour à tous ! Aujourd'hui, je vais vous présenter notre projet innovant : l'AI Public Speaking Coach. Cette application révolutionne l'apprentissage des compétences en prise de parole en public grâce à l'intelligence artificielle."

*[Show project logo and main interface]*

"Imaginez un coach personnel qui analyse votre présentation en temps réel, évalue votre langage corporel, votre débit de parole, et vous donne des conseils personnalisés via un avatar 3D animé."

### Architecture Overview (1.5 minutes)
"Regardons d'abord l'architecture technique de notre système."

*[Show architecture diagram]*

"Le backend, développé en Python avec FastAPI, traite les vidéos uploadées. Il utilise MediaPipe pour analyser les poses du corps, Whisper pour transcrire et analyser la parole, puis génère des scores et des feedbacks personnalisés."

"Le frontend React avec TypeScript offre une interface moderne avec un avatar 3D créé avec Three.js qui parle les conseils d'amélioration."

### Live Demo - Recording (2 minutes)
"Passons maintenant à une démonstration en direct. Je vais enregistrer une courte présentation."

*[Click "Démarrer le Coaching"]*

*[Record a 30-second presentation about the project]*

"Comme vous pouvez le voir, l'application enregistre ma vidéo en temps réel et affiche une transcription live. L'avatar dans le coin droit reste en attente."

### Analysis Results (1.5 minutes)
"Une fois l'enregistrement terminé, l'IA analyse automatiquement la performance."

*[Show analysis completing]*

"Regardez les résultats : le système a détecté mon langage corporel, analysé mon débit de parole, et généré un score global. Ici nous avons 7.2/10."

*[Point to score visualization]*

"L'avatar va maintenant me donner des conseils personnalisés en français, ma langue détectée automatiquement."

*[Click "Écouter l'analyse" - avatar speaks feedback]*

### Key Features Showcase (1 minute)
"Parmi les fonctionnalités clés :

1. Analyse multi-modale : corps et voix
2. Feedback en temps réel avec avatar 3D
3. Détection automatique de langue
4. Chronologie des événements de performance
5. Recommandations actionnables"

*[Navigate through different sections]*

"Et voici le tableau de bord avec des métriques générales et l'avatar en mode veille."

### Conclusion (30 seconds)
"En conclusion, l'AI Public Speaking Coach démocratise l'accès à un coaching professionnel en prise de parole. Grâce aux technologies d'IA les plus avancées, il offre une expérience immersive et personnalisée."

*[Show final interface]*

"Merci pour votre attention ! Des questions ?"

---

*Total: 7 minutes exactly*

## Future Enhancements

- Real-time analysis during recording (currently post-processing only)
- Advanced emotion detection from facial expressions
- Integration with presentation slides analysis
- Multi-speaker conversation analysis
- Cloud deployment and scalability improvements
- Mobile application development

## Technical Challenges Solved

1. **Real-time Video Processing**: Optimized MediaPipe pipeline for 30fps analysis
2. **Multi-language Support**: Automatic language detection and feedback generation
3. **Avatar Synchronization**: Timing TTS audio with 3D animations
4. **Browser Compatibility**: MediaRecorder API with multiple codec fallbacks
5. **Performance Optimization**: Frame limiting and async processing for smooth UX