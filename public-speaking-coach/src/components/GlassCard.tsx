import React, { FC } from 'react';

interface GlassCardProps {
  title: string;
  icon: any;
  children: React.ReactNode;
}

const GlassCard: FC<GlassCardProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-500">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 bg-cyan-500/20 rounded-lg">
        <Icon size={18} className="text-cyan-400" />
      </div>
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 group-hover:text-cyan-300 transition-colors">
        {title}
      </span>
    </div>
    {children}
  </div>
);

export default GlassCard;