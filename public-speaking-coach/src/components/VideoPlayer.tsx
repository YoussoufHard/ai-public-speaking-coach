import React, { useRef, useState, useEffect } from 'react';

interface VideoPlayerProps {
  url: string;
  onClose?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);

  // Gérer la lecture / pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  // Avancer / Reculer de 5 secondes
  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  // Changer la vitesse (cycle entre 1x, 1.5x, 2x)
  const toggleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
      setPlaybackRate(nextSpeed);
    }
  };

  // Mise à jour de la barre de progression
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(current);
    }
  };

  return (
    <div className="relative w-full max-w-xl aspect-video rounded-[40px] overflow-hidden border-2 border-cyan-500 bg-black shadow-[0_0_50px_rgba(6,182,212,0.3)] group">
      
      <video
        ref={videoRef}
        src={url}
        autoPlay
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
      />

      {/* OVERLAY DES CONTRÔLES (apparaît au survol) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        
        {/* Barre de progression */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-cyan-500 transition-all duration-100" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Bouton Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-cyan-400 transition-colors">
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            {/* Reculer/Avancer */}
            <button onClick={() => skip(-5)} className="text-white/70 hover:text-white">-5s</button>
            <button onClick={() => skip(5)} className="text-white/70 hover:text-white">+5s</button>
          </div>

          <div className="flex items-center gap-4">
            {/* Vitesse de lecture */}
            <button 
              onClick={toggleSpeed}
              className="px-3 py-1 border border-white/30 rounded-lg text-xs font-bold text-white hover:bg-white/10"
            >
              {playbackRate}x
            </button>

            {/* Fermer / Reset (Optionnel) */}
            {onClose && (
              <button onClick={onClose} className="text-white/50 hover:text-red-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Badge "Reviewing" permanent */}
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-cyan-500/90 px-3 py-1 rounded-full shadow-lg">
        <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
        <span className="text-[10px] font-black text-black uppercase tracking-tighter">AI Processing</span>
      </div>
    </div>
  );
};

export default VideoPlayer;