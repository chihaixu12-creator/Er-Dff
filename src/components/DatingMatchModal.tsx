import React from 'react';
import { DatingMatch } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, MessageCircle, X, Sparkles, MapPin } from 'lucide-react';

interface DatingMatchModalProps {
  match: DatingMatch;
  onClose: () => void;
  onStartChat: () => void;
}

export const DatingMatchModal: React.FC<DatingMatchModalProps> = ({
  match,
  onClose,
  onStartChat,
}) => {
  const { currentUser } = useApp();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-neutral-900 to-black border border-white/20 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(204,9,230,0.35)] overflow-hidden">
        
        {/* Glow ambient background circles */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#CC09E6]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00F2FE]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CC09E6]/20 border border-[#CC09E6]/40 text-[#CC09E6] text-xs font-bold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nuova Connessione AMICA</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-[#CC09E6] tracking-tight mb-1">
          È un Match!
        </h2>
        <p className="text-xs text-neutral-300 mb-6">
          Tu e <span className="text-white font-bold">{match.partnerName}</span> vi piacete a vicenda!
        </p>

        {/* Intersecting Avatars */}
        <div className="flex items-center justify-center relative mb-6">
          {/* User Avatar */}
          <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#CC09E6] to-[#00F2FE] shadow-xl z-10 -mr-4 transform -rotate-6">
            <img
              src={currentUser.avatar || '/src/assets/images/category_incontri_evening_1792082231469.jpg'}
              alt={currentUser.name}
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
          </div>

          {/* Heart Badge in Center */}
          <div className="w-10 h-10 rounded-full bg-[#CC09E6] border-2 border-black flex items-center justify-center text-white z-20 shadow-lg animate-bounce">
            <Heart className="w-5 h-5 fill-white" />
          </div>

          {/* Partner Avatar */}
          <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#00F2FE] to-[#CC09E6] shadow-xl z-10 -ml-4 transform rotate-6">
            <img
              src={match.partnerAvatar || '/src/assets/images/discover_fashion_milan_1792084200282.jpg'}
              alt={match.partnerName}
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
          </div>
        </div>

        {/* Compatibility Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-800/90 border border-white/10 text-neutral-200 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Affinità del profilo: <strong className="text-emerald-400">{match.compatibilityScore}%</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onStartChat}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#CC09E6] to-[#9906AB] hover:from-[#B008C5] hover:to-[#830592] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#CC09E6]/40 transition-all active:scale-98 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Invia un Messaggio a {match.partnerName}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
          >
            Continua a cercare
          </button>
        </div>

      </div>
    </div>
  );
};
