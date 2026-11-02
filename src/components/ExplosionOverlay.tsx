import React from 'react';
import { AlertOctagon, RotateCcw, Sparkles } from 'lucide-react';
import { formatNumber } from '../utils/numberFormat';

interface ExplosionOverlayProps {
  lostElements: number;
  salvagedDarkMatter: number;
  explosionCount: number;
  onRebuild: () => void;
}

export const ExplosionOverlay: React.FC<ExplosionOverlayProps> = ({
  lostElements,
  salvagedDarkMatter,
  explosionCount,
  onRebuild,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0f19]/95 backdrop-blur-xl select-none animate-in fade-in duration-300">
      <div className="max-w-lg w-full text-center flex flex-col items-center">
        {/* Warning Icon */}
        <div className="w-20 h-20 rounded-full bg-red-950/80 border-2 border-red-500/80 flex items-center justify-center mb-4 text-red-500 shadow-[0_0_30px_rgba(255,51,51,0.5)] animate-bounce">
          <AlertOctagon className="w-10 h-10" />
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-5xl font-display font-black text-[#ff3333] tracking-widest uppercase drop-shadow-[0_0_25px_rgba(255,51,51,0.8)] mb-3">
          Lab Explosion!
        </h2>

        {/* Lore & Explanation */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 max-w-md">
          Pressure limits exceeded. The chemical flask ruptured violently, venting corrosive plasma.
          Your unstable experimental elements have dissolved into vapor.
        </p>

        {/* Explosion Aftermath Box */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-8 grid grid-cols-2 gap-3 text-left font-mono-code text-xs">
          <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/40">
            <span className="text-slate-400 block mb-0.5">Dissolved Elements</span>
            <span className="text-red-400 font-bold text-base">
              -{formatNumber(lostElements)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-900/40">
            <span className="text-purple-300 flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" /> Salvaged Isotopes
            </span>
            <span className="text-purple-400 font-bold text-base">
              +{salvagedDarkMatter} Dark Matter
            </span>
          </div>

          <div className="col-span-2 text-center text-slate-500 text-[11px] pt-1">
            Total explosions recorded: {explosionCount}
          </div>
        </div>

        {/* Rebuild Button */}
        <button
          onClick={onRebuild}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-[#00ff66] text-[#00ff66] font-display font-bold text-base sm:text-lg uppercase tracking-wider hover:bg-[#00ff66] hover:text-slate-950 hover:shadow-[0_0_25px_rgba(0,255,102,0.8)] active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.3)]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Rebuild Laboratory</span>
        </button>
      </div>
    </div>
  );
};
