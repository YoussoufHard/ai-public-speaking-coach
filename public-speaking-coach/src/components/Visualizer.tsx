import React, { useRef, useEffect } from 'react';
import Timer from './Timer';
import VideoPlayer from './VideoPlayer';

interface VisualizerProps {
  isRecording: boolean;
  isUploading: boolean;
  previewUrl: string | null;
  avatarUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  seekTo?: number | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ isRecording, isUploading, previewUrl, avatarUrl, onTimeUpdate, seekTo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Remainder of camera handling moved to RecordSession to avoid resource locking issues
  useEffect(() => {
    if (isRecording && previewUrl === null && videoRef.current) {
      // In a real app, we might pass the stream as a prop,
      // but here we rely on the parent (RecordSession) to handle getUserMedia
      // and we just provide a placeholder or let the parent mount its own video.
    }
  }, [isRecording, previewUrl]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">

      {/* --- CONDITION 1 : MODE LECTURE (Replay ou Fichier Importé) --- */}
      {previewUrl ? (
        <div className="w-full h-full flex items-center justify-center">
          <VideoPlayer url={previewUrl} onTimeUpdate={onTimeUpdate} seekTo={seekTo} />
        </div>
      ) : isRecording ? (

        /* --- CONDITION 2 : MODE ENREGISTREMENT (LIVE) --- */
        /* Note: Le conteneur occupe 100% de l'espace parent sans max-width */
        <div className="relative w-full h-full bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover -scale-x-100"
          />

          {/* Badge Live Analysis stylisé */}
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/40 z-20">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></div>
            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
              Live Analysis
            </span>
          </div>

          {/* Timer en bas à gauche */}
          <div className="absolute bottom-8 left-8 z-20">
            <Timer />
          </div>
        </div>
      ) : (

        /* --- CONDITION 3 : MODE REPOS (Clean Placeholder) --- */
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-cyan-500/5">
          {/* Halo lumineux en arrière-plan */}
          <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full"></div>

          <div className="relative z-10 flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40"></div>
            </div>
            <span className="text-cyan-500/40 font-mono text-[10px] uppercase tracking-[0.4em]">System Ready</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizer;