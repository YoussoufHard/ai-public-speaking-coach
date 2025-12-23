import { useState } from 'react';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import ScoresPanel from './components/ScoresPanel';
import Feedback from './components/Feedback';
import { analyzeVideo, getMockAnalysis } from './services/api';
import './App.css';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isMockUsed, setIsMockUsed] = useState(false);

  const handleAnalyze = async (file) => {
    setVideoUrl(URL.createObjectURL(file));
    setIsMockUsed(false);
    try {
      const data = await analyzeVideo(file);
      setAnalysisData(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to mock
      const mockData = await getMockAnalysis();
      setAnalysisData(mockData);
      setIsMockUsed(true);
    }
  };

  const handleMock = async () => {
    const data = await getMockAnalysis();
    setAnalysisData(data);
    setIsMockUsed(true);
    // For mock, no video, so maybe set a placeholder
  };

  return (
    <div className="app">
      <h1>AI Public Speaking Coach</h1>
      <VideoUpload onAnalyze={handleAnalyze} />
      <button onClick={handleMock}>Use Mock Data</button>
      {isMockUsed && (
        <div style={{ color: 'orange', fontWeight: 'bold', margin: '10px 0' }}>
          ⚠️ Using mock data - Backend service is not available
        </div>
      )}
      {videoUrl && <VideoPlayer videoUrl={videoUrl} timeline={analysisData?.timeline || []} />}
      {analysisData && (
        <div className="results">
          <ScoresPanel scores={analysisData.scores} />
          <Feedback feedback={analysisData.feedback} />
        </div>
      )}
    </div>
  );
}

export default App;
