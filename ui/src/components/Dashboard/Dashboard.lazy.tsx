import React, { FC } from 'react';
import { Mic, Play, History, FileText, BarChart3, Activity, Zap } from 'lucide-react';

interface StatWidgetProps {
  title: string;
  children: React.ReactNode;
  icon: any;
}

const StatWidget: FC<StatWidgetProps> = ({ title, children, icon: Icon }) => (
  <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-2xl text-white w-64 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
    <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
      <Icon size={18} className="text-cyan-400" />
      <span className="text-xs uppercase tracking-widest font-bold text-cyan-200">{title}</span>
    </div>
    {children}
  </div>
);

const NavButton = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={`flex flex-col items-center gap-1 group transition-all ${active ? 'text-cyan-400' : 'text-gray-500 hover:text-white'}`}>
    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-transparent'}`}>
      <Icon size={24} />
    </div>
    <span className="text-[10px] uppercase font-bold tracking-tighter">{label}</span>
  </button>
);

const Dashboard: FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0f16] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0a0f16] to-[#05070a] flex flex-col items-center justify-between p-8 font-sans overflow-hidden">
      
      <header className="text-center mt-4">
        <h1 className="text-cyan-400 text-4xl font-black tracking-tighter uppercase italic opacity-80">
          Public Speaking <span className="text-white">AI Coach</span>
        </h1>
        <div className="h-1 w-32 bg-cyan-500 mx-auto mt-2 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
      </header>

      <div className="relative flex flex-1 items-center justify-center w-full max-w-6xl">
        
        {/* Widgets Gauche */}
        <div className="flex flex-col gap-6 absolute left-0 z-20">
          <StatWidget title="Voice Pace" icon={Activity}>
            <div className="flex items-end gap-1 h-12">
              {[40, 70, 45, 90, 65, 80].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-cyan-500 rounded-t-sm animate-pulse"></div>
              ))}
            </div>
            <p className="text-[10px] mt-2 text-cyan-400 font-mono">Optimal Zone: ACTIVE</p>
          </StatWidget>

          <StatWidget title="Vocabulary Range" icon={Zap}>
            <div className="relative h-24 flex items-center justify-center">
               <div className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full animate-spin"></div>
               <span className="text-2xl font-black text-white italic text-center leading-tight">INNOVATION<br/><span className="text-xs text-cyan-400">FUTURE</span></span>
            </div>
          </StatWidget>
        </div>

        {/* Centre - Avatar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full group-hover:bg-cyan-500/30 transition-all"></div>
          <div className="relative z-10 w-[400px] h-[400px] flex items-center justify-center">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Coach Avatar" 
              className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            />
            <div className="absolute bottom-10 flex gap-1 items-center h-8">
               {[...Array(15)].map((_, i) => (
                 <div key={i} className="w-1 bg-white rounded-full animate-bounce" style={{ height: `${Math.random()*100}%`, animationDelay: `${i*0.1}s` }}></div>
               ))}
            </div>
          </div>
        </div>

        {/* Widgets Droite */}
        <div className="flex flex-col gap-6 absolute right-0 z-20">
          <StatWidget title="Confidence Level" icon={BarChart3}>
            <div className="flex flex-col items-center py-2">
              <div className="text-4xl font-black text-white italic">88<span className="text-sm">%</span></div>
              <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[88%] shadow-[0_0_8px_#06b6d4]"></div>
              </div>
            </div>
          </StatWidget>

          <StatWidget title="Hesitance Dial" icon={Activity}>
            <div className="h-20 flex items-center justify-center border-2 border-cyan-500/50 rounded-full w-20 mx-auto relative">
                <div className="text-xs font-bold text-cyan-400">LOW</div>
                <div className="absolute w-1 h-8 bg-cyan-400 top-2 origin-bottom -rotate-45"></div>
            </div>
          </StatWidget>
        </div>
      </div>

      <nav className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-3xl flex gap-8 px-10 mb-4 shadow-2xl">
        <NavButton icon={Mic} label="Record" active />
        <NavButton icon={Play} label="Courses" />
        <NavButton icon={History} label="History" />
        <NavButton icon={FileText} label="Detailed Report" />
      </nav>
    </div>
  );
};

export default Dashboard;