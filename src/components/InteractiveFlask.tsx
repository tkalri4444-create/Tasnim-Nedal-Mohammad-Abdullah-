import React, { useRef, useState } from 'react';
import { CompoundDiscovery, FloatingText, BeakerModel } from '../types/game';

interface SparkParticle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
}

interface InteractiveFlaskProps {
  compound: CompoundDiscovery;
  pressure: number;
  isFrenzy: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  floatingTexts: FloatingText[];
  beakerModel?: BeakerModel;
}

export const InteractiveFlask: React.FC<InteractiveFlaskProps> = ({
  compound,
  pressure,
  isFrenzy,
  onClick,
  floatingTexts,
  beakerModel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clickSparks, setClickSparks] = useState<SparkParticle[]>([]);

  // Pressure visual states
  const isFreezing = pressure < 18;
  const isDeepFreeze = pressure < 8;
  const isDangerous = pressure >= 70 && pressure < 90;
  const isCritical = pressure >= 90;

  // Fluid level percentage
  const fluidLevel = 52 + Math.min(pressure * 0.25, 34);

  // Active beaker shape (default to classic)
  const shape = beakerModel?.shapeType || 'classic';
  const accentColor = beakerModel?.accentColor || '#00ff88';

  // Internal click handler to spawn firework micro-sparks on click
  const handleInternalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Generate 8-12 chemical fireworks sparks
    const colors = [compound.color, '#00f5ff', '#c084fc', '#ffffff', accentColor];
    const newSparks: SparkParticle[] = Array.from({ length: 10 }).map((_, i) => {
      const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5);
      const speed = 25 + Math.random() * 45;
      return {
        id: Date.now() + Math.random(),
        x: clickX,
        y: clickY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2.5 + Math.random() * 3,
      };
    });

    setClickSparks((prev) => [...prev.slice(-25), ...newSparks]);
    setTimeout(() => {
      setClickSparks((prev) => prev.filter((p) => !newSparks.some((ns) => ns.id === p.id)));
    }, 600);

    onClick(e);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center select-none w-full max-h-full py-1"
    >
      {/* Floating Gain Numbers (+X, CRIT, 100x MEGA CRIT) */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
        {floatingTexts.map((item) => {
          const isMega = item.text.includes('100x');
          return (
            <div
              key={item.id}
              className={`absolute font-display font-black tracking-wide pointer-events-none -translate-x-1/2 -translate-y-1/2 ${
                isMega
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 text-3xl sm:text-4xl drop-shadow-[0_0_20px_rgba(250,204,21,1)] scale-150 animate-bounce'
                  : item.isCrit
                  ? 'text-yellow-300 text-2xl sm:text-3xl drop-shadow-[0_0_15px_rgba(253,224,71,0.9)] scale-125'
                  : 'text-emerald-300 text-lg sm:text-xl drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]'
              }`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                animation: 'steam-puff 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
              }}
            >
              {item.text}
            </div>
          );
        })}
      </div>

      {/* Chemical Fireworks & Burst Sparks on Click */}
      <div className="absolute inset-0 pointer-events-none z-45 overflow-visible">
        {clickSparks.map((spark) => (
          <div
            key={spark.id}
            className="absolute rounded-full pointer-events-none transition-all duration-500 ease-out"
            style={{
              left: `${spark.x}px`,
              top: `${spark.y}px`,
              width: `${spark.size}px`,
              height: `${spark.size}px`,
              backgroundColor: spark.color,
              boxShadow: `0 0 10px ${spark.color}, 0 0 4px #ffffff`,
              transform: `translate(${spark.dx}px, ${spark.dy}px) scale(0)`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Volumetric Steam Vapors Rising from Beaker Rim */}
      <div className="absolute -top-4 z-30 pointer-events-none flex flex-col items-center">
        <div
          className="w-5 h-5 rounded-full blur-xs animate-steam"
          style={{
            backgroundColor: isCritical
              ? 'rgba(255, 60, 60, 0.7)'
              : isDangerous
              ? 'rgba(251, 191, 36, 0.6)'
              : 'rgba(0, 245, 255, 0.5)',
            animationDuration: `${Math.max(0.4, 1.2 - pressure * 0.008)}s`,
          }}
        />
        {pressure > 25 && (
          <div
            className="w-4 h-4 rounded-full blur-xs animate-steam"
            style={{
              backgroundColor: compound.color,
              opacity: 0.55,
              animationDuration: `${Math.max(0.3, 0.9 - pressure * 0.006)}s`,
              animationDelay: '0.15s',
            }}
          />
        )}
      </div>

      {/* Main Clickable Chemical Beaker / Flask */}
      <div
        onClick={handleInternalClick}
        className={`relative cursor-pointer group active:scale-95 transition-all duration-100 flex flex-col items-center ${
          isCritical
            ? 'animate-shake-extreme'
            : isDangerous
            ? 'animate-shake-mild'
            : 'hover:scale-[1.03]'
        }`}
      >
        {/* Ambient Backlight Aura with dynamic tint */}
        <div
          className="absolute inset-4 rounded-full blur-2xl pointer-events-none transition-all duration-300 -z-10"
          style={{
            backgroundColor: isCritical
              ? '#ff2222'
              : isFreezing
              ? '#00f0ff'
              : compound.color,
            opacity: isFrenzy ? 0.9 : isCritical ? 0.8 : isFreezing ? 0.7 : 0.5,
          }}
        />

        {/* Orbiting Quantum Rings for Cosmic Crucible */}
        {shape === 'cosmic' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-5">
            <div className="w-80 h-32 rounded-full border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-spin opacity-70 rotate-12" style={{ animationDuration: '8s' }} />
            <div className="w-72 h-28 rounded-full border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.5)] animate-spin opacity-60 -rotate-12" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
          </div>
        )}

        {/* Beautiful Scientific Chemical Beaker / Flask Artwork */}
        <div className="relative w-56 h-64 sm:w-64 sm:h-72 md:w-72 md:h-80 flex items-center justify-center">
          <svg
            viewBox="0 0 240 280"
            className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] overflow-visible"
          >
            <defs>
              {/* Dynamic Radiant Fluid Gradient - No Dirty Yellow! */}
              <linearGradient id="beakerLiquidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={compound.color} stopOpacity="0.95" />
                <stop offset="60%" stopColor={compound.color} stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.95" />
              </linearGradient>

              {/* Radiant Inner Liquid Glow */}
              <radialGradient id="liquidInnerCore" cx="50%" cy="70%" r="55%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="40%" stopColor={compound.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor="#032b43" stopOpacity="0.98" />
              </radialGradient>

              {/* Glass Glare Highlights */}
              <linearGradient id="glassGlare" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="25%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
              </linearGradient>

              {/* Clip path for the interior chemical liquid depending on Beaker Model shape */}
              <clipPath id="beakerInteriorClip">
                {shape === 'florence' ? (
                  // Spherical bulb body
                  <path d="M 88,28 L 88,85 C 45,100 25,150 25,195 C 25,245 65,262 120,262 C 175,262 215,245 215,195 C 215,150 195,100 152,85 L 152,28 Z" />
                ) : shape === 'tesla' ? (
                  // Cylindrical plasma reactor
                  <path d="M 55,30 L 55,260 C 55,265 185,265 185,260 L 185,30 Z" />
                ) : (
                  // Classic Erlenmeyer / Cryo / Cosmic conical body
                  <path d="M 68,28 L 76,28 L 76,82 L 32,228 C 26,248 42,262 62,262 L 178,262 C 198,262 214,248 208,228 L 164,82 L 164,28 L 172,28 Z" />
                )}
              </clipPath>
            </defs>

            {/* Glowing Magnetic Stirrer Base under Beaker */}
            <g transform="translate(30, 258)">
              {/* Hotplate surface */}
              <rect
                x="0"
                y="0"
                width="180"
                height="10"
                rx="4"
                fill="#0f172a"
                stroke={isCritical ? '#ff3333' : isDangerous ? '#f59e0b' : accentColor}
                strokeWidth="1.5"
              />
              {/* Heating glow line */}
              <line
                x1="20"
                y1="3"
                x2="160"
                y2="3"
                stroke={isCritical ? '#ff3333' : accentColor}
                strokeWidth="2.2"
                opacity="0.9"
                filter="drop-shadow(0 0 6px currentColor)"
              />
              {/* Chassis bevel */}
              <path d="M 10,10 L 170,10 L 178,20 L 2,20 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {/* Indicator LED */}
              <circle cx="30" cy="15" r="2.5" fill={accentColor} filter={`drop-shadow(0 0 4px ${accentColor})`} />
              <circle cx="150" cy="15" r="3.5" fill="#0b0f19" stroke="#475569" strokeWidth="1" />
            </g>

            {/* Tesla Coils electrical arcs on sides if Tesla Model */}
            {shape === 'tesla' && (
              <g stroke="#c084fc" strokeWidth="1.8" filter="drop-shadow(0 0 6px #c084fc)">
                <path d="M 40,70 L 50,78 L 42,90 L 52,100" />
                <path d="M 200,70 L 190,78 L 198,90 L 188,100" />
                <circle cx="38" cy="65" r="4" fill="#c084fc" />
                <circle cx="202" cy="65" r="4" fill="#c084fc" />
              </g>
            )}

            {/* Beaker Glass Dark Background Body */}
            {shape === 'florence' ? (
              <path
                d="M 88,28 L 88,85 C 45,100 25,150 25,195 C 25,245 65,262 120,262 C 175,262 215,245 215,195 C 215,150 195,100 152,85 L 152,28 Z"
                fill="#060c18"
                fillOpacity="0.88"
              />
            ) : shape === 'tesla' ? (
              <path
                d="M 55,30 L 55,260 C 55,265 185,265 185,260 L 185,30 Z"
                fill="#060c18"
                fillOpacity="0.9"
              />
            ) : (
              <path
                d="M 68,28 L 76,28 L 76,82 L 32,228 C 26,248 42,262 62,262 L 178,262 C 198,262 214,248 208,228 L 164,82 L 164,28 L 172,28 Z"
                fill="#060c18"
                fillOpacity="0.88"
              />
            )}

            {/* Liquid Fill masked inside the Beaker */}
            <g clipPath="url(#beakerInteriorClip)">
              {/* Main Liquid Body */}
              <rect
                x="15"
                y={262 - (fluidLevel / 100) * 190}
                width="210"
                height="220"
                fill="url(#liquidInnerCore)"
                className="transition-all duration-300"
              />

              {/* Dynamic Wavy liquid surface line */}
              <path
                d={`M 20,${262 - (fluidLevel / 100) * 190} Q 70,${
                  257 - (fluidLevel / 100) * 190
                } 120,${262 - (fluidLevel / 100) * 190} T 220,${
                  262 - (fluidLevel / 100) * 190
                } L 220,270 L 20,270 Z`}
                fill={compound.color}
                opacity="0.55"
              />

              {/* Surface froth foam highlight */}
              <ellipse
                cx="120"
                cy={262 - (fluidLevel / 100) * 190}
                rx="52"
                ry="4"
                fill="#ffffff"
                opacity="0.5"
              />

              {/* Dynamic Rising Bubbles */}
              <circle cx="85" cy="220" r="5" fill="#ffffff" opacity="0.8">
                <animate attributeName="cy" values="245;120;245" dur="2.1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.95;0.2" dur="2.1s" repeatCount="indefinite" />
              </circle>
              <circle cx="145" cy="235" r="7" fill="#ffffff" opacity="0.7">
                <animate attributeName="cy" values="250;105;250" dur="2.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.7s" repeatCount="indefinite" />
              </circle>
              <circle cx="115" cy="210" r="4" fill="#ffffff" opacity="0.85">
                <animate attributeName="cy" values="240;95;240" dur="1.7s" repeatCount="indefinite" />
              </circle>
              <circle cx="165" cy="225" r="5.5" fill="#ffffff" opacity="0.65">
                <animate attributeName="cy" values="248;115;248" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="100" cy="190" r="3.5" fill="#ffffff" opacity="0.8">
                <animate attributeName="cy" values="235;90;235" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* Magnetic Stirring Bar Spinning at bottom */}
              <rect x="105" y="250" width="30" height="6" rx="3" fill="#ffffff" opacity="0.95">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 120 253"
                  to="360 120 253"
                  dur={isFreezing ? '1.8s' : '0.35s'}
                  repeatCount="indefinite"
                />
              </rect>
            </g>

            {/* Measurement Graduation Lines on Beaker side */}
            <g stroke="#94a3b8" strokeWidth="1.6" opacity="0.85">
              <line x1="140" y1="215" x2="156" y2="215" />
              <text x="160" y="218" fill="#e2e8f0" fontSize="8" fontFamily="monospace" fontWeight="bold">250ml</text>

              <line x1="134" y1="185" x2="148" y2="185" />
              <text x="152" y="188" fill="#e2e8f0" fontSize="8" fontFamily="monospace" fontWeight="bold">200ml</text>

              <line x1="128" y1="155" x2="140" y2="155" />
              <text x="144" y="158" fill="#e2e8f0" fontSize="8" fontFamily="monospace" fontWeight="bold">150ml</text>

              <line x1="122" y1="125" x2="132" y2="125" />
              <text x="136" y="128" fill="#e2e8f0" fontSize="8" fontFamily="monospace" fontWeight="bold">100ml</text>
            </g>

            {/* Top Pouring Lip & Rim */}
            <ellipse
              cx="120"
              cy="28"
              rx={shape === 'florence' ? 32 : 28}
              ry="5.5"
              fill="#0f172a"
              stroke={isCritical ? '#ff3333' : accentColor}
              strokeWidth="2.5"
            />

            {/* Glass Outer Contour with Specular Reflections */}
            {shape === 'florence' ? (
              <path
                d="M 88,28 L 88,85 C 45,100 25,150 25,195 C 25,245 65,262 120,262 C 175,262 215,245 215,195 C 215,150 195,100 152,85 L 152,28 Z"
                fill="url(#glassGlare)"
                stroke={isCritical ? '#ff3333' : accentColor}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            ) : shape === 'tesla' ? (
              <path
                d="M 55,30 L 55,260 C 55,265 185,265 185,260 L 185,30 Z"
                fill="url(#glassGlare)"
                stroke={isCritical ? '#ff3333' : accentColor}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M 68,28 L 76,28 L 76,82 L 32,228 C 26,248 42,262 62,262 L 178,262 C 198,262 214,248 208,228 L 164,82 L 164,28 L 172,28 Z"
                fill="url(#glassGlare)"
                stroke={isCritical ? '#ff3333' : accentColor}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            )}

            {/* Curved Bright Glass Reflection Streak */}
            <path
              d="M 52,228 L 94,92 L 98,92 L 62,228 Z"
              fill="#ffffff"
              opacity="0.35"
            />

            {/* Frost Crystal overlay when reaction is freezing */}
            {isFreezing && (
              <g stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" opacity={isDeepFreeze ? 0.95 : 0.7}>
                <path d="M 45,210 L 65,195 M 55,202 L 50,192 M 55,202 L 65,208" />
                <path d="M 38,225 L 60,225 M 48,225 L 42,215 M 48,225 L 42,235" />
                <path d="M 195,210 L 175,195 M 185,202 L 190,192 M 185,202 L 175,208" />
                <path d="M 202,225 L 180,225 M 192,225 L 198,215 M 192,225 L 198,235" />
              </g>
            )}
          </svg>

          {/* Glowing Chemical Formula Plate fastened to Beaker */}
          <div className="absolute bottom-10 px-3 py-1 rounded-md bg-slate-950/90 border border-slate-700/90 shadow-[0_0_15px_rgba(0,0,0,0.9)] backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
            <span
              className={`w-2 h-2 rounded-full ${isFreezing ? 'bg-cyan-300' : 'animate-ping'}`}
              style={{ backgroundColor: isFreezing ? '#00f0ff' : compound.color }}
            />
            <span className="font-mono-code font-bold text-xs sm:text-sm tracking-wider text-slate-100">
              {compound.formula}
            </span>
            {beakerModel && (
              <span className="text-[10px] font-mono-code px-1.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60 ml-1">
                {beakerModel.name.split(' ')[0]}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Action Prompt */}
        <div
          className={`text-center mt-1 text-[11px] sm:text-xs font-mono-code uppercase tracking-widest font-bold group-hover:scale-105 transition-all flex items-center gap-1.5 ${
            isDeepFreeze
              ? 'text-cyan-200 drop-shadow-[0_0_10px_rgba(103,232,249,0.9)] animate-pulse'
              : isFreezing
              ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.6)]'
              : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(0,255,102,0.6)]'
          }`}
        >
          {isDeepFreeze ? (
            <>
              <span>❄️</span>
              <span>CRYO-FREEZE SHUTDOWN! (-90% SPEED - TAP TO HEAT)</span>
              <span>❄️</span>
            </>
          ) : isFreezing ? (
            <>
              <span>❄️</span>
              <span>REACTION FREEZING! (-50% SPEED - TAP TO HEAT)</span>
              <span>❄️</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Tap Beaker To Synthesize ({beakerModel?.clickMultiplier || 1}x Power)</span>
              <span>⚡</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
