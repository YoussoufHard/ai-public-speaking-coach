import React, { useState } from 'react';
import { 
  LayoutDashboard, Mic, History, Settings, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
// Correction 1: Ajout de useLocation dans l'import
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import NavButton from './components/NavButton';
import Dashboard from './components/Dashboard';
import RecordSession from './components/RecordSession';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Correction 2: Nécessite l'import ci-dessus
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  // Correction 3: Suppression de la variable activeTab en double
  // On utilise l'URL comme seule source de vérité
  const currentTab = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="flex h-screen bg-[#05070a] text-white overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside 
        className={`relative border-r border-white/5 bg-black/40 backdrop-blur-2xl transition-all duration-500 ease-in-out flex flex-col z-50 
        ${isSidebarOpen ? 'w-64 p-6' : 'w-20 p-4'}`}
      >
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-12 bg-cyan-500 text-black rounded-full p-1 shadow-[0_0_15px_#06b6d4] hover:scale-110 transition-transform z-[60]"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className={`flex items-center gap-3 mb-10 transition-all ${!isSidebarOpen ? 'justify-center px-0' : 'px-2'}`}>
          <div className="p-2 bg-cyan-500 rounded-lg min-w-[36px] flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Mic size={20} className="text-black" />
          </div>
          {isSidebarOpen && (
            <span className="font-black italic text-xl tracking-tighter">
              SPEAK AI
            </span>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-3">
          <NavButton 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={currentTab === 'dashboard'} 
            collapsed={!isSidebarOpen}
            onClick={() => navigate('/dashboard')} 
          />
          <NavButton 
            icon={Mic} 
            label="Record" 
            active={currentTab === 'record'} 
            collapsed={!isSidebarOpen}
            onClick={() => navigate('/record')} 
          />
          <NavButton 
            icon={History} 
            label="History" 
            active={currentTab === 'history'} 
            collapsed={!isSidebarOpen}
            onClick={() => navigate('/history')} 
          />
        </nav>

        <div className={`pt-6 border-t border-white/5 ${!isSidebarOpen && 'flex justify-center'}`}>
          <NavButton 
            icon={Settings} 
            label="Settings" 
            collapsed={!isSidebarOpen} 
            onClick={() => navigate('/settings')}
          />
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a2c38]/20 via-[#05070a] to-[#05070a]">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/record" element={
            <RecordSession 
              isRecording={isRecording} 
              setIsRecording={setIsRecording} 
            />
          } />
          {/* Ajout d'une route temporaire pour éviter l'écran vide au clic sur History */}
          <Route path="/history" element={<div className="p-8 text-cyan-500 font-bold">History coming soon...</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;