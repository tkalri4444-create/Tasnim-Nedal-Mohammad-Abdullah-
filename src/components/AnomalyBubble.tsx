import React from 'react';
import { LaboratoryAnomaly } from '../types/game';
import { Radio, Snowflake, Zap, Sparkles } from 'lucide-react';

interface AnomalyBubbleProps {
  anomaly: LaboratoryAnomaly;
  onClick: (anomaly: LaboratoryAnomaly) => void;
}

export const AnomalyBubble: React.FC<AnomalyBubbleProps> = ({ anomaly, onClick }) => {
  const isHyper = anomaly.type === 'hyper_x100';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(anomaly);
      }}
      className="absolute cursor-pointer z-40 group animate-bounce"
      style={{
        left: `${anomaly.x}%`,
        top: `${anomaly.y}%`,
        transition: 'left 0.8s ease-out, top 0.8s ease-out',
      }}
    >
      <div
        className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-900/90 border-2 shadow-xl group-hover:scale-125 transition-transform duration-150 ${
          isHyper
            ? 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,1)] bg-amber-950/80 animate-pulse'
            : 'border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.8)]'
        }`}
      >
        <div
          className={`absolute inset-0 rounded-full blur-sm animate-ping pointer-events-none ${
            isHyper ? 'bg-yellow-400/30' : 'bg-fuchsia-500/20'
          }`}
        />

        {anomaly.type === 'frenzy' && <Zap className="w-6 h-6 text-yellow-300 animate-spin" />}
        {anomaly.type === 'coolant' && <Snowflake className="w-6 h-6 text-cyan-300" />}
        {anomaly.type === 'element_burst' && <Radio className="w-6 h-6 text-fuchsia-300" />}
        {anomaly.type === 'hyper_x100' && <Sparkles className="w-7 h-7 text-yellow-300 animate-spin" />}

        {/* Small badge */}
        <span
          className={`absolute -bottom-5 px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold whitespace-nowrap shadow-md border ${
            isHyper
              ? 'bg-amber-950/95 border-yellow-400/80 text-yellow-300 animate-bounce'
              : 'bg-slate-950/90 border-fuchsia-500/50 text-fuchsia-200'
          }`}
        >
          {anomaly.label}
        </span>
      </div>
    </div>
  );
};
