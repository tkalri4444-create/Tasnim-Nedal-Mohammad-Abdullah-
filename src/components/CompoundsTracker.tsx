import React from 'react';
import { COMPOUNDS } from '../data/gameData';
import { Sparkles } from 'lucide-react';
import { formatNumber } from '../utils/numberFormat';

interface CompoundsTrackerProps {
  currentIndex: number;
  totalRunElements: number;
}

export const CompoundsTracker: React.FC<CompoundsTrackerProps> = ({
  currentIndex,
  totalRunElements,
}) => {
  const current = COMPOUNDS[currentIndex] || COMPOUNDS[0];
  const next = COMPOUNDS[currentIndex + 1] || null;

  let progress = 100;
  let remaining = 0;
  if (next) {
    const prevReq = current.requiredTotal;
    const nextReq = next.requiredTotal;
    const currentProgress = Math.max(0, totalRunElements - prevReq);
    const range = nextReq - prevReq;
    progress = Math.min(100, Math.max(0, (currentProgress / range) * 100));
    remaining = Math.max(0, nextReq - totalRunElements);
  }

  return (
    <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 backdrop-blur-md text-[11px] font-mono-code">
      {/* Current Active Compound */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
          style={{ backgroundColor: current.color }}
        />
        <span className="font-display font-semibold text-slate-200">
          {current.name}
        </span>
        <span className="text-amber-300 font-bold ml-0.5">
          ({current.multiplier}x)
        </span>
      </div>

      {/* Progress to Next Milestone */}
      {next ? (
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-slate-400 shrink-0 text-[10px] hidden sm:inline">
            Next: <span className="text-slate-200 font-bold">{next.name}</span> ({formatNumber(remaining)})
          </span>
        </div>
      ) : (
        <div className="text-emerald-400 flex items-center gap-1 text-[10px]">
          <Sparkles className="w-3 h-3" />
          <span>Max Discovery</span>
        </div>
      )}
    </div>
  );
};
