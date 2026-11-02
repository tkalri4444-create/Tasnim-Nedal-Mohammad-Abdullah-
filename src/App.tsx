/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  GameState,
  FloatingText,
  LaboratoryAnomaly,
  UpgradeItem,
} from './types/game';
import {
  INITIAL_UPGRADES,
  COMPOUNDS,
  PRESTIGE_PERKS,
  ACHIEVEMENTS,
  BEAKER_MODELS,
} from './data/gameData';
import { InteractiveFlask } from './components/InteractiveFlask';
import { PressureGauge } from './components/PressureGauge';
import { ShopPanel } from './components/ShopPanel';
import { HeaderBar } from './components/HeaderBar';
import { ExplosionOverlay } from './components/ExplosionOverlay';
import { PrestigeModal } from './components/PrestigeModal';
import { StatsModal } from './components/StatsModal';
import { AnomalyBubble } from './components/AnomalyBubble';
import { CompoundsTracker } from './components/CompoundsTracker';
import { PressureParticleSystem } from './components/PressureParticleSystem';
import { LabEnvironmentFX } from './components/LabEnvironmentFX';
import { formatNumber, formatRate } from './utils/numberFormat';
import { sound } from './utils/audio';
import labBg from './assets/images/mad_chemist_lab_dynamic_1793620037021.jpg';

const STORAGE_KEY = 'mad_chemist_lab_save_v1';
const CRYO_COOLDOWN = 20; // seconds

const DEFAULT_GAME_STATE: GameState = {
  elements: 0,
  totalRunElements: 0,
  totalAllTimeElements: 0,
  pressure: 0,
  maxPressure: 100,
  clicks: 0,
  explosions: 0,
  prestigeCount: 0,
  darkMatter: 0,
  highestEPS: 0,
  upgrades: {},
  prestigeUpgrades: {},
  unlockedAchievements: [],
  currentCompoundIndex: 0,
  equippedBeakerId: 'classic-pyrex',
  unlockedBeakers: ['classic-pyrex'],
  frenzyTimeLeft: 0,
  hyperSurgeTimeLeft: 0,
  lastTickTime: Date.now(),
  soundEnabled: true,
  soundVolume: 0.5,
};

export default function App() {
  // Load state from local storage or defaults
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_GAME_STATE,
          ...parsed,
          pressure: Math.min(parsed.pressure || 0, 99), // prevent starting exploded
          lastTickTime: Date.now(),
        };
      }
    } catch {}
    return DEFAULT_GAME_STATE;
  });

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeAnomaly, setActiveAnomaly] = useState<LaboratoryAnomaly | null>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [explosionLoss, setExplosionLoss] = useState({ lost: 0, dm: 0 });
  const [cryoCooldownRemaining, setCryoCooldownRemaining] = useState(0);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [shieldNotice, setShieldNotice] = useState<string | null>(null);

  // Sound sync
  useEffect(() => {
    sound.enabled = gameState.soundEnabled;
    sound.volume = gameState.soundVolume;
  }, [gameState.soundEnabled, gameState.soundVolume]);

  // Derived current compound & equipped beaker model
  const currentCompound =
    COMPOUNDS[gameState.currentCompoundIndex] || COMPOUNDS[0];
  const activeBeaker =
    BEAKER_MODELS.find((b) => b.id === gameState.equippedBeakerId) || BEAKER_MODELS[0];

  // Calculate Elements Per Second (EPS)
  const calculateEPS = useCallback(() => {
    let base = 0;
    INITIAL_UPGRADES.forEach((u) => {
      const count = gameState.upgrades[u.id] || 0;
      if (u.eps > 0 && count > 0) {
        base += u.eps * count;
      }
    });

    // Compound multiplier
    base *= currentCompound.multiplier;

    // Equipped Beaker EPS Bonus multiplier
    if (activeBeaker.bonusEpsMultiplier) {
      base *= activeBeaker.bonusEpsMultiplier;
    }

    // Permanent Dark Matter Multiplier (+15% per Dark Matter vial)
    base *= 1 + gameState.darkMatter * 0.15;

    // Dark Matter Infusion perk (+25% per level)
    const dmInfusion = gameState.prestigeUpgrades['quantum-catalyst'] || 0;
    base *= 1 + dmInfusion * 0.25;

    // Reaction Temperature & Pressure Multipliers: Cold Stalls vs Superheated Overdrive
    if (gameState.pressure < 8) {
      // Cryo shutdown: 90% speed loss
      base *= 0.10;
    } else if (gameState.pressure < 18) {
      // Cold stall: 50% speed loss
      base *= 0.50;
    } else if (gameState.pressure >= 90 && gameState.pressure < 100) {
      // Critical overpressure resonance: +150% boost
      const overdrivePerk = gameState.prestigeUpgrades['overdrive-bonus'] || 0;
      base *= 1 + (1.5 + overdrivePerk * 1.0);
    } else if (gameState.pressure >= 70 && gameState.pressure < 90) {
      // Superheated Overdrive: +50% boost
      const overdrivePerk = gameState.prestigeUpgrades['overdrive-bonus'] || 0;
      base *= 1 + (0.5 + overdrivePerk * 0.5);
    }

    // 100x Quantum Surge multiplier
    if (gameState.hyperSurgeTimeLeft > 0) {
      base *= 100;
    }

    // Frenzy multiplier (2x)
    if (gameState.frenzyTimeLeft > 0) {
      base *= 2;
    }

    return base;
  }, [gameState.upgrades, gameState.prestigeUpgrades, gameState.pressure, gameState.frenzyTimeLeft, gameState.hyperSurgeTimeLeft, gameState.darkMatter, currentCompound.multiplier, activeBeaker]);

  // Calculate passive pressure cooling rate per second
  const calculatePassiveCooling = useCallback(() => {
    let rate = 1.0; // base natural venting
    INITIAL_UPGRADES.forEach((u) => {
      const count = gameState.upgrades[u.id] || 0;
      if (u.passiveCooling > 0 && count > 0) {
        rate += u.passiveCooling * count;
      }
    });

    // Equipped Beaker passive cooling bonus
    if (activeBeaker.coolingBonus) {
      rate += activeBeaker.coolingBonus;
    }

    // Cryo-Overcharge prestige perk (+2% per level)
    const cryoPerk = gameState.prestigeUpgrades['cold-fusion'] || 0;
    rate += cryoPerk * 2.0;

    return rate;
  }, [gameState.upgrades, gameState.prestigeUpgrades, activeBeaker]);

  // Elements per click calculation
  const calculateClickYield = useCallback(() => {
    let yieldAmount = 1;
    INITIAL_UPGRADES.forEach((u) => {
      const count = gameState.upgrades[u.id] || 0;
      if (u.clickBonus > 0 && count > 0) {
        yieldAmount += u.clickBonus * count;
      }
    });

    // Equipped Beaker click power multiplier
    yieldAmount *= activeBeaker.clickMultiplier;

    // Compound multiplier
    yieldAmount *= currentCompound.multiplier;

    // Permanent Dark Matter Multiplier (+15% per Dark Matter vial)
    yieldAmount *= 1 + gameState.darkMatter * 0.15;

    const dmInfusion = gameState.prestigeUpgrades['quantum-catalyst'] || 0;
    yieldAmount *= 1 + dmInfusion * 0.25;

    // Cold stall click penalties
    if (gameState.pressure < 8) {
      yieldAmount *= 0.25;
    } else if (gameState.pressure < 18) {
      yieldAmount *= 0.60;
    } else if (gameState.pressure >= 70 && gameState.pressure < 100) {
      const overdrivePerk = gameState.prestigeUpgrades['overdrive-bonus'] || 0;
      yieldAmount *= 1 + (0.5 + overdrivePerk * 0.5);
    }

    // 100x Quantum Surge multiplier
    if (gameState.hyperSurgeTimeLeft > 0) {
      yieldAmount *= 100;
    }

    if (gameState.frenzyTimeLeft > 0) {
      yieldAmount *= 2;
    }

    return yieldAmount;
  }, [gameState.upgrades, gameState.prestigeUpgrades, gameState.pressure, gameState.frenzyTimeLeft, gameState.hyperSurgeTimeLeft, gameState.darkMatter, currentCompound.multiplier, activeBeaker]);

  // Pressure generated per click (faster early on so players quickly understand explosion & pressure mechanics)
  const calculatePressurePerClick = useCallback(() => {
    const cryoUpgrades = gameState.upgrades['cryo-cooling-system'] || 0;
    const aerogelUpgrades = gameState.upgrades['aerogel-blast-casing'] || 0;
    const reduction = cryoUpgrades * 0.4 + aerogelUpgrades * 0.1;

    // Fast buildup early on (8-9 clicks) so the player immediately learns the explosion mechanic
    const baseBuildup = gameState.explosions === 0 ? 11.5 : (gameState.explosions < 3 ? 7.5 : 5.0);
    return Math.max(0.6, baseBuildup - reduction);
  }, [gameState.upgrades, gameState.explosions]);

  // Check achievements helper
  const checkAchievements = useCallback((state: GameState, currentEPS: number) => {
    const newlyUnlocked: string[] = [];

    const tryUnlock = (id: string, condition: boolean) => {
      if (condition && !state.unlockedAchievements.includes(id)) {
        newlyUnlocked.push(id);
      }
    };

    tryUnlock('first-click', state.clicks >= 1);
    tryUnlock('hundred-clicks', state.clicks >= 100);
    tryUnlock('first-explosion', state.explosions >= 1);
    tryUnlock('danger-zone', state.pressure >= 92);
    tryUnlock('distiller-army', (state.upgrades['auto-distiller'] || 0) >= 10);
    tryUnlock('eps-100', currentEPS >= 100);
    tryUnlock('eps-10000', currentEPS >= 10000);
    tryUnlock('compound-discovered', state.currentCompoundIndex >= 1);
    tryUnlock('first-prestige', state.prestigeCount >= 1);

    if (newlyUnlocked.length > 0) {
      sound.playBuy();
      setGameState((prev) => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked],
      }));
    }
  }, []);

  // Main Game Loop (50ms interval = 20 fps tick for ultra-smooth UI and fluid dynamics)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isExploded) return;

      const now = Date.now();
      setGameState((prev) => {
        const delta = Math.min(2.0, (now - prev.lastTickTime) / 1000); // delta in seconds
        const eps = calculateEPS();
        const cooling = calculatePassiveCooling();

        // New elements
        const elementsEarned = eps * delta;
        const newElements = prev.elements + elementsEarned;
        const newTotalRun = prev.totalRunElements + elementsEarned;
        const newTotalAll = prev.totalAllTimeElements + elementsEarned;

        // Passive cooling reduces pressure
        const newPressure = Math.max(0, prev.pressure - cooling * delta);

        // Frenzy & 100x Surge countdowns
        const newFrenzy = Math.max(0, prev.frenzyTimeLeft - delta);
        const newHyperSurge = Math.max(0, prev.hyperSurgeTimeLeft - delta);

        // Check if next compound reached
        let newCompoundIdx = prev.currentCompoundIndex;
        for (let i = COMPOUNDS.length - 1; i >= 0; i--) {
          if (newTotalRun >= COMPOUNDS[i].requiredTotal) {
            if (i > newCompoundIdx) {
              sound.playAnomaly();
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 },
                colors: [COMPOUNDS[i].color, '#38bdf8', '#c084fc'],
              });
            }
            newCompoundIdx = i;
            break;
          }
        }

        const updatedState = {
          ...prev,
          elements: newElements,
          totalRunElements: newTotalRun,
          totalAllTimeElements: newTotalAll,
          pressure: newPressure,
          frenzyTimeLeft: newFrenzy,
          hyperSurgeTimeLeft: newHyperSurge,
          currentCompoundIndex: newCompoundIdx,
          highestEPS: Math.max(prev.highestEPS, eps),
          lastTickTime: now,
        };

        return updatedState;
      });

      // Update cryo cooldown timer
      setCryoCooldownRemaining((prev) => Math.max(0, prev - 0.05));
    }, 50);

    return () => clearInterval(interval);
  }, [isExploded, calculateEPS, calculatePassiveCooling]);

  // Periodic Achievement checks
  useEffect(() => {
    const eps = calculateEPS();
    checkAchievements(gameState, eps);
  }, [gameState.clicks, gameState.explosions, gameState.pressure, gameState.upgrades, gameState.currentCompoundIndex, gameState.prestigeCount, calculateEPS, checkAchievements]);

  // Periodic Auto-save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      } catch {}
    }, 4000);
    return () => clearInterval(saveInterval);
  }, [gameState]);

  // Random Anomaly Spawner (every 35 - 65 seconds)
  useEffect(() => {
    const spawnAnomaly = () => {
      if (activeAnomaly || isExploded) return;
      const types: Array<'frenzy' | 'coolant' | 'element_burst' | 'hyper_x100'> = [
        'frenzy',
        'coolant',
        'element_burst',
        'hyper_x100',
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      const labels = {
        frenzy: '⚡ 2X Frenzy',
        coolant: '❄️ Cryo Burst',
        element_burst: '⚛️ Isotope Cache',
        hyper_x100: '🔥 100x Quantum Surge',
      };

      setActiveAnomaly({
        id: Date.now(),
        type,
        x: 15 + Math.random() * 65,
        y: 20 + Math.random() * 55,
        duration: 10,
        color: '#d946ef',
        label: labels[type],
      });
    };

    const timer = setInterval(spawnAnomaly, 40000);
    return () => clearInterval(timer);
  }, [activeAnomaly, isExploded]);

  // Auto-despawn anomaly after 10s
  useEffect(() => {
    if (!activeAnomaly) return;
    const t = setTimeout(() => {
      setActiveAnomaly(null);
    }, 10000);
    return () => clearInterval(t);
  }, [activeAnomaly]);

  // Trigger Explosion Routine
  const triggerExplosion = useCallback(() => {
    // Check if Aerogel blast casing or equipped beaker absorbs it
    const blastShieldCount = gameState.upgrades['aerogel-blast-casing'] || 0;
    const beakerShield = activeBeaker.explosionShieldBonus || 0;
    const shieldChance = Math.min(0.95, blastShieldCount * 0.35 + beakerShield);

    if (shieldChance > 0 && Math.random() < shieldChance) {
      // Shield saved the lab!
      sound.playVent();
      setGameState((prev) => ({
        ...prev,
        pressure: 35, // reset down safely
      }));
      setShieldNotice('🛡️ BLAST SHIELD ABSORBED EXPLOSION!');
      setTimeout(() => setShieldNotice(null), 3000);
      return;
    }

    sound.playExplosion();
    const insuranceLevel = gameState.prestigeUpgrades['explosion-insurance'] || 0;
    const retainFraction = Math.min(1.0, insuranceLevel * 0.25); // retain up to 100% with lvl 4!
    const lost = Math.floor(gameState.elements * (1 - retainFraction));
    const salvagedDM = Math.max(1, Math.floor(Math.log10(gameState.totalRunElements + 10)));

    setExplosionLoss({ lost, dm: salvagedDM });
    setIsExploded(true);

    setGameState((prev) => ({
      ...prev,
      elements: Math.floor(prev.elements * retainFraction),
      pressure: 0,
      explosions: prev.explosions + 1,
      darkMatter: prev.darkMatter + salvagedDM,
    }));
  }, [gameState.upgrades, gameState.prestigeUpgrades, gameState.elements, gameState.totalRunElements, activeBeaker]);

  // Watch for 100% pressure
  useEffect(() => {
    if (gameState.pressure >= 100 && !isExploded) {
      triggerExplosion();
    }
  }, [gameState.pressure, isExploded, triggerExplosion]);

  // Warning alarm sound when near explosion (>88%)
  useEffect(() => {
    if (gameState.pressure >= 88 && !isExploded) {
      const alarmTimer = setInterval(() => {
        sound.playWarning();
      }, 650);
      return () => clearInterval(alarmTimer);
    }
  }, [gameState.pressure, isExploded]);

  // Manual Click handler on the flask
  const handleManualClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExploded) return;

    // Crit chance: 4% base + 6% per perk level + beaker bonus
    const critLevel = gameState.prestigeUpgrades['critical-resonance'] || 0;
    const beakerCritBonus = activeBeaker.critChanceBonus || 0;
    const critChance = 0.04 + critLevel * 0.06 + beakerCritBonus;

    // 100x MEGA CRIT: Higher chance when in Superheated Overdrive zone (>70%)!
    const isOverdriveZone = gameState.pressure >= 70;
    const megaCritChance = isOverdriveZone ? 0.04 + critLevel * 0.02 : 0.01;
    const isMegaCrit = Math.random() < megaCritChance;
    const isCrit = !isMegaCrit && Math.random() < critChance;

    const baseYield = calculateClickYield();
    let finalYield = baseYield;

    if (isMegaCrit) {
      finalYield = baseYield * 100;
      sound.playMegaCrit();
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ['#facc15', '#ec4899', '#38bdf8', '#00ff66'],
      });
    } else if (isCrit) {
      finalYield = baseYield * 5;
      sound.playCrit();
    } else {
      sound.playClick();
    }

    // Pressure addition: If freezing, clicks add extra thermal friction (+6%) to reheat the cold reaction!
    const isFreezing = gameState.pressure < 18;
    const pressureDelta = isFreezing ? 6.0 : calculatePressurePerClick();

    // Floating text position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFloatingText: FloatingText = {
      id: Date.now() + Math.random(),
      text: isMegaCrit
        ? `💥 100x MEGA CRIT! +${formatNumber(finalYield)}`
        : isCrit
        ? `💥 CRIT! +${formatNumber(finalYield)}`
        : `+${formatNumber(finalYield)}`,
      x: Math.max(20, Math.min(rect.width - 20, x)),
      y: Math.max(20, Math.min(rect.height - 20, y)),
      color: isMegaCrit ? '#facc15' : isCrit ? '#fef08a' : '#6ee7b7',
      isCrit: isCrit || isMegaCrit,
    };

    setFloatingTexts((prev) => [...prev.slice(-15), newFloatingText]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== newFloatingText.id));
    }, 850);

    setGameState((prev) => {
      const newPress = Math.min(100, prev.pressure + pressureDelta);
      return {
        ...prev,
        elements: prev.elements + finalYield,
        totalRunElements: prev.totalRunElements + finalYield,
        totalAllTimeElements: prev.totalAllTimeElements + finalYield,
        pressure: newPress,
        clicks: prev.clicks + 1,
      };
    });
  };

  // Manual Vent Action
  const handleManualVent = () => {
    if (gameState.pressure <= 0.5) return;
    sound.playVent();
    setGameState((prev) => ({
      ...prev,
      pressure: Math.max(0, prev.pressure - 12),
    }));
  };

  // Manual Vent Valve from Interactive Wall Conduits (-5% pressure per tap)
  const handleManualVentValve = (side: 'left' | 'right') => {
    if (gameState.pressure <= 0.5) return;
    sound.playVent();
    setGameState((prev) => ({
      ...prev,
      pressure: Math.max(0, prev.pressure - 5),
    }));
  };

  // Emergency Cryo Flush
  const handleEmergencyCryo = () => {
    if (cryoCooldownRemaining > 0 || gameState.pressure <= 5) return;
    sound.playVent();
    setCryoCooldownRemaining(CRYO_COOLDOWN);
    setGameState((prev) => ({
      ...prev,
      pressure: Math.max(0, prev.pressure - 50),
    }));
  };

  // Click Anomaly
  const handleAnomalyClick = (anomaly: LaboratoryAnomaly) => {
    sound.playAnomaly();
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { x: anomaly.x / 100, y: anomaly.y / 100 },
      colors: ['#f472b6', '#38bdf8', '#fbbf24'],
    });

    if (anomaly.type === 'hyper_x100') {
      sound.playMegaCrit();
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { x: anomaly.x / 100, y: anomaly.y / 100 },
        colors: ['#facc15', '#ec4899', '#38bdf8', '#00ff66'],
      });
      setGameState((prev) => ({
        ...prev,
        hyperSurgeTimeLeft: prev.hyperSurgeTimeLeft + 7,
      }));
    } else if (anomaly.type === 'frenzy') {
      setGameState((prev) => ({
        ...prev,
        frenzyTimeLeft: prev.frenzyTimeLeft + 15,
      }));
    } else if (anomaly.type === 'coolant') {
      setGameState((prev) => ({
        ...prev,
        pressure: 0,
      }));
    } else if (anomaly.type === 'element_burst') {
      const eps = calculateEPS();
      const burst = Math.max(50, eps * 30);
      setGameState((prev) => ({
        ...prev,
        elements: prev.elements + burst,
        totalRunElements: prev.totalRunElements + burst,
        totalAllTimeElements: prev.totalAllTimeElements + burst,
      }));
    }

    // Check anomaly achievement
    setGameState((prev) => {
      if (!prev.unlockedAchievements.includes('anomaly-catcher')) {
        return {
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, 'anomaly-catcher'],
        };
      }
      return prev;
    });

    setActiveAnomaly(null);
  };

  // Buy standard upgrade
  const handleBuyUpgrade = (upgradeId: string, count: number) => {
    const item = INITIAL_UPGRADES.find((u) => u.id === upgradeId);
    if (!item) return;

    const owned = gameState.upgrades[upgradeId] || 0;
    let totalCost = 0;
    for (let i = 0; i < count; i++) {
      totalCost += Math.floor(item.baseCost * Math.pow(item.costMultiplier, owned + i));
    }

    if (gameState.elements >= totalCost) {
      sound.playBuy();
      setGameState((prev) => ({
        ...prev,
        elements: prev.elements - totalCost,
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: (prev.upgrades[upgradeId] || 0) + count,
        },
      }));
    }
  };

  // Buy beaker chassis
  const handleBuyBeaker = (beakerId: string) => {
    const beaker = BEAKER_MODELS.find((b) => b.id === beakerId);
    if (!beaker) return;
    if (gameState.unlockedBeakers.includes(beakerId)) return;

    if (beaker.costCurrency === 'darkMatter') {
      if (gameState.darkMatter >= beaker.cost) {
        sound.playBuy();
        setGameState((prev) => ({
          ...prev,
          darkMatter: prev.darkMatter - beaker.cost,
          unlockedBeakers: [...prev.unlockedBeakers, beakerId],
          equippedBeakerId: beakerId,
        }));
      }
    } else {
      if (gameState.elements >= beaker.cost) {
        sound.playBuy();
        setGameState((prev) => ({
          ...prev,
          elements: prev.elements - beaker.cost,
          unlockedBeakers: [...prev.unlockedBeakers, beakerId],
          equippedBeakerId: beakerId,
        }));
      }
    }
  };

  // Equip beaker chassis
  const handleEquipBeaker = (beakerId: string) => {
    if (!gameState.unlockedBeakers.includes(beakerId)) return;
    sound.playClick();
    setGameState((prev) => ({
      ...prev,
      equippedBeakerId: beakerId,
    }));
  };

  // Rebuild after explosion
  const handleRebuild = () => {
    sound.playBuy();
    setIsExploded(false);
    setGameState((prev) => ({
      ...prev,
      pressure: 0,
      lastTickTime: Date.now(),
    }));
  };

  // Dark Matter calculation for prestige
  // e.g. 50,000 run elements = ~1-2 DM, 1M = 5 DM, 100M = 22 DM
  const claimableDarkMatter = Math.max(
    0,
    Math.floor(Math.pow(gameState.totalRunElements / 30000, 0.45))
  );

  // Trigger Quantum Transmutation (Prestige)
  const handleTriggerPrestige = () => {
    if (claimableDarkMatter <= 0) return;
    sound.playAnomaly();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#c084fc', '#818cf8', '#38bdf8', '#00ff66'],
    });

    setGameState((prev) => ({
      ...prev,
      elements: 0,
      totalRunElements: 0,
      pressure: 0,
      darkMatter: prev.darkMatter + claimableDarkMatter,
      prestigeCount: prev.prestigeCount + 1,
      upgrades: {}, // resets standard equipment
      currentCompoundIndex: 0,
      frenzyTimeLeft: 0,
      lastTickTime: Date.now(),
    }));

    setShowPrestigeModal(false);
  };

  // Buy Prestige Perk
  const handleBuyPrestigePerk = (perkId: string, cost: number) => {
    if (gameState.darkMatter >= cost) {
      sound.playBuy();
      setGameState((prev) => ({
        ...prev,
        darkMatter: prev.darkMatter - cost,
        prestigeUpgrades: {
          ...prev.prestigeUpgrades,
          [perkId]: (prev.prestigeUpgrades[perkId] || 0) + 1,
        },
      }));
    }
  };

  // Export Save
  const handleExportSave = () => {
    const code = btoa(JSON.stringify(gameState));
    navigator.clipboard.writeText(code).then(() => {
      alert('Save code copied to clipboard!');
    }).catch(() => {
      prompt('Copy your save code below:', code);
    });
  };

  // Import Save
  const handleImportSave = (code: string) => {
    try {
      const decoded = atob(code);
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === 'object') {
        setGameState({
          ...DEFAULT_GAME_STATE,
          ...parsed,
          pressure: 0,
          lastTickTime: Date.now(),
        });
        alert('Save code imported successfully!');
      }
    } catch {
      alert('Invalid save code!');
    }
  };

  // Reset All
  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(DEFAULT_GAME_STATE);
    setIsExploded(false);
    setShowStatsModal(false);
  };

  const eps = calculateEPS();
  const passiveCooling = calculatePassiveCooling();
  const isOverdrive = gameState.pressure >= 70 && gameState.pressure < 100;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f19] text-[#e2e8f0] overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <HeaderBar
        elements={gameState.elements}
        eps={eps}
        darkMatter={gameState.darkMatter}
        frenzyTimeLeft={gameState.frenzyTimeLeft}
        hyperSurgeTimeLeft={gameState.hyperSurgeTimeLeft}
        soundEnabled={gameState.soundEnabled}
        onToggleSound={() =>
          setGameState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))
        }
        onOpenPrestige={() => setShowPrestigeModal(true)}
        onOpenStats={() => setShowStatsModal(true)}
      />

      {/* Main Vertical Layout: Full Beaker Stage Above, Upgrades Rack Below */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Upper Main Laboratory Stage */}
        <div
          className="flex-1 flex flex-col items-center justify-between p-2 sm:p-4 relative bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${labBg})` }}
        >
          {/* Atmospheric Dark & Vignette Overlay to enhance focus and contrast */}
          <div className="absolute inset-0 bg-[#070b14]/75 backdrop-blur-[1.5px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050811_85%)] pointer-events-none" />

          {/* Dynamic Living Interactive Laboratory Environment FX */}
          <LabEnvironmentFX
            pressure={gameState.pressure}
            eps={eps}
            frenzyTimeLeft={gameState.frenzyTimeLeft}
            hyperSurgeTimeLeft={gameState.hyperSurgeTimeLeft}
            onManualVentValve={handleManualVentValve}
          />

          {/* Blast Shield Notification Banner */}
          {shieldNotice && (
            <div className="absolute top-2 z-40 px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-display font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-bounce">
              {shieldNotice}
            </div>
          )}

          {/* Floating Anomaly if active */}
          {activeAnomaly && (
            <AnomalyBubble
              anomaly={activeAnomaly}
              onClick={handleAnomalyClick}
            />
          )}

          {/* Top HUD Area: Score + Compact Compound Milestone + Pressure Gauge */}
          <div className="w-full max-w-2xl flex flex-col items-center gap-1.5 z-10 shrink-0">
            {/* Score Display */}
            <div className="text-center">
              <h1
                id="score-display"
                className="font-display font-black text-3xl sm:text-5xl text-[#00ff66] tracking-tight drop-shadow-[0_0_15px_rgba(0,255,102,0.6)]"
              >
                {formatNumber(gameState.elements)}
              </h1>
              <div className="flex items-center justify-center gap-2 text-xs font-mono-code text-slate-400 mt-0.5">
                <span className="uppercase font-display tracking-wider text-slate-300">Elements</span>
                <span>•</span>
                <span className="text-[#00ccff] font-bold">
                  {formatRate(eps)} /sec
                </span>
                {isOverdrive && (
                  <span className="text-amber-400 font-bold animate-pulse">
                    (🔥 Overdrive)
                  </span>
                )}
              </div>
            </div>

            {/* Compact Compound Tracker */}
            <CompoundsTracker
              currentIndex={gameState.currentCompoundIndex}
              totalRunElements={gameState.totalRunElements}
            />

            {/* Compact Pressure Gauge & Vent Controls */}
            <PressureGauge
              pressure={gameState.pressure}
              maxPressure={gameState.maxPressure}
              passiveCoolingRate={passiveCooling}
              isOverdrive={isOverdrive}
              onManualVent={handleManualVent}
              onEmergencyCryo={handleEmergencyCryo}
              cryoCooldownRemaining={cryoCooldownRemaining}
              cryoMaxCooldown={CRYO_COOLDOWN}
            />
          </div>

          {/* Center Stage: The Chemical Beaker with Reactive Pressure Particle System */}
          <div className="flex-1 flex items-center justify-center w-full z-10 my-auto min-h-0 relative">
            <PressureParticleSystem pressure={gameState.pressure} />
            <InteractiveFlask
              compound={currentCompound}
              pressure={gameState.pressure}
              isFrenzy={gameState.frenzyTimeLeft > 0}
              onClick={handleManualClick}
              floatingTexts={floatingTexts}
              beakerModel={activeBeaker}
            />
          </div>
        </div>

        {/* Bottom Section: Upgrades Horizontal Equipment Rack */}
        <div className="w-full shrink-0 z-30">
          <ShopPanel
            upgrades={INITIAL_UPGRADES}
            ownedUpgrades={gameState.upgrades}
            currentElements={gameState.elements}
            onBuyUpgrade={handleBuyUpgrade}
            darkMatter={gameState.darkMatter}
            beakerModels={BEAKER_MODELS}
            equippedBeakerId={gameState.equippedBeakerId}
            unlockedBeakers={gameState.unlockedBeakers}
            onBuyBeaker={handleBuyBeaker}
            onEquipBeaker={handleEquipBeaker}
          />
        </div>
      </div>

      {/* Explosion Overlay Screen when ruptured */}
      {isExploded && (
        <ExplosionOverlay
          lostElements={explosionLoss.lost}
          salvagedDarkMatter={explosionLoss.dm}
          explosionCount={gameState.explosions}
          onRebuild={handleRebuild}
        />
      )}

      {/* Quantum Transmutation Prestige Modal */}
      <PrestigeModal
        isOpen={showPrestigeModal}
        onClose={() => setShowPrestigeModal(false)}
        darkMatter={gameState.darkMatter}
        totalRunElements={gameState.totalRunElements}
        claimableDarkMatter={claimableDarkMatter}
        prestigeUpgrades={gameState.prestigeUpgrades}
        prestigeCount={gameState.prestigeCount}
        onBuyPrestigePerk={handleBuyPrestigePerk}
        onTriggerPrestige={handleTriggerPrestige}
      />

      {/* Stats, Logbook & Settings Modal */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        gameState={gameState}
        onToggleSound={() =>
          setGameState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))
        }
        onChangeVolume={(vol) =>
          setGameState((p) => ({ ...p, soundVolume: vol }))
        }
        onResetAll={handleResetAll}
        onExportSave={handleExportSave}
        onImportSave={handleImportSave}
      />
    </div>
  );
}
