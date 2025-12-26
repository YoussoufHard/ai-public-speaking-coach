import React, { useRef, useEffect } from 'react';
import Timer from './Timer'; 
import VideoPlayer from './VideoPlayer';

interface VisualizerProps {
  isRecording: boolean;
  isUploading: boolean;
  previewUrl: string | null;
  avatarUrl: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isRecording, isUploading, previewUrl, avatarUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    // On n'active la caméra ici que si on veut un retour vidéo interne au Visualizer
    if (isRecording && !isUploading) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch((err) => console.error("Accès caméra refusé", err));
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording, isUploading]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      
      {/* --- CONDITION 1 : MODE LECTURE (Replay ou Fichier Importé) --- */}
      {isUploading && previewUrl ? (
        <div className="w-full h-full flex items-center justify-center">
          <VideoPlayer url={previewUrl} />
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
        
        /* --- CONDITION 3 : MODE REPOS (AVATAR) --- */
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-transparent to-cyan-500/5">
          {/* Halo lumineux en arrière-plan */}
          <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full"></div>
          
          <img 
            src={avatarUrl} 
            className="relative h-3/4 w-auto object-contain transition-transform duration-700 hover:scale-105" 
            alt="AI Coach Avatar" 
          />
        </div>
      )}
    </div>
  );
};

export default Visualizer;