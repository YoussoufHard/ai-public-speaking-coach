import React, { useRef, useState, Suspense } from 'react';
import Visualizer from './Visualizer';
import AnalysisResults from './AnalysisResults';
import TimelineComponent from './TimelineComponent';
import GlassCard from './GlassCard';
import RealisticAvatarIntegrated from './RealisticAvatarIntegrated'; // Integrated Custom Avatar
import ErrorBoundary from './ErrorBoundary';
import { BarChart3 } from 'lucide-react';
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
  // Local State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("En attente de la parole...");
  const [analysisData, setAnalysisData] = useState<any | null>(null);

  // Avatar & TTS State
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isLoadingTts, setIsLoadingTts] = useState(false);

  // Timeline State
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- PLAYBACK LOGIC ---
  const triggerPlayer = (blob: Blob | File) => {
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setIsUploading(true);
  };

  const toggleAvatarSpeech = async () => {
    if (isAvatarSpeaking) {
      setIsAvatarSpeaking(false);
      return;
    }

    if (ttsAudioUrl) {
      setIsAvatarSpeaking(true);
    }
  };

  const handleAnalysisSuccess = async (data: any) => {
    setAnalysisData(data);
    setIsUploading(false); // Stop analyzing animation

    // Auto-trigger speech if we got a URL from backend
    if (data.audio_url) {
      console.log("Analysis Success: Received audio_url from backend", data.audio_url);
      setTtsAudioUrl(data.audio_url);
      setIsAvatarSpeaking(true);
    }
  };

  // --- UPLOAD HANDLERS ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      triggerPlayer(file);
      setAnalysisData(null);
      setTtsAudioUrl(null);
      setIsAvatarSpeaking(false);
      setIsUploading(true);
      try {
        const data = await speechService.uploadRecording(file);
        handleAnalysisSuccess(data);
      } catch (error) {
        console.error("Erreur upload fichier :", error);
        alert("Erreur lors de l'analyse. Vérifiez que le backend est lancé.");
        setIsUploading(false);
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

  // --- RECORDING MODES ---
  const startFinalRecording = async () => {
    setPreviewUrl(null);
    setAnalysisData(null);
    setTtsAudioUrl(null);
    setIsAvatarSpeaking(false);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;

    // Prioritize MP4 as requested
    let mimeType = 'video/webm;codecs=vp8,opus'; // Fallback
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      mimeType = 'video/webm;codecs=vp9,opus';
    }

    console.log("Using MIME Type for recording:", mimeType);

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    videoChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const videoBlob = new Blob(videoChunksRef.current, { type: mediaRecorder.mimeType });
      triggerPlayer(videoBlob);

      try {
        const data = await speechService.uploadRecording(videoBlob);
        handleAnalysisSuccess(data);
      } catch (error) {
        console.error("Erreur enregistrement :", error);
        alert("Erreur lors de l'analyse. Vérifiez que le backend est lancé.");
        setIsUploading(false);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const toggleRecording = () => {
    if (isRecording) stopMediaFlow();
    else startFinalRecording();
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setAnalysisData(null);
    setTtsAudioUrl(null);
    setIsAvatarSpeaking(false);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full w-full flex flex-col p-6 space-y-8 max-w-7xl mx-auto">

      {/* DYNAMIC GRID - 50/50 Split */}
      <div className="grid gap-6 transition-all duration-700 ease-in-out grid-cols-12 flex-1 min-h-0">

        {/* --- LEFT PANEL (6 COLS): VIDEO / PERFORMANCE --- */}
        <div className={`flex flex-col gap-6 transition-all duration-700 col-span-6 overflow-hidden`}>
          <div className={`relative bg-black rounded-[32px] overflow-hidden border-4 border-white/10 shadow-2xl aspect-video w-full shrink-0`}>
            <Visualizer
              isRecording={isRecording}
              isUploading={isUploading}
              previewUrl={previewUrl}
              avatarUrl="" // Not used anymore
              onTimeUpdate={setCurrentTime}
              seekTo={seekTo}
            />

            {isRecording && (
              <video
                ref={videoPreviewRef}
                autoPlay muted playsInline
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-0"
              />
            )}
          </div>

          {/* SCROLLABLE PERFORMANCE AREA (Timeline & Score) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            {/* TIMELINE - Only visible after analysis */}
            {analysisData && analysisData.timeline && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <TimelineComponent
                  events={analysisData.timeline}
                  currentTime={currentTime}
                  duration={100}
                  onJumpToTime={(t) => setSeekTo(t)}
                />
              </div>
            )}

            {/* PERFORMANCE SCORE */}
            {analysisData && analysisData.scores && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {(() => {
                  const scoreEntries = Object.entries(analysisData.scores);
                  const averageScore = scoreEntries.length > 0
                    ? Math.round(scoreEntries.reduce((acc, [, val]) => acc + (val as number), 0) / scoreEntries.length * 10)
                    : 0;

                  return (
                    <GlassCard title="Performance Score" icon={BarChart3}>
                      <div className="flex flex-row items-center justify-around py-4 gap-6">
                        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 - (351.86 * averageScore) / 100} className="text-cyan-500 transition-all duration-1000 ease-out" />
                          </svg>
                          <span className="absolute text-3xl font-black text-white tracking-tighter">{averageScore}%</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 w-full">
                          {scoreEntries.map(([key, value]) => (
                            <div key={key} className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                              <span className="text-[9px] uppercase text-gray-400 font-bold mb-1 truncate w-full">{key.replace(/_/g, ' ')}</span>
                              <span className="text-xl font-bold text-cyan-400">{Math.round((value as number) * 10)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  );
                })()}
              </div>
            )}
          </div>

          {/* STOP BUTTON (DURING RECORDING) */}
          {isRecording && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button
                onClick={stopMediaFlow}
                className="bg-[#FF3B3B] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-tighter shadow-lg active:scale-95 transition-all flex items-center gap-3"
              >
                <div className="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
                <span>Terminer l'analyse</span>
              </button>
            </div>
          )}
        </div>


        {/* --- RIGHT PANEL (6 COLS): AVATAR & RESULTS --- */}
        <div className="col-span-6 flex flex-col gap-6 animate-in slide-in-from-right-10 duration-500 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-10">

          {/* 1. STATUS & AVATAR CARD - FIXED AT TOP */}
          <div className={`shrink-0 h-[42%] min-h-[380px] bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden relative group transition-all duration-500 ${isAvatarSpeaking ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.1)]' : ''}`}>

            {/* 3D Coach Avatar - Main Instance */}
            <Suspense fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-cyan-500 animate-pulse w-1/3"></div>
                </div>
                <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                  Initialisation du coach...
                </p>
              </div>
            }>
              <RealisticAvatarIntegrated
                audioUrl={ttsAudioUrl}
                isPlaying={isAvatarSpeaking}
                isRecording={isRecording}
                onEnded={() => setIsAvatarSpeaking(false)}
              />
            </Suspense>

            {/* Waveform Visualization (Optional visual cue when speaking) */}
            {isAvatarSpeaking && (
              <div className="absolute bottom-6 right-8 flex items-end gap-1 h-8 opacity-40">
                {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                  <div key={i} className="w-1 bg-cyan-500 rounded-full animate-pulse" style={{ height: `${20 + h * 20}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            )}
          </div>

          {/* DYNAMIC CONTENT (Live Transcript or Results) - EXPANDABLE */}
          <div className="shrink-0 bg-black/40 backdrop-blur-md rounded-[32px] border border-white/10 flex flex-col shadow-inner relative">
            {isRecording ? (
              <div className="p-8 flex flex-col">
                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Transcription en temps réel</h3>
                <div className="space-y-4 pr-2">
                  <p className="text-white/80 text-lg leading-relaxed font-medium italic">
                    "{transcription}"
                  </p>
                </div>
              </div>
            ) : (
              analysisData ? (
                <div className="flex-col">
                  <ErrorBoundary>
                    <AnalysisResults
                      data={analysisData}
                      onToggleSpeech={toggleAvatarSpeech}
                      isSpeechPlaying={isAvatarSpeaking}
                      isLoadingAudio={isLoadingTts}
                    />
                  </ErrorBoundary>
                </div>
              ) : (
                <div className="p-8 h-full flex items-center justify-center text-gray-500 text-center text-sm font-medium">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-700 animate-spin"></div>
                    En attente de votre intervention...
                  </div>
                </div>
              )
            )}
          </div>
        </div>

      </div>

      {/* MAIN CONTROLS - Aligned with Left Panel */}
      <div className="grid grid-cols-12 gap-6 w-full">
        <div className="col-span-6 flex flex-col items-start gap-6">
          <div className="flex items-center gap-4">
            {!isRecording && !analysisData && (
              <button
                onClick={toggleRecording}
                disabled={isUploading && !isRecording}
                className="px-12 py-5 rounded-3xl font-black tracking-tighter bg-cyan-500 text-black shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-105 transition-all duration-500 flex items-center gap-4"
              >
                <div className="w-3 h-3 rounded-full bg-black"></div>
                <span className="text-lg uppercase">Démarrer le Coaching</span>
              </button>
            )}

            {analysisData && (
              <button
                onClick={handleReset}
                className="px-8 py-4 rounded-2xl font-black tracking-tighter bg-cyan-500 text-black shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all duration-500 flex items-center gap-2"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                <span className="text-sm uppercase">Nouvelle Session</span>
              </button>
            )}

            {!isRecording && !isUploading && !analysisData && (
              <div className="relative group">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl bg-white/5 text-white border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 shadow-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {!isRecording && !analysisData && (
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black pl-2 opacity-60">
              ENREGISTRER OU IMPORTER UNE VIDÉO
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordSession;