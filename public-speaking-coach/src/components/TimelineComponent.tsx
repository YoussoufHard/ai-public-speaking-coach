import React from 'react';
import { Clock } from 'lucide-react';

interface TimelineEvent {
    time: number; // Time in seconds
    event: string;
}

interface TimelineComponentProps {
    events: TimelineEvent[];
    currentTime: number;
    onJumpToTime: (time: number) => void;
    duration: number;
}

const TimelineComponent: React.FC<TimelineComponentProps> = ({
    events,
    currentTime,
    onJumpToTime,
    duration
}) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-cyan-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Analysis Timeline</h3>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {events.map((item, index) => {
                    const isActive = Math.abs(currentTime - item.time) < 2; // Highlight if within 2 seconds
                    return (
                        <div
                            key={index}
                            onClick={() => onJumpToTime(item.time)}
                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${isActive
                                    ? 'bg-cyan-500/20 border-cyan-500/50'
                                    : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                                }`}
                        >
                            <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${isActive ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'
                                }`}>
                                {new Date(item.time * 1000).toISOString().substr(14, 5)}
                            </div>
                            <div className="text-sm text-gray-200 font-medium">
                                {item.event}
                            </div>
                        </div>
                    );
                })}
                {events.length === 0 && (
                    <div className="text-center text-gray-500 text-xs italic py-4">
                        No events detected in timeline.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimelineComponent;
