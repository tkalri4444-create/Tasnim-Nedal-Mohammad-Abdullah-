import React from 'react';
import { Wind, Snowflake, AlertTriangle, Flame } from 'lucide-react';

interface PressureGaugeProps {
  pressure: number;
  maxPressure: number;
  passiveCoolingRate: number;
  isOverdrive: boolean;
  onManualVent: () => void;
  onEmergencyCryo: () => void;
  cryoCooldownRemaining: number;
  cryoMaxCooldown: number;
}

export const PressureGauge: React.FC<PressureGaugeProps> = ({
  pressure,
  maxPressure,
  passiveCoolingRate,
  isOverdrive,
  onManualVent,
  onEmergencyCryo,
  cryoCooldownRemaining,
  cryoMaxCooldown,
}) => {
  const percentage = Math.min(100, Math.max(0, (pressure / maxPressure) * 100));
  const isDeepFreeze = percentage < 8;
  const isFreezing = percentage < 18;
  const isDangerous = percentage >= 70 && percentage < 90;
  const isCritical = percentage >= 90;

  // Determine bar fill color
  let barGradient = 'from-emerald-500 via-teal-400 to-emerald-300';
  if (isCritical) {
    barGradient = 'from-amber-500 via-red-500 to-rose-600 animate-pulse';
  } else if (isDangerous) {
    barGradient = 'from-amber-400 via-amber-500 to-orange-500';
  } else if (isDeepFreeze) {
    barGradient = 'from-cyan-600 via-blue-500 to-indigo-400 animate-pulse';
  } else if (isFreezing) {
    barGradient = 'from-sky-400 via-cyan-400 to-blue-500';
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-slate-950/85 border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md">
      {/* Gauge Readout & Bar */}
      <div className="flex-1 w-full min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs font-display">
          <div className="flex items-center gap-1.5 truncate">
            {isCritical ? (
              <span className="flex items-center gap-1 text-red-400 animate-pulse font-bold tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                OVERPRESSURE!
              </span>
            ) : isDangerous ? (
              <span className="flex items-center gap-1 text-amber-400 font-bold tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce shrink-0" />
                OVERDRIVE (+50%)
              </span>
            ) : isDeepFreeze ? (
              <span className="flex items-center gap-1 text-cyan-200 animate-pulse font-bold tracking-wider">
                <Snowflake className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                CRYO-SHUTDOWN (-90%)
              </span>
            ) : isFreezing ? (
              <span className="flex items-center gap-1 text-cyan-300 font-bold tracking-wider">
                <Snowflake className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                COLD STALL (-50%)
              </span>
            ) : (
              <span className="text-slate-300 tracking-wider font-semibold">PRESSURE LEVEL</span>
            )}
            <span className="text-slate-500 font-mono-code text-[10px] hidden md:inline">
              (-{passiveCoolingRate.toFixed(1)}%/s)
            </span>
          </div>

          <span
            className={`font-mono-code font-bold text-xs ${
              isCritical
                ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                : isDangerous
                ? 'text-amber-300'
                : 'text-emerald-400'
            }`}
          >
            {percentage.toFixed(1)}%
          </span>
        </div>

        {/* The Bar */}
        <div className="relative w-full h-3 bg-slate-900 rounded-full p-0.5 border border-slate-700/80 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-75 shadow-md`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Manual Vent & Cryo Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
        <button
          onClick={onManualVent}
          disabled={pressure <= 0.5}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-sky-500/40 hover:border-sky-400 active:scale-95 transition-all text-xs font-display font-semibold text-sky-300 shadow-sm"
          title="Vent excess steam pressure"
        >
          <Wind className="w-3.5 h-3.5 text-sky-400" />
          <span>Vent (-12%)</span>
        </button>

        <button
          onClick={onEmergencyCryo}
          disabled={cryoCooldownRemaining > 0 || pressure <= 5}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-500/50 hover:border-cyan-400 active:scale-95 transition-all text-xs font-display font-semibold text-cyan-200 shadow-sm relative overflow-hidden"
          title="Emergency Cryo purge to instantly cool flask"
        >
          {cryoCooldownRemaining > 0 && (
            <div
              className="absolute inset-0 bg-slate-800/70 pointer-events-none"
              style={{
                width: `${(cryoCooldownRemaining / cryoMaxCooldown) * 100}%`,
              }}
            />
          )}
          <Snowflake className="w-3.5 h-3.5 text-cyan-400 relative z-10" />
          <span className="relative z-10">
            {cryoCooldownRemaining > 0 ? `${Math.ceil(cryoCooldownRemaining)}s` : 'Cryo (-50%)'}
          </span>
        </button>
      </div>
    </div>
  );
};
