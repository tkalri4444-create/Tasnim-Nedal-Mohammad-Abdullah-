import React, { useState } from 'react';
import { Gauge, Wind, AlertTriangle, Snowflake, Sparkles } from 'lucide-react';

interface LabEnvironmentFXProps {
  pressure: number;
  eps: number;
  frenzyTimeLeft: number;
  hyperSurgeTimeLeft: number;
  onManualVentValve: (side: 'left' | 'right') => void;
}

interface VentSteamBurst {
  id: number;
  side: 'left' | 'right';
  x: number;
  y: number;
}

export const LabEnvironmentFX: React.FC<LabEnvironmentFXProps> = ({
  pressure,
  eps,
  frenzyTimeLeft,
  hyperSurgeTimeLeft,
  onManualVentValve,
}) => {
  const [steamBursts, setSteamBursts] = useState<VentSteamBurst[]>([]);
  const [spinningValve, setSpinningValve] = useState<'left' | 'right' | null>(null);

  const isDeepFreeze = pressure < 8;
  const isFreezing = pressure < 18;
  const isDangerous = pressure >= 70 && pressure < 90;
  const isCritical = pressure >= 90;
  const isUltraCritical = pressure >= 95;

  const handleValveClick = (side: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    setSpinningValve(side);
    setTimeout(() => setSpinningValve(null), 500);

    const rect = e.currentTarget.getBoundingClientRect();
    const newBurst: VentSteamBurst = {
      id: Date.now() + Math.random(),
      side,
      x: side === 'left' ? rect.right - 10 : rect.left + 10,
      y: rect.top + rect.height / 2,
    };

    setSteamBursts((prev) => [...prev.slice(-6), newBurst]);
    setTimeout(() => {
      setSteamBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
    }, 900);

    onManualVentValve(side);
  };

  // Fluid bubble animation duration based on EPS
  const bubbleSpeed = Math.max(0.5, 4.0 - Math.min(3.5, Math.log10(eps + 1) * 0.7));

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-10 transition-all duration-500 ${
        isUltraCritical ? 'animate-room-tremor' : ''
      }`}
    >
      {/* 1. Dynamic Environmental Mood Tint */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{
          backgroundColor: isCritical
            ? 'rgba(239, 68, 68, 0.16)'
            : isDangerous
            ? 'rgba(245, 158, 11, 0.12)'
            : isDeepFreeze
            ? 'rgba(6, 182, 212, 0.18)'
            : isFreezing
            ? 'rgba(56, 189, 248, 0.10)'
            : hyperSurgeTimeLeft > 0
            ? 'rgba(250, 204, 21, 0.14)'
            : frenzyTimeLeft > 0
            ? 'rgba(192, 132, 252, 0.14)'
            : 'transparent',
        }}
      />

      {/* 2. Top Emergency Siren Beacons (Flashing when Critical) */}
      {isCritical && (
        <>
          {/* Left emergency rotating beacon */}
          <div className="absolute top-2 left-4 sm:left-12 w-28 h-28 pointer-events-none flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-600/40 blur-xl animate-pulse" />
            <div className="w-24 h-24 rounded-full border border-red-500/50 animate-siren shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
            <div className="absolute top-0 text-[10px] font-mono-code font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/70 tracking-widest animate-bounce">
              ⚠️ ALARM
            </div>
          </div>

          {/* Right emergency rotating beacon */}
          <div className="absolute top-2 right-4 sm:right-12 w-28 h-28 pointer-events-none flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-600/40 blur-xl animate-pulse" />
            <div className="w-24 h-24 rounded-full border border-red-500/50 animate-siren shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
            <div className="absolute top-0 text-[10px] font-mono-code font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/70 tracking-widest animate-bounce">
              ⚠️ RUPTURE
            </div>
          </div>

          {/* Whole room hazard border strobe */}
          <div className="absolute inset-0 border-4 border-red-500/50 pointer-events-none animate-pulse" />
        </>
      )}

      {/* 3. Frost Ice Crystals Overlay (When Freezing) */}
      {isFreezing && (
        <div className="absolute inset-0 pointer-events-none z-15 animate-frost">
          {/* Corner frost vignettes */}
          <div className="absolute top-0 left-0 w-44 h-44 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.45)_0%,transparent_70%)]" />
          <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.45)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.45)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.45)_0%,transparent_70%)]" />

          {/* Frost border ice crystals */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent shadow-[0_0_15px_rgba(103,232,249,0.8)]" />
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent shadow-[0_0_15px_rgba(103,232,249,0.8)]" />
        </div>
      )}

      {/* 4. Overdrive Heat Haze & Amber Glow (70% - 90%) */}
      {isDangerous && (
        <div className="absolute inset-0 pointer-events-none z-15">
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-amber-600/20 via-orange-500/10 to-transparent animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%] rounded-full bg-amber-500/10 blur-3xl" />
        </div>
      )}

      {/* 5. Left Industrial Background Steam Conduit & Interactive Vent Valve */}
      <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto">
        {/* Analog Wall Pressure Dial */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950/90 border-2 border-slate-700/80 shadow-[0_4px_15px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center relative mb-2 backdrop-blur-md">
          {/* Dial needle */}
          <div
            className="w-0.5 h-6 bg-red-400 origin-bottom transition-transform duration-300 rounded-full shadow-[0_0_5px_#ff3333]"
            style={{
              transform: `rotate(${-120 + (pressure / 100) * 240}deg)`,
            }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400 absolute" />
          <span className="text-[8px] font-mono-code font-bold text-slate-400 absolute bottom-1.5">
            {Math.round(pressure)}%
          </span>
        </div>

        {/* Clickable High-Pressure Vent Wheel */}
        <button
          onClick={(e) => handleValveClick('left', e)}
          title="Manual Wall Vent: Tap to release steam (-5% Pressure)"
          className={`group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 ${
            isCritical
              ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
              : isDangerous
              ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
          } flex items-center justify-center cursor-pointer active:scale-90 hover:scale-105 transition-all`}
        >
          {/* Wheel spokes */}
          <div
            className={`w-full h-full flex items-center justify-center transition-transform ${
              spinningValve === 'left' ? 'rotate-180 duration-500 ease-out' : ''
            }`}
          >
            <Wind
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isCritical
                  ? 'text-red-400 group-hover:text-red-200'
                  : 'text-cyan-400 group-hover:text-cyan-200'
              } transition-colors`}
            />
          </div>

          {/* Interactive Tooltip Badge */}
          <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-cyan-500/60 text-cyan-300 font-mono-code text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none shadow-md">
            💨 Vent -5%
          </span>
        </button>

        {/* Vertical Fluid Conduit Tube */}
        <div className="w-2 sm:w-2.5 h-36 bg-slate-950/80 rounded-full border border-slate-700/60 overflow-hidden relative mt-2 shadow-inner">
          <div
            className="w-full h-full bg-gradient-to-b from-cyan-400 via-teal-300 to-emerald-400 opacity-60"
            style={{
              animation: `pipe-flow ${bubbleSpeed}s linear infinite`,
            }}
          />
        </div>
      </div>

      {/* 6. Right Industrial Background Steam Conduit & Interactive Vent Valve */}
      <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto">
        {/* Analog Wall Temperature Gauge */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950/90 border-2 border-slate-700/80 shadow-[0_4px_15px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center relative mb-2 backdrop-blur-md">
          {/* Gauge needle */}
          <div
            className="w-0.5 h-6 bg-cyan-400 origin-bottom transition-transform duration-300 rounded-full shadow-[0_0_5px_#38bdf8]"
            style={{
              transform: `rotate(${-120 + (pressure / 100) * 240}deg)`,
            }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400 absolute" />
          <span className="text-[8px] font-mono-code font-bold text-slate-400 absolute bottom-1.5">
            {isDangerous ? 'HOT' : isFreezing ? 'COLD' : 'NORM'}
          </span>
        </div>

        {/* Clickable High-Pressure Vent Wheel */}
        <button
          onClick={(e) => handleValveClick('right', e)}
          title="Manual Wall Vent: Tap to release steam (-5% Pressure)"
          className={`group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 ${
            isCritical
              ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
              : isDangerous
              ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
          } flex items-center justify-center cursor-pointer active:scale-90 hover:scale-105 transition-all`}
        >
          {/* Wheel spokes */}
          <div
            className={`w-full h-full flex items-center justify-center transition-transform ${
              spinningValve === 'right' ? '-rotate-180 duration-500 ease-out' : ''
            }`}
          >
            <Wind
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isCritical
                  ? 'text-red-400 group-hover:text-red-200'
                  : 'text-cyan-400 group-hover:text-cyan-200'
              } transition-colors`}
            />
          </div>

          {/* Interactive Tooltip Badge */}
          <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-cyan-500/60 text-cyan-300 font-mono-code text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none shadow-md">
            💨 Vent -5%
          </span>
        </button>

        {/* Vertical Fluid Conduit Tube */}
        <div className="w-2 sm:w-2.5 h-36 bg-slate-950/80 rounded-full border border-slate-700/60 overflow-hidden relative mt-2 shadow-inner">
          <div
            className="w-full h-full bg-gradient-to-b from-purple-400 via-pink-400 to-indigo-400 opacity-60"
            style={{
              animation: `pipe-flow ${bubbleSpeed}s linear infinite`,
            }}
          />
        </div>
      </div>

      {/* 7. Active Escaping Steam Jet Bursts from Clicked Valves */}
      {steamBursts.map((b) => (
        <div
          key={b.id}
          className="absolute pointer-events-none z-30"
          style={{
            left: `${b.x}px`,
            top: `${b.y}px`,
          }}
        >
          <div
            className={`w-10 h-10 rounded-full blur-sm ${
              b.side === 'left' ? 'animate-[steam-jet-left_0.8s_ease-out_forwards]' : 'animate-[steam-jet-right_0.8s_ease-out_forwards]'
            }`}
            style={{
              backgroundColor: isCritical
                ? 'rgba(239, 68, 68, 0.7)'
                : isDangerous
                ? 'rgba(245, 158, 11, 0.65)'
                : 'rgba(56, 189, 248, 0.7)',
            }}
          />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono-code font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,1)] animate-bounce whitespace-nowrap">
            -5% VENT
          </span>
        </div>
      ))}
    </div>
  );
};
