import {
  Volume2,
  VolumeX,
  Trophy,
  Crown,
  Sparkles,
  Zap,
  Download,
  FlaskConical,
} from 'lucide-react';
import { formatNumber, formatRate } from '../utils/numberFormat';

interface HeaderBarProps {
  elements: number;
  eps: number;
  darkMatter: number;
  frenzyTimeLeft: number;
  hyperSurgeTimeLeft?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPrestige: () => void;
  onOpenStats: () => void;
  onOpenBeakers?: () => void;
  activeBeakerTier?: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  elements,
  eps,
  darkMatter,
  frenzyTimeLeft,
  hyperSurgeTimeLeft = 0,
  soundEnabled,
  onToggleSound,
  onOpenPrestige,
  onOpenStats,
  onOpenBeakers,
  activeBeakerTier = 1,
}) => {
  return (
    <header className="w-full bg-[#0d1322]/90 border-b border-[#1c263f] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 select-none backdrop-blur-md z-20">
      {/* App Branding */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(0,255,102,0.3)] shrink-0">
          <span className="text-lg">🧪</span>
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-black text-sm sm:text-base tracking-wider text-slate-100 uppercase truncate">
            The Mad Chemist
          </h1>
          <span className="font-mono-code text-[10px] text-emerald-400 block tracking-tight -mt-0.5">
            Synthesis Lab v2.5
          </span>
        </div>
      </div>

      {/* Center Surge & Frenzy Indicators */}
      <div className="flex items-center gap-2">
        {hyperSurgeTimeLeft > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/25 border border-yellow-400 text-yellow-300 font-mono-code text-xs animate-bounce shadow-[0_0_15px_rgba(250,204,21,0.6)]">
            <Sparkles className="w-3.5 h-3.5 fill-yellow-400 text-yellow-300 animate-spin" />
            <span className="font-extrabold tracking-wider">100X QUANTUM SURGE:</span>
            <span>{Math.ceil(hyperSurgeTimeLeft)}s</span>
          </div>
        )}

        {frenzyTimeLeft > 0 && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono-code text-xs animate-pulse">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-bold">2X FRENZY:</span>
            <span>{Math.ceil(frenzyTimeLeft)}s</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Dark Matter Badge */}
        {darkMatter > 0 && (
          <button
            onClick={onOpenPrestige}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-700/50 text-purple-300 hover:border-purple-400 transition-colors text-xs font-mono-code"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold">{darkMatter}</span>
            <span className="hidden sm:inline text-purple-400/80">DM</span>
          </button>
        )}

        {/* Beakers Shop Quick Access */}
        {onOpenBeakers && (
          <button
            onClick={onOpenBeakers}
            title="Browse & Equip Beaker Models"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 text-xs font-display transition-all active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.35)]"
          >
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">Beakers</span>
            <span className="text-[10px] px-1 rounded bg-cyan-500/30 text-cyan-200 font-mono-code">T{activeBeakerTier}</span>
          </button>
        )}

        {/* Quantum Transmutation button */}
        <button
          onClick={onOpenPrestige}
          title="Quantum Transmutation"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 border border-purple-600/40 text-purple-200 text-xs font-display transition-all active:scale-95"
        >
          <Crown className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">Transmute</span>
        </button>

        {/* Stats & Logbook button */}
        <button
          onClick={onOpenStats}
          title="Laboratory Logbook & Stats"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-display transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Archive</span>
        </button>

        {/* Quick CrazyGames ZIP Download Link */}
        <a
          href="./mad-chemist-crazygames.zip"
          download="mad-chemist-crazygames.zip"
          title="Download ready-to-upload CrazyGames ZIP package"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-display transition-all active:scale-95 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline font-bold">CrazyGames ZIP</span>
        </a>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>
    </header>
  );
};
