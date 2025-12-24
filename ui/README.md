# AI Public Speaking Coach - Frontend

A modern React frontend for analyzing public speaking videos using AI-powered feedback and scoring.

## 🚀 Features

- **Video Upload**: Upload MP4 videos for analysis
- **Real-time Analysis**: Get instant feedback on presentation skills
- **Interactive Video Player**: HTML5 video player with annotated timeline
- **Scoring Dashboard**: Detailed scores across multiple categories
- **Actionable Feedback**: Summary and 3 key recommendations
- **Mock Data Support**: Test functionality without backend dependency

## 🛠️ Tech Stack

- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API communication
- **HTML5 Video** - Native video playback
- **CSS3** - Simple, responsive styling

## 📁 Project Structure

```
ui/
├── src/
│   ├── components/
│   │   ├── VideoUpload.jsx    # File upload interface
│   │   ├── VideoPlayer.jsx    # Video player with timeline
│   │   ├── Timeline.jsx       # Interactive event timeline
│   │   ├── ScoresPanel.jsx    # Scoring results display
│   │   └── Feedback.jsx       # Feedback and recommendations
│   ├── services/
│   │   └── api.js            # API communication layer
│   ├── App.jsx               # Main application component
│   ├── App.css               # Application styles
│   └── main.jsx              # Application entry point
├── public/
└── package.json
```

## 🔧 Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

## 🎯 How It Works

### 1. Video Upload
- Select an MP4 video file using the file input
- Click "Analyze Presentation" to start analysis
- The app communicates with the backend API at `http://localhost:8000`

### 2. Analysis Process
- **Real Analysis**: Sends video to `/analyze` endpoint for full AI processing
- **Mock Mode**: Falls back to `/analyze/mock` if backend unavailable
- **Warning Display**: Shows orange warning when using mock data

### 3. Results Display
- **Video Player**: Displays uploaded video with interactive timeline
- **Timeline Events**: Click red markers to jump to specific moments
- **Scores Panel**: Shows detailed scores by category (Posture, Eye Contact, etc.)
- **Global Score**: Highlighted overall performance score
- **Feedback Section**: Summary text + 3 actionable recommendations

### 4. API Integration

The frontend consumes JSON data from the backend:

```javascript
// Real analysis
POST /analyze
Content-Type: multipart/form-data
Body: { file: videoFile }

// Mock data
GET /analyze/mock

// Response format
{
  "scores": {
    "Posture": 8.5,
    "Eye Contact": 7.2,
    "global": 8.0
  },
  "timeline": [
    { "time": 15, "event": "Good posture maintained" },
    { "time": 45, "event": "Eye contact improved" }
  ],
  "feedback": {
    "summary": "Overall good presentation...",
    "recommendations": [
      "Maintain consistent eye contact",
      "Use more hand gestures",
      "Practice pacing"
    ]
  }
}
```

## 🔄 Component Architecture

- **App.jsx**: State management and component orchestration
- **VideoUpload**: Handles file selection and analysis trigger
- **VideoPlayer + Timeline**: Synchronized video playback with event markers
- **ScoresPanel**: Data visualization for scoring results
- **Feedback**: Structured display of AI-generated advice

## 🚨 Error Handling

- **Backend Unavailable**: Automatic fallback to mock data
- **User Notification**: Clear warning when mock mode is active
- **Loading States**: Button states during analysis
- **File Validation**: MP4 format restriction

## 🎨 Styling

Simple, responsive CSS with:
- Flexbox layout for results panels
- Basic button and form styling
- Warning message styling for mock mode
- Mobile-friendly design

## 🔗 Backend Integration

This frontend is designed to work with the FastAPI backend running on port 8000. The API specification is available in `../backend/api_spec.json`.

## 📝 Development

- Built with modern React hooks and functional components
- No external UI libraries - pure React + CSS
- Hot module replacement during development
- ESLint configuration for code quality

## 🚀 Deployment

Build for production:
```bash
npm run build
```

Serve the `dist/` folder with any static server.
