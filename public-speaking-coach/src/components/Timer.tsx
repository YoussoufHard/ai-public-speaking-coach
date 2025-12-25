import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval); // Nettoyage quand on arrête l'enregistrement
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

 

  return (
  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl min-w-[80px] justify-center">
    <Clock size={14} className="text-cyan-400" />
    <span className="text-sm font-mono font-bold text-white tabular-nums">
      {formatTime(seconds)}
    </span>
  </div>
);
};

export default Timer;