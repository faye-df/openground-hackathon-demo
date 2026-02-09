
import React from 'react';
import { AppMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, mode, setMode }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-slate-50 shadow-xl overflow-hidden relative">
      <header className="px-6 py-4 flex items-center justify-between glass-morphism sticky top-0 z-50">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setMode('home')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">Open Ground</h1>
            <span className="text-[10px] text-slate-400 font-medium">共鸣场</span>
          </div>
        </div>
        <button
          onClick={() => setMode('admin')}
          className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /><path d="m15 5 3 3" /></svg>
        </button>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* Persistent Mobile-style Nav */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-100 flex justify-around py-3 px-6 glass-morphism z-50">
        <button
          onClick={() => setMode('home')}
          className={`flex flex-col items-center gap-1 ${mode === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button
          onClick={() => setMode('resonate')}
          className={`flex flex-col items-center gap-1 ${mode === 'resonate' ? 'text-rose-500' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>
          <span className="text-[10px] font-medium">Map</span>
        </button>
        <button
          onClick={() => setMode('echo')}
          className={`flex flex-col items-center gap-1 ${mode === 'echo' ? 'text-rose-500' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={mode === 'echo' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
          <span className="text-[10px] font-medium">Echo</span>
        </button>
        <button
          onClick={() => setMode('initiate')}
          className="flex flex-col items-center -mt-8"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200 border-4 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          </div>
          <span className="text-[10px] font-bold text-rose-600 mt-1">Initiate</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
