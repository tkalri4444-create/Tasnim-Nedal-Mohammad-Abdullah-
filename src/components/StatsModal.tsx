import React, { useState } from 'react';
import {
  X,
  Trophy,
  Activity,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  FlaskConical,
  HandMetal,
  Bomb,
  AlertTriangle,
  Layers,
  Radiation,
  Sparkles,
  Crosshair,
  Crown,
} from 'lucide-react';
import { GameState } from '../types/game';
import { ACHIEVEMENTS } from '../data/gameData';
import { formatNumber } from '../utils/numberFormat';

const ACHIEVEMENT_ICONS: Record<string, React.ElementType> = {
  FlaskConical,
  HandMetal,
  Bomb,
  AlertTriangle,
  Layers,
  Activity,
  Radiation,
  Radioactive: Radiation,
  Sparkles,
  Crosshair,
  Crown,
};

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onToggleSound: () => void;
  onChangeVolume: (vol: number) => void;
  onResetAll: () => void;
  onExportSave: () => void;
  onImportSave: (code: string) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onToggleSound,
  onChangeVolume,
  onResetAll,
  onExportSave,
  onImportSave,
}) => {
  const [tab, setTab] = useState<'stats' | 'achievements' | 'settings'>('stats');
  const [importInput, setImportInput] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#101726] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-100 uppercase tracking-wide">
              Lab Archive & Logbook
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-display">
          {[
            { id: 'stats', label: 'Laboratory Stats' },
            { id: 'achievements', label: `Achievements (${gameState.unlockedAchievements.length}/${ACHIEVEMENTS.length})` },
            { id: 'settings', label: 'Audio & Data' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 py-3 text-center transition-colors border-b-2 font-semibold ${
                tab === t.id
                  ? 'border-sky-400 text-sky-400 bg-sky-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {tab === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-code text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Current Stored Elements</span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatNumber(gameState.elements)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Total Run Synthesis</span>
                <span className="text-lg font-bold text-sky-300">
                  {formatNumber(gameState.totalRunElements)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Lifetime Synthesis</span>
                <span className="text-lg font-bold text-purple-300">
                  {formatNumber(gameState.totalAllTimeElements)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Peak Elements / Sec</span>
                <span className="text-lg font-bold text-amber-300">
                  {formatNumber(gameState.highestEPS)}/s
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Manual Flask Agitations</span>
                <span className="text-lg font-bold text-slate-200">
                  {gameState.clicks.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Catastrophic Explosions</span>
                <span className="text-lg font-bold text-rose-400">
                  {gameState.explosions}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Quantum Transmutations</span>
                <span className="text-lg font-bold text-fuchsia-400">
                  {gameState.prestigeCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Current Dark Matter</span>
                <span className="text-lg font-bold text-purple-400">
                  {gameState.darkMatter} DM
                </span>
              </div>
            </div>
          )}

          {tab === 'achievements' && (
            <div className="space-y-2.5">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = gameState.unlockedAchievements.includes(ach.id);
                const IconComponent = ACHIEVEMENT_ICONS[ach.icon] || Trophy;

                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isUnlocked
                        ? 'bg-slate-900/90 border-emerald-500/40 text-slate-100 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                          isUnlocked
                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-600'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div>
                        <h4 className="font-display font-semibold text-sm">
                          {ach.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isUnlocked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-4 text-xs font-mono-code">
              {/* Sound Controls */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-display">
                    {gameState.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                    <span>Synthesizer Audio SFX</span>
                  </div>

                  <button
                    onClick={onToggleSound}
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      gameState.soundEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {gameState.soundEnabled ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 shrink-0">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={gameState.soundVolume}
                    onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                  <span className="text-slate-300 w-10 text-right">
                    {Math.round(gameState.soundVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* Save Management */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-display font-semibold text-slate-200">
                  Data & Backup
                </h4>

                {/* CrazyGames ZIP Build Download */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-950/50 to-indigo-950/40 border border-purple-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div>
                    <h5 className="font-display font-bold text-purple-200 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>📦</span>
                      <span>CrazyGames Game Package (.ZIP)</span>
                    </h5>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                      HTML5 bundle with index.html at root, ready to upload directly to CrazyGames.
                    </p>
                  </div>
                  <a
                    href="./mad-chemist-crazygames.zip"
                    download="mad-chemist-crazygames.zip"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-display font-bold text-xs tracking-wider shadow-[0_0_12px_rgba(168,85,247,0.4)] active:scale-95 transition-all shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ZIP</span>
                  </a>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={onExportSave}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Copy Save Code</span>
                  </button>

                  <button
                    onClick={() => setShowImportBox(!showImportBox)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Save</span>
                  </button>
                </div>

                {showImportBox && (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste base64 save code here..."
                      value={importInput}
                      onChange={(e) => setImportInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <button
                      onClick={() => {
                        onImportSave(importInput);
                        setImportInput('');
                        setShowImportBox(false);
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-white font-semibold"
                    >
                      Load
                    </button>
                  </div>
                )}
              </div>

              {/* Danger Zone: Reset Data */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 space-y-2">
                <h4 className="font-display font-semibold text-red-400">Danger Zone</h4>
                <p className="text-slate-400 text-[11px]">
                  Wipes all game progression, upgrades, transmutations, and achievements.
                </p>

                {resetConfirm ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        onResetAll();
                        setResetConfirm(false);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
                    >
                      Confirm Full Wipe
                    </button>
                    <button
                      onClick={() => setResetConfirm(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setResetConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset All Data</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
