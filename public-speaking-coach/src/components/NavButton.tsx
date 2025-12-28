import React from 'react';

interface NavButtonProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean; // Optionnel : si tu veux réduire la barre plus tard
}

const NavButton: React.FC<NavButtonProps> = ({ icon: Icon, label, active = false, onClick, collapsed = false }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all duration-300 group ${
      active 
      ? 'bg-cyan-500/10 text-white border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
      : 'text-gray-500 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={22} className={active ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'} />
    {!collapsed && (
      <span className="text-[11px] uppercase font-bold tracking-[0.1em] whitespace-nowrap">
        {label}
      </span>
    )}
    {active && !collapsed && (
      <div className="ml-auto w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
    )}
  </button>
);

export default NavButton;