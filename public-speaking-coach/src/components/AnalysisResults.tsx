import React, { useState, useEffect, useRef } from 'react';
import GlassCard from './GlassCard';
import { MessageSquare, ListChecks, Volume2, StopCircle, Loader2 } from 'lucide-react';
import { speechService } from '../service/api';

interface AnalysisResultsProps {
    data: {
        scores: Record<string, number>;
        feedback: {
            summary: string;
            recommendations: string[];
        };
        timeline: any[];
        detected_language?: string;
    };
    onToggleSpeech: () => void;
    isSpeechPlaying: boolean;
    isLoadingAudio: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
    data,
    onToggleSpeech,
    isSpeechPlaying,
    isLoadingAudio
}) => {
    // Safety check
    if (!data || !data.scores) return <div className="p-4 text-center text-gray-400">Données d'analyse incomplètes</div>;

    const { scores, feedback } = data;

    // Default values
    const safeFeedback = feedback || { summary: "Analyse indisponible", recommendations: [] };
    const finalFeedback = safeFeedback;

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-10 duration-700 p-2">

            {/* FEEDBACK SUMMARY WITH TTS */}
            <GlassCard title="AI Feedback" icon={MessageSquare}>
                <div className="py-2">
                    {finalFeedback.summary ? (
                        <p className="text-sm leading-relaxed text-gray-300 italic border-l-2 border-cyan-500/50 pl-4 py-1 bg-cyan-500/5 rounded-r-lg">
                            "{finalFeedback.summary}"
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Aucun résumé disponible pour le moment.</p>
                    )}

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={onToggleSpeech}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest hover:bg-cyan-500/20 border border-cyan-500/20 transition-all disabled:opacity-50"
                            disabled={isLoadingAudio}
                        >
                            {isLoadingAudio ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Traitement...
                                </>
                            ) : isSpeechPlaying ? (
                                <>
                                    <StopCircle className="h-3.5 w-3.5" />
                                    Arrêter
                                </>
                            ) : (
                                <>
                                    <Volume2 className="h-3.5 w-3.5" />
                                    Écouter l'analyse
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </GlassCard>

            {/* RECOMMENDATIONS */}
            <GlassCard title="Key Recommendations" icon={ListChecks}>
                <div className="space-y-2 pt-1">
                    {finalFeedback.recommendations && finalFeedback.recommendations.length > 0 ? (
                        finalFeedback.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                                <div className="min-w-[24px] h-6 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-[10px] font-black border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                                    {index + 1}
                                </div>
                                <p className="text-[12px] text-gray-300 font-medium leading-relaxed">{rec}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-500 italic p-4 text-center">Aucune recommandation disponible.</p>
                    )}
                </div>
            </GlassCard>

        </div>
    );
};

export default AnalysisResults;
