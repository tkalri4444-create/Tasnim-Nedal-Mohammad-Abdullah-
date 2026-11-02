export interface UpgradeItem {
  id: string;
  name: string;
  category: 'generator' | 'click' | 'cooling' | 'safety';
  description: string;
  baseCost: number;
  costMultiplier: number;
  eps: number; // Elements Per Second added per level
  clickBonus: number; // Additional elements per click
  pressureReductionPerClick: number; // Lowers the % pressure added per click (e.g. 0.5)
  passiveCooling: number; // Pressure reduced per second (e.g. 1.5%/sec)
  explosionShieldChance?: number; // % chance to absorb an explosion
  icon: string;
  flavorQuote?: string;
}

export interface CompoundDiscovery {
  id: string;
  name: string;
  formula: string;
  requiredTotal: number;
  color: string; // Hex for fluid
  glowColor: string;
  multiplier: number; // Multiplies all output
  description: string;
}

export interface PrestigePerk {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  icon: string;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  isCrit?: boolean;
}

export interface LaboratoryAnomaly {
  id: number;
  type: 'frenzy' | 'coolant' | 'element_burst' | 'hyper_x100';
  x: number;
  y: number;
  duration: number;
  color: string;
  label: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface BeakerModel {
  id: string;
  name: string;
  tier: number;
  description: string;
  cost: number;
  costCurrency: 'elements' | 'darkMatter';
  clickMultiplier: number;
  bonusEpsMultiplier?: number;
  coolingBonus?: number;
  critChanceBonus?: number;
  explosionShieldBonus?: number;
  accentColor: string;
  shapeType: 'classic' | 'florence' | 'cryo' | 'tesla' | 'cosmic';
}

export interface GameState {
  elements: number;
  totalRunElements: number;
  totalAllTimeElements: number;
  pressure: number;
  maxPressure: number;
  clicks: number;
  explosions: number;
  prestigeCount: number;
  darkMatter: number;
  highestEPS: number;
  upgrades: Record<string, number>;
  prestigeUpgrades: Record<string, number>;
  unlockedAchievements: string[];
  currentCompoundIndex: number;
  equippedBeakerId: string;
  unlockedBeakers: string[];
  frenzyTimeLeft: number;
  hyperSurgeTimeLeft: number; // 100x Multiplier surge timer
  lastTickTime: number;
  soundEnabled: boolean;
  soundVolume: number;
}
