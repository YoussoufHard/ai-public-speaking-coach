import React, { useRef, useEffect, useState } from 'react';
import Timeline from './Timeline';

const VideoPlayer = ({ videoUrl, timeline }) => {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => setDuration(video.duration);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [videoUrl]);

  const handleEventClick = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div>
      <video ref={videoRef} controls src={videoUrl} style={{ width: '100%' }} />
      <Timeline timeline={timeline} duration={duration} onEventClick={handleEventClick} />
    </div>
  );
};

export default VideoPlayer;