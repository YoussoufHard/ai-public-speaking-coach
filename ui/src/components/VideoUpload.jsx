import React, { useState } from 'react';

const VideoUpload = ({ onAnalyze }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await onAnalyze(file);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".mp4" onChange={handleFileChange} />
      <button onClick={handleAnalyze} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Analyze Presentation'}
      </button>
    </div>
  );
};

export default VideoUpload;