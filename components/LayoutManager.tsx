
import React from 'react';

interface LayoutManagerProps {
  children: React.ReactNode;
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-[#f05a28] rounded-full flex items-center justify-center text-white font-luxury text-2xl shadow-[0_6px_16px_rgba(240,90,40,0.25)] transform -rotate-12 border-2 border-white overflow-hidden">
               <span className="select-none">A</span>
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
            </div>
            <div className="absolute -top-1 -right-1 text-[#f05a28] text-[10px] animate-pulse">✦</div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-2xl font-luxury font-black text-[#f05a28] leading-none tracking-tighter italic">
                arte
              </h1>
              <span className="text-neutral-400 font-sans font-bold text-[10px] uppercase tracking-[0.2em]">House Clinic</span>
            </div>
            <p className="text-[9px] text-neutral-400 font-bold tracking-[0.35em] uppercase mt-1 opacity-70">Creative Production Studio</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <nav className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-neutral-400">
             <span className="text-[#f05a28] cursor-pointer border-b-2 border-[#f05a28] pb-1">Review Studio</span>
             <span className="hover:text-[#f05a28] cursor-pointer transition-colors border-b-2 border-transparent hover:border-[#f05a28] pb-1">Media Assets</span>
             <span className="hover:text-[#f05a28] cursor-pointer transition-colors border-b-2 border-transparent hover:border-[#f05a28] pb-1">Help</span>
           </nav>
           <div className="h-6 w-[1px] bg-neutral-100 hidden lg:block"></div>
           <button className="bg-[#f05a28]/5 hover:bg-[#f05a28]/10 text-[#f05a28] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
             My Gallery
           </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {children}
      </main>
    </div>
  );
};
