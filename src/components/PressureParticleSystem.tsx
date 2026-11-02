import React, { useMemo } from 'react';

interface PressureParticleSystemProps {
  pressure: number;
}

export const PressureParticleSystem: React.FC<PressureParticleSystemProps> = ({ pressure }) => {
  // Pressure ratio 0 to 1
  const pressureRatio = Math.min(1, Math.max(0, pressure / 100));

  // Determine the primary CSS transition color from vibrant green to deep violet
  // 0% -> Green (#00ff66)
  // 30% -> Emerald/Cyan (#06b6d4)
  // 60% -> Indigo/Violet (#8b5cf6)
  // 85%+ -> Deep Violet (#6d28d9 / #4c1d95)
  const colorScheme = useMemo(() => {
    if (pressureRatio < 0.25) {
      return {
        main: '#00ff66',
        glow: 'rgba(0, 255, 102, 0.35)',
        secondary: '#10b981',
      };
    } else if (pressureRatio < 0.5) {
      return {
        main: '#06b6d4',
        glow: 'rgba(6, 182, 212, 0.4)',
        secondary: '#0ea5e9',
      };
    } else if (pressureRatio < 0.75) {
      return {
        main: '#8b5cf6',
        glow: 'rgba(139, 92, 246, 0.45)',
        secondary: '#a855f7',
      };
    } else {
      return {
        main: '#6d28d9',
        glow: 'rgba(109, 40, 217, 0.55)',
        secondary: '#4c1d95',
      };
    }
  }, [pressureRatio]);

  // Generate deterministic particles with randomized trajectories
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * 360;
      const radius = 70 + (i % 6) * 22;
      const size = 3 + (i % 4) * 2;
      const duration = 2.5 + (i % 5) * 0.8;
      const delay = (i % 8) * 0.3;
      return { id: i, angle, radius, size, duration, delay };
    });
  }, []);

  // Intensity factor adjusts animation speed and scale based on pressure
  const speedMultiplier = 1 + pressureRatio * 2.2;
  const spreadScale = 1 + pressureRatio * 0.35;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
      {/* Dynamic Ambient Background Glow that shifts from green to deep violet via CSS transition */}
      <div
        className="w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl transition-all duration-700 ease-out"
        style={{
          backgroundColor: colorScheme.glow,
          transform: `scale(${spreadScale})`,
        }}
      />

      {/* Reactive Particle Array */}
      <div
        className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center transition-transform duration-700"
        style={{ transform: `scale(${spreadScale})` }}
      >
        {particles.map((p) => {
          const adjustedDuration = Math.max(0.7, p.duration / speedMultiplier);
          const xOffset = Math.cos((p.angle * Math.PI) / 180) * p.radius;
          const yOffset = Math.sin((p.angle * Math.PI) / 180) * p.radius;

          return (
            <div
              key={p.id}
              className="absolute rounded-full transition-colors duration-700 ease-out"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.id % 2 === 0 ? colorScheme.main : colorScheme.secondary,
                boxShadow: `0 0 10px ${colorScheme.main}`,
                transform: `translate(${xOffset}px, ${yOffset}px)`,
                animation: `float-particle ${adjustedDuration}s infinite ease-in-out`,
                animationDelay: `${p.delay}s`,
                opacity: 0.25 + pressureRatio * 0.65,
              }}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translate(var(--tw-translate-x, 0), var(--tw-translate-y, 0)) scale(0.85);
            opacity: 0.3;
          }
          50% {
            transform: translate(var(--tw-translate-x, 0), calc(var(--tw-translate-y, 0) - 18px)) scale(1.3);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};
