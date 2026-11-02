import React from 'react';
import { X, Sparkles, Crown, ArrowRight, ShieldCheck, Snowflake, Flame, Zap, Award } from 'lucide-react';
import { PRESTIGE_PERKS } from '../data/gameData';
import { formatNumber } from '../utils/numberFormat';

const PRESTIGE_ICONS: Record<string, React.ElementType> = {
  ShieldCheck,
  Snowflake,
  Sparkles,
  Flame,
  Zap,
};

const PRESTIGE_RANKS = [
  { rank: 0, title: 'Novice Alchemist', subtitle: 'Initiate of Matter' },
  { rank: 1, title: 'Quantum Engineer', subtitle: 'Master of Agitation' },
  { rank: 2, title: 'Dark Matter Professor', subtitle: 'Isotope Specialist' },
  { rank: 3, title: 'Lord of Eternal Reactions', subtitle: 'Thermal Overseer' },
  { rank: 4, title: 'Wormhole Physicist', subtitle: 'Spacetime Weaver' },
  { rank: 5, title: 'Grand Cosmic Alchemist', subtitle: 'Universal Creator' },
];

interface PrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMatter: number;
  totalRunElements: number;
  claimableDarkMatter: number;
  prestigeCount?: number;
  prestigeUpgrades: Record<string, number>;
  onBuyPrestigePerk: (perkId: string, cost: number) => void;
  onTriggerPrestige: () => void;
}

export const PrestigeModal: React.FC<PrestigeModalProps> = ({
  isOpen,
  onClose,
  darkMatter,
  claimableDarkMatter,
  prestigeCount = 0,
  prestigeUpgrades,
  onBuyPrestigePerk,
  onTriggerPrestige,
}) => {
  if (!isOpen) return null;

  const currentRank = PRESTIGE_RANKS[Math.min(prestigeCount, PRESTIGE_RANKS.length - 1)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-[#101726] border border-purple-500/50 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between bg-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-display font-black text-purple-200">
                  Quantum Transmutation (Prestige System)
                </h2>
              </div>
              <p className="text-xs text-purple-400 font-mono-code">
                Reset active run apparatus to synthesize Dark Matter and permanent multipliers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Prestige Rank Banner */}
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 flex items-center justify-between font-mono-code text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">Cosmic Rank (Tier {prestigeCount}):</span>
              <span className="text-purple-300 font-bold font-display">
                {currentRank.title}
              </span>
            </div>

            <div className="text-emerald-400 font-bold">
              +{darkMatter * 15}% All-Time Production
            </div>
          </div>

          {/* Transmutation Claim Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
            <div>
              <span className="text-xs uppercase font-mono-code tracking-wider text-purple-300 block mb-1">
                Claimable Transmutation Yield
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-black text-purple-200 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
                  +{claimableDarkMatter}
                </span>
                <span className="text-sm font-display text-purple-400 font-bold">
                  Dark Matter Vials
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 max-w-sm">
                Converts current laboratory compounds into concentrated Dark Matter. Each vial grants a permanent +15% output multiplier across all runs.
              </p>
            </div>

            <button
              onClick={onTriggerPrestige}
              disabled={claimableDarkMatter <= 0}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-display font-black text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Transmute Laboratory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Dark Matter Reserves */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 font-mono-code text-xs">
            <span className="text-slate-400">Stored Dark Matter Reserves:</span>
            <span className="text-purple-300 font-bold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              {darkMatter} Dark Matter (+{darkMatter * 15}% Multiplier)
            </span>
          </div>

          {/* Permanent Research Perks */}
          <div>
            <h3 className="text-xs sm:text-sm font-display font-bold text-slate-200 uppercase tracking-wider mb-3">
              Permanent Cosmic Perks
            </h3>

            <div className="space-y-2.5">
              {PRESTIGE_PERKS.map((perk) => {
                const level = prestigeUpgrades[perk.id] || 0;
                const cost = perk.cost * (level + 1);
                const isMax = level >= perk.maxLevel;
                const canAfford = darkMatter >= cost && !isMax;
                const IconComponent = PRESTIGE_ICONS[perk.icon] || Sparkles;

                return (
                  <div
                    key={perk.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-semibold text-sm text-slate-100">
                            {perk.name}
                          </h4>
                          <span className="font-mono-code text-[11px] text-purple-300">
                            ({level}/{perk.maxLevel})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{perk.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onBuyPrestigePerk(perk.id, cost)}
                      disabled={!canAfford}
                      className={`px-3.5 py-1.5 rounded-lg font-mono-code text-xs font-bold shrink-0 transition-all ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-default'
                          : canAfford
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? 'MAXED' : `${cost} DM`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
