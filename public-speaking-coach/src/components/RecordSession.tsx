import React, { useRef } from 'react';
import Visualizer from './Visualizer';
import { speechService } from '../service/api';

interface RecordSessionProps {
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  isUploading :boolean,
   setIsUploading: (value : boolean)=>void;
}

const RecordSession: React.FC<RecordSessionProps> = ({ isRecording, setIsRecording,isUploading,setIsUploading }) => {
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Pour la fermeture physique
  const videoChunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);






// fonction pour dechencher la lecture de video 
// --- FONCTION POUR DÉCLENCHER LE PLAYER ---
  const triggerPlayer = (blob: Blob | File) => {
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setIsUploading(true); // Active l'affichage du VideoPlayer dans le Visualizer
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      triggerPlayer(file); // Lancement immédiat de la lecture
      try {
        const result = await speechService.uploadRecording(file);
        console.log("Analyse du fichier réussie :", result);
      } catch (error) {
        console.error("Erreur upload :", error);
      }
    }
  };

  /*

  // la fonction importer un fichier local :


const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    try {
      console.log("Fichier sélectionné :", file.name);
      // On utilise la même méthode d'envoi final que pour l'enregistrement
      const result = await speechService.uploadRecording(file);
      console.log("Analyse du fichier réussie :", result);
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier :", error);
    }
  }
};
*/




  // --- FONCTION DE FERMETURE COMMUNE ---
  const stopMediaFlow = () => {
    // 1. Stopper l'enregistreur
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // 2. Stopper la WebSocket si elle existe
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    // 3. FERMETURE PHYSIQUE : Stopper tous les tracks (Caméra + Micro)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Track ${track.kind} stoppé`);
      });
      streamRef.current = null;
    }

    // 4. Nettoyer l'interface
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    
    setIsRecording(false);
  };

  
  // --- MODE 1: ENVOI FINAL ---
  const startFinalRecording = async () => {
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
      try {
        const result = await speechService.uploadRecording(videoBlob);
        console.log("Analyse finale reçue :", result);
      } catch (err) {
        console.error("Erreur envoi final :", err);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  // --- MODE 2: ENVOI PAR LOTS (CHUNKS) ---
  const startChunkedRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && isRecording) {
        await speechService.uploadChunk(event.data); 
        console.log("Chunk vidéo envoyé");
      }
    };

    mediaRecorder.start(3000); 
    setIsRecording(true);
  };

  // --- MODE 3: TEMPS RÉEL (WEB SOCKET) ---
  const startStreamingVideo = () => {
    socketRef.current = new WebSocket('ws://localhost:5000/video-stream');
    
    socketRef.current.onopen = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

      mediaRecorder.start(100); 
      setIsRecording(true);
    };

    socketRef.current.onmessage = (e) => console.log("Direct :", JSON.parse(e.data));
  };

  // --- TOGGLE PRINCIPAL ---
  const toggleRecording = () => {
    if (isRecording) {
      stopMediaFlow();
    } else {
      // Choisis ici la méthode que tu veux activer au clic
      startFinalRecording(); 
      // startChunkedRecording();
      // startStreamingVideo();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 space-y-10">
      <div className="relative w-full max-w-2xl aspect-video bg-black rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
        <video 
          ref={videoPreviewRef} 
          autoPlay 
          muted 
          playsInline
          className="w-full h-full object-cover scale-x-[-1]" 
        />
        {!isRecording && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <Visualizer isRecording={false} avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
           </div>
        )}
      </div>

  <div className="flex flex-col items-center gap-6">
  <div className="flex flex-row items-center gap-4">
    
    {/* BOUTON ENREGISTRER */}
    <button 
      onClick={toggleRecording}
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

    {/* BOUTON UPLOADER AVEC BULLE STYLISÉE */}
    {!isRecording && (
      <div className="relative group"> {/* "group" est essentiel ici */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="video/*" 
          className="hidden" 
        />
        
        {/* LA BULLE (Tooltip) */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-black/80 backdrop-blur-md text-cyan-400 text-xs font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-y-[-5px] transition-all duration-300 pointer-events-none border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          UPLOADER UNE VIDÉO EXISTANTE
          {/* Petite flèche en bas de la bulle */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/80"></div>
        </div>

        {/* LE BOUTON */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-5 rounded-[24px] bg-white/5 text-white border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 shadow-xl flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
      </div>
    )}
  </div>

  <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold">
    {isRecording ? "Analyse en direct..." : "Enrégistrer ou importer une vidéo pour l'analyse"}
  </p>
</div>
    </div>
  );
};

export default RecordSession;