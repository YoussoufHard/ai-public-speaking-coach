import React, { useRef, useEffect } from 'react';
import Timer from './Timer'; 
import VideoPlayer from './VideoPlayer'; // <--- C'EST ICI QU'ON L'IMPORTE

interface VisualizerProps {
  isRecording: boolean;
  isUploading: boolean;    // Nouvelle prop transmise par RecordSession
  previewUrl: string | null; // Nouvelle prop transmise par RecordSession
  avatarUrl: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isRecording, isUploading, previewUrl, avatarUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    // On n'active la caméra que si on enregistre ET qu'on n'est pas en train de lire une vidéo
    if (isRecording && !isUploading) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch((err) => console.error("Accès caméra refusé", err));
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isRecording, isUploading]);

  return (
    <div className="relative z-10 w-full flex justify-center transition-all duration-500 scale-110">
      
      {/* CONDITION 1 : MODE LECTURE (Après enregistrement ou Import) */}
      {isUploading && previewUrl ? (
        <VideoPlayer url={previewUrl} />
      ) : isRecording ? (
        /* CONDITION 2 : MODE ENREGISTREMENT (LIVE) */
        <div className="relative w-full max-w-xl aspect-video rounded-[40px] overflow-hidden border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)] bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover -scale-x-100" 
          />
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-red-500/40">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Live Analysis</span>
          </div>
          <div className="absolute bottom-6 left-6">
            <Timer />
          </div>
        </div>
      ) : (
        /* CONDITION 3 : MODE REPOS (AVATAR) */
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full"></div>
          <img src={avatarUrl} className="relative w-80 h-80 object-contain" alt="Avatar" />
        </div>
      )}
    </div>
  );
};

export default Visualizer;