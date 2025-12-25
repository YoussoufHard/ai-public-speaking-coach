import React from 'react';
import { Zap, Activity, BarChart3 } from 'lucide-react';
import GlassCard from './GlassCard';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-700">
      <h1 className="text-2xl font-black mb-8 tracking-tighter uppercase text-cyan-500">
        Overview Analysis
      </h1>
      
      <div className="grid grid-cols-12 gap-6 items-center flex-1">
        
        {/* Côté Gauche */}
        <div className="col-span-3 space-y-6">
          <GlassCard title="Vocabulary Range" icon={Zap}>
            <div className="text-center py-4">
              <div className="text-2xl font-black italic tracking-tighter leading-none text-white">
                INNOVATION<br/>
                <span className="text-white/40 text-sm">FUTURE</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Voice Pace" icon={Activity}>
            <div className="flex items-end gap-1.5 h-16 pt-2">
              {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]"></div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Centre - Avatar */}
        <div className="col-span-6 flex justify-center">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            className="w-80 h-80 drop-shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-transform hover:scale-105 duration-500"
            alt="Avatar"
          />
        </div>

        {/* Côté Droit */}
        <div className="col-span-3 space-y-6">
          <GlassCard title="Delivery Score" icon={BarChart3}>
             <div className="text-center py-4">
                <span className="text-4xl font-black text-cyan-400">82%</span>
             </div>
          </GlassCard>

          <GlassCard title="Hesitance Dial" icon={Activity}>
            <div className="h-20 flex items-end gap-1">
              {[20, 50, 30, 80, 40, 90, 40].map((h, i) => (
                <div key={i} className="flex-1 bg-red-500/40 border-t-2 border-red-500" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;