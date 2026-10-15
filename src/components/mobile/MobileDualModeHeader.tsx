import React from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';

export const MobileDualModeHeader: React.FC = () => {
  const { deviceMode, setDeviceMode } = useApp();

  return (
    <div className="bg-neutral-900 border-b border-white/10 text-white px-3 py-1.5 flex items-center justify-between text-xs select-none">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#CC09E6] animate-pulse" />
        <span className="font-bold tracking-tight text-white/90">
          AMICA Dual-Mode Engine
        </span>
        <span className="hidden sm:inline-block text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-md border border-white/5">
          Web Portale + Mobile TikTok App
        </span>
      </div>

      <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-full border border-white/15">
        <button
          onClick={() => setDeviceMode('responsive')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
            deviceMode === 'responsive'
              ? 'bg-[#CC09E6] text-white font-bold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Adattamento automatico allo schermo"
        >
          <Sparkles className="w-3 h-3" />
          <span>Auto</span>
        </button>

        <button
          onClick={() => setDeviceMode('mobile_app')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
            deviceMode === 'mobile_app'
              ? 'bg-[#CC09E6] text-white font-bold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Forza modalità App Mobile (5 schede TikTok)"
        >
          <Smartphone className="w-3 h-3" />
          <span>App Mobile</span>
        </button>

        <button
          onClick={() => setDeviceMode('web')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
            deviceMode === 'web'
              ? 'bg-[#193C32] text-white font-bold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Forza modalità Web Desktop classica"
        >
          <Monitor className="w-3 h-3" />
          <span>Web Desktop</span>
        </button>
      </div>
    </div>
  );
};
