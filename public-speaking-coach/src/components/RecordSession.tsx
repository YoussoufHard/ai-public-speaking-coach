import React, { useRef, useState } from 'react';
import Visualizer from './Visualizer';
import { speechService } from '../service/api';

interface RecordSessionProps {
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

const RecordSession: React.FC<RecordSessionProps> = ({ 
  isRecording, 
  setIsRecording, 
  isUploading, 
  setIsUploading 
}) => {
  // États locaux pour le replay et le dashboard
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("En attente de la parole...");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIQUE DE LECTURE (PLAYER) ---
  const triggerPlayer = (blob: Blob | File) => {
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setIsUploading(true);
  };

  // --- HANDLERS D'UPLOAD ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      triggerPlayer(file);
      try {
        await speechService.uploadRecording(file);
      } catch (error) {
        console.error("Erreur upload fichier :", error);
      }
    }
  };

  const stopMediaFlow = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  // --- MODES D'ENVOI (Adaptés pour la nouvelle interface) ---

  const startFinalRecording = async () => {
    setPreviewUrl(null);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;
    videoChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      triggerPlayer(videoBlob);
      await speechService.uploadRecording(videoBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  // Note: Vous pouvez intervertir startFinalRecording par startChunked ou startStreaming dans toggleRecording
  
  const toggleRecording = () => {
    if (isRecording) stopMediaFlow();
    else startFinalRecording();
  };

  return (
    <div className="h-full w-full flex flex-col p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* SECTION DYNAMIQUE : GRID 12 COLONNES SI RECORDING */}
      <div className={`grid gap-6 transition-all duration-700 ease-in-out h-[65vh] ${
        isRecording ? "grid-cols-12" : "grid-cols-1 justify-items-center"
      }`}>
        





        {/* CADRE VIDÉO / VISUALIZER ET BOUTON STOP */}
        <div className={`flex flex-col gap-6 transition-all duration-700 ${
          isRecording ? "col-span-8" : "w-full max-w-3xl aspect-video"
        }`}>
          <div className={`relative bg-black rounded-[32px] overflow-hidden border-4 border-white/10 shadow-2xl aspect-video w-full`}>
            <Visualizer 
              isRecording={isRecording} 
              isUploading={isUploading} 
              previewUrl={previewUrl}
              avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            />
            
            {isRecording && (
              <video 
                ref={videoPreviewRef} 
                autoPlay muted playsInline
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-0" 
              />
            )}
          </div>

          {/* BOUTON "TERMINER L'ANALYSE" - Positionné sous la vidéo uniquement en mode Recording */}
          {isRecording && (
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button 
                onClick={stopMediaFlow}
                className="bg-[#FF3B3B] text-white px-20 py-6 rounded-[30px] font-[900] uppercase tracking-tighter shadow-[0_0_30px_rgba(255,59,59,0.3)] border-b-4 border-red-800 active:scale-95 transition-all flex items-center gap-4"
              >
                <div className="w-3.5 h-3.5 bg-white rounded-sm animate-pulse"></div>
                <span className="text-xl">Terminer l'analyse</span>
              </button>
            </div>
          )}
        </div>


        

        


        {/* DASHBOARD DE DROITE (Apparaît seulement pendant l'enregistrement) */}
        {isRecording && (
          <div className="col-span-4 flex flex-col gap-6 animate-in slide-in-from-right-10 duration-500">
            
            {/* MINI AVATAR ÉCOUTEUR */}
            <div className="h-2/5 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-4 left-6 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Live Coaching</span>
              </div>
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                className="h-full object-contain relative z-10" 
                alt="Coach Avatar" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/5 group-hover:to-cyan-500/10 transition-all"></div>
            </div>

            {/* BOX DE TRANSCRIPTION */}
            <div className="flex-1 bg-black/40 backdrop-blur-md rounded-[32px] border border-white/10 p-6 flex flex-col shadow-inner">
              <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Transcription en direct</h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                <p className="text-white/80 text-sm leading-relaxed font-medium italic">
                  "{transcription}"
                </p>
              </div>
            </div>
          </div>
        )}
        
      </div>

      {/* BARRE DE CONTRÔLES (BAS) */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          {!isRecording && (
          <button 
            onClick={toggleRecording}
            disabled={isUploading && !isRecording} // Désactivé seulement pendant l'upload, pas pendant la lecture du player
            className={`px-12 py-5 rounded-[24px] font-black tracking-tighter transition-all duration-500 transform hover:scale-105 shadow-2xl flex items-center gap-4 ${
              isRecording 
              ? 'bg-red-500 text-white shadow-red-500/40 ring-4 ring-red-500/20' 
              : 'bg-cyan-500 text-black shadow-cyan-500/30 hover:shadow-cyan-400/50'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-black'}`}></div>
            <span className="text-lg">
              {isRecording ? "TERMINER L'ANALYSE" : "DÉMARRER LE COACHING"}
            </span>
          </button>
          )}

          
          {!isRecording && !isUploading && (
            <div className="relative group">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-[24px] bg-white/5 text-white border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 shadow-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {!isRecording&&
        (
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold">
            Enregistrer ou importer une vidéo pour l'analyse
        </p>
        )}

       
      </div>
    </div>
  );
};

export default RecordSession;