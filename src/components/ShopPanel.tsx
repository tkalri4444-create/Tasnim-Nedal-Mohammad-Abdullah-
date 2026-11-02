import React, { useState } from 'react';
import {
  Pipette,
  Flame,
  Disc,
  Atom,
  Sparkles,
  Zap,
  Infinity,
  MousePointerClick,
  Crosshair,
  Wand2,
  Radio,
  Snowflake,
  Wind,
  ThermometerSnowflake,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Check,
} from 'lucide-react';
import { UpgradeItem, BeakerModel } from '../types/game';
import { formatNumber } from '../utils/numberFormat';

const ICON_MAP: Record<string, React.ElementType> = {
  Pipette,
  Flame,
  Disc,
  Atom,
  Sparkles,
  Zap,
  Infinity,
  MousePointerClick,
  Crosshair,
  Wand2,
  Radio,
  Snowflake,
  Wind,
  ThermometerSnowflake,
  ShieldAlert,
  Layers,
};

interface ShopPanelProps {
  upgrades: UpgradeItem[];
  ownedUpgrades: Record<string, number>;
  currentElements: number;
  darkMatter: number;
  beakerModels: BeakerModel[];
  equippedBeakerId: string;
  unlockedBeakers: string[];
  activeTab?: 'all' | 'generator' | 'click' | 'cooling' | 'beakers';
  onTabChange?: (tab: 'all' | 'generator' | 'click' | 'cooling' | 'beakers') => void;
  onBuyUpgrade: (upgradeId: string, count: number) => void;
  onBuyBeaker: (beakerId: string) => void;
  onEquipBeaker: (beakerId: string) => void;
}

export const ShopPanel: React.FC<ShopPanelProps> = ({
  upgrades,
  ownedUpgrades,
  currentElements,
  darkMatter,
  beakerModels,
  equippedBeakerId,
  unlockedBeakers,
  activeTab: controlledTab,
  onTabChange,
  onBuyUpgrade,
  onBuyBeaker,
  onEquipBeaker,
}) => {
  const [internalTab, setInternalTab] = useState<'all' | 'generator' | 'click' | 'cooling' | 'beakers'>('all');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = onTabChange ?? setInternalTab;

  const [buyMultiplier, setBuyMultiplier] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Helper to calculate total cost for N upgrades
  const calculateCost = (upgrade: UpgradeItem, count: number): number => {
    const owned = ownedUpgrades[upgrade.id] || 0;
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned + i));
    }
    return total;
  };

  const filteredUpgrades = upgrades.filter((u) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cooling') return u.category === 'cooling' || u.category === 'safety';
    return u.category === activeTab;
  });

  return (
    <div className="w-full bg-[#0d1424]/95 border-t-2 border-[#1c2a47] shadow-[0_-10px_25px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 z-30 select-none">
      {/* Shop Bar Header */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2a47]/80 bg-[#090d18]/90">
        {/* Title and collapse button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 sm:gap-2 text-left group shrink-0"
          >
            <span className="text-sm sm:text-lg font-display font-bold text-[#00ccff] tracking-wider uppercase drop-shadow-[0_0_8px_rgba(0,204,255,0.4)] group-hover:text-cyan-300 transition-colors">
              Equipment
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
            ) : (
              <ChevronUp className="w-4 h-4 text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
            )}
          </button>

          {/* Category Tabs - Visible and Scrollable on ALL screens */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[calc(100vw-120px)] sm:max-w-none scrollbar-none text-xs font-display">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'beakers', label: '🧪 Beakers (7 Models)', isNew: true },
              { id: 'generator', label: 'Apparatus (EPS)' },
              { id: 'click', label: 'Agitators' },
              { id: 'cooling', label: 'Cooling & Safety' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  if (!isExpanded) setIsExpanded(true);
                }}
                className={`px-2.5 py-1 rounded-md transition-all border whitespace-nowrap font-semibold ${
                  activeTab === tab.id
                    ? tab.isNew
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.6)] font-bold'
                      : 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                    : tab.isNew
                    ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 hover:border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-pulse'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multiplier Selector (1x, 5x, 10x, 100x) - Only for regular upgrades */}
        {activeTab !== 'beakers' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950/90 rounded-lg p-0.5 border border-slate-700 text-xs font-mono-code">
              {[1, 5, 10, 100].map((mult) => (
                <button
                  key={mult}
                  onClick={() => setBuyMultiplier(mult)}
                  className={`px-2 py-0.5 sm:py-1 rounded-md transition-all font-semibold ${
                    buyMultiplier === mult
                      ? 'bg-[#00ccff] text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mult}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upgrades Horizontal Shelf Area */}
      {isExpanded && (
        <div className="p-3 sm:p-4 overflow-x-auto overflow-y-hidden">
          {/* TAB: BEAKER CHASSIS & SKINS */}
          {activeTab === 'beakers' ? (
            <div className="flex gap-3 min-w-max pb-1">
              {beakerModels.map((b) => {
                const isOwned = unlockedBeakers.includes(b.id);
                const isEquipped = equippedBeakerId === b.id;
                const canAfford =
                  b.costCurrency === 'darkMatter'
                    ? darkMatter >= b.cost
                    : currentElements >= b.cost;

                return (
                  <div
                    key={b.id}
                    className={`w-72 sm:w-80 p-3.5 rounded-xl border flex flex-col justify-between transition-all select-none ${
                      isEquipped
                        ? 'bg-sky-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : isOwned
                        ? 'bg-[#151f36] border-[#293b61] hover:border-cyan-500'
                        : canAfford
                        ? 'bg-[#16203a] border-[#2c3d63] hover:border-emerald-400'
                        : 'bg-[#101626]/80 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center border"
                            style={{
                              backgroundColor: `${b.accentColor}20`,
                              borderColor: b.accentColor,
                              color: b.accentColor,
                            }}
                          >
                            <FlaskConical className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-xs sm:text-sm text-slate-100">
                              {b.name}
                            </h4>
                            <span className="font-display text-[10px] text-cyan-300">
                              Tier {b.tier || 1} Chassis
                            </span>
                          </div>
                        </div>

                        {isEquipped && (
                          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono-code text-[10px] font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                        {b.description}
                      </p>

                      {/* Stat Multipliers */}
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono-code mb-3">
                        <span className="text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40 font-bold">
                          {b.clickMultiplier}x Click Power
                        </span>
                        {b.coolingBonus && (
                          <span className="text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                            +{b.coolingBonus}%/s Cool
                          </span>
                        )}
                        {b.critChanceBonus && (
                          <span className="text-yellow-300 bg-yellow-950/50 px-2 py-0.5 rounded border border-yellow-800/40">
                            +{Math.round(b.critChanceBonus * 100)}% Crit Chance
                          </span>
                        )}
                        {b.explosionShieldBonus && (
                          <span className="text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                            +{Math.round(b.explosionShieldBonus * 100)}% Blast Shield
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button: Equip or Buy */}
                    {isEquipped ? (
                      <button
                        disabled
                        className="w-full py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-mono-code text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>EQUIPPED</span>
                      </button>
                    ) : isOwned ? (
                      <button
                        onClick={() => onEquipBeaker(b.id)}
                        className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono-code text-xs font-bold shadow-md active:scale-95 transition-all"
                      >
                        EQUIP MODEL
                      </button>
                    ) : (
                      <button
                        onClick={() => canAfford && onBuyBeaker(b.id)}
                        disabled={!canAfford}
                        className={`w-full py-1.5 px-3 rounded-lg border font-mono-code text-xs font-bold flex items-center justify-between transition-all ${
                          canAfford
                            ? b.costCurrency === 'darkMatter'
                              ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                              : 'bg-[#00ff88]/15 text-[#00ff88] border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.25)] hover:bg-[#00ff88]/25'
                            : 'bg-slate-900/90 text-slate-500 border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <span>UNLOCK</span>
                        <span>
                          {b.costCurrency === 'darkMatter'
                            ? `${b.cost} Dark Matter`
                            : `${formatNumber(b.cost)} elem`}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* STANDARD UPGRADES RACK */
            <div className="flex gap-3 min-w-max pb-1">
              {/* Highlighted Showcase Card for Beakers when on All Items */}
              {activeTab === 'all' && (
                <div
                  onClick={() => setActiveTab('beakers')}
                  className="w-64 sm:w-72 p-3.5 rounded-xl border-2 border-cyan-400/90 bg-gradient-to-br from-cyan-950/90 via-slate-900 to-indigo-950/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:border-cyan-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between shrink-0 transition-all select-none group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                        ⭐ NEW CHASSIS SHOP
                      </span>
                      <span className="text-cyan-300 font-mono-code text-[11px] font-bold">
                        7 Models
                      </span>
                    </div>

                    <h4 className="font-display font-black text-sm sm:text-base text-cyan-200 group-hover:text-white flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-cyan-400 animate-bounce" />
                      <span>Unlock New Beakers</span>
                    </h4>

                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      Upgrade from standard Pyrex to Tesla Coils, Cryo-Dewars, & Cosmic Crucibles for up to 10x Click & Blast Shields!
                    </p>
                  </div>

                  <div className="mt-3 py-1.5 px-3 rounded-lg bg-cyan-500/25 border border-cyan-400 text-cyan-200 font-display font-black text-xs text-center group-hover:bg-cyan-500/40 transition-colors shadow-sm">
                    BROWSE 7 BEAKER MODELS →
                  </div>
                </div>
              )}

              {filteredUpgrades.map((item) => {
                const owned = ownedUpgrades[item.id] || 0;
                const cost = calculateCost(item, buyMultiplier);
                const canAfford = currentElements >= cost;
                const IconComponent = ICON_MAP[item.icon] || Pipette;

                return (
                  <div
                    key={item.id}
                    onClick={() => canAfford && onBuyUpgrade(item.id, buyMultiplier)}
                    className={`w-64 sm:w-72 p-3 rounded-xl border flex flex-col justify-between transition-all select-none ${
                      canAfford
                        ? 'bg-[#151f36] border-[#293b61] hover:border-[#00ccff] hover:bg-[#1c2948] cursor-pointer hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_16px_rgba(0,204,255,0.2)]'
                        : 'bg-[#111728]/80 border-slate-800/80 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {/* Card Header: Icon + Name + Lvl */}
                    <div className="flex items-start gap-2.5 mb-2">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                          item.category === 'cooling' || item.category === 'safety'
                            ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-400'
                            : item.category === 'click'
                            ? 'bg-amber-950/60 border-amber-700/60 text-amber-400'
                            : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-display font-semibold text-xs sm:text-sm text-slate-100 truncate">
                            {item.name}
                          </h4>
                          <span className="font-mono-code text-[10px] px-1.5 py-0.2 rounded bg-sky-950/90 text-sky-300 border border-sky-800/80 shrink-0 font-bold">
                            lvl {owned}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Stat Output Pill */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono-code mb-2.5">
                      {item.eps > 0 && (
                        <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          +{formatNumber(item.eps * buyMultiplier)}/sec
                        </span>
                      )}
                      {item.clickBonus > 0 && (
                        <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                          +{formatNumber(item.clickBonus * buyMultiplier)}/click
                        </span>
                      )}
                      {item.pressureReductionPerClick > 0 && (
                        <span className="text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                          -{item.pressureReductionPerClick}% pressure
                        </span>
                      )}
                      {item.passiveCooling > 0 && (
                        <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                          -{item.passiveCooling}%/sec cool
                        </span>
                      )}
                      {item.explosionShieldChance && (
                        <span className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                          +{Math.round(item.explosionShieldChance * 100)}% shield
                        </span>
                      )}
                    </div>

                    {/* Card Cost Action Button */}
                    <div
                      className={`w-full py-1.5 px-3 rounded-lg border font-mono-code text-xs font-bold flex items-center justify-between transition-all ${
                        canAfford
                          ? 'bg-[#00ff88]/15 text-[#00ff88] border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.25)] hover:bg-[#00ff88]/25'
                          : 'bg-slate-900/90 text-slate-500 border-slate-800'
                      }`}
                    >
                      <span>BUY {buyMultiplier}x</span>
                      <span className="flex items-center gap-1">
                        <span>{formatNumber(cost)}</span>
                        <span className="text-[10px] opacity-75">elem</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
