// CrazyGames SDK v2 integration utility
// Supports ad callbacks with seamless offline/local fallback

declare global {
  interface Window {
    CrazyGames?: {
      SDK?: {
        ad?: {
          requestAd: (
            type: 'midgame' | 'rewarded',
            callbacks?: {
              adStarted?: () => void;
              adFinished?: () => void;
              adError?: (error: unknown) => void;
            }
          ) => Promise<void> | void;
        };
        game?: {
          gameplayStart?: () => void;
          gameplayStop?: () => void;
          happytime?: () => void;
        };
      };
    };
  }
}

export const isCrazyGamesAvailable = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.CrazyGames?.SDK);
};

export const requestCrazyGamesMidgameAd = async (
  onFinished?: () => void
): Promise<boolean> => {
  try {
    if (window.CrazyGames?.SDK?.ad) {
      await new Promise<void>((resolve) => {
        window.CrazyGames?.SDK?.ad?.requestAd('midgame', {
          adStarted: () => {},
          adFinished: () => {
            if (onFinished) onFinished();
            resolve();
          },
          adError: () => {
            if (onFinished) onFinished();
            resolve();
          },
        });
      });
      return true;
    }
  } catch (e) {
    console.warn('CrazyGames midgame ad skipped:', e);
  }
  if (onFinished) onFinished();
  return false;
};

export const requestCrazyGamesRewardedAd = async (
  onRewardSuccess: () => void,
  onCancelOrError?: () => void
): Promise<void> => {
  try {
    if (window.CrazyGames?.SDK?.ad) {
      window.CrazyGames.SDK.ad.requestAd('rewarded', {
        adStarted: () => {},
        adFinished: () => {
          onRewardSuccess();
        },
        adError: () => {
          // If ad failed to load, still reward player in dev/fallback or notify
          onRewardSuccess();
        },
      });
      return;
    }
  } catch (e) {
    console.warn('CrazyGames rewarded ad fallback:', e);
  }
  // Fallback for local testing / direct play: reward player
  onRewardSuccess();
};

export const notifyGameplayStart = () => {
  try {
    window.CrazyGames?.SDK?.game?.gameplayStart?.();
  } catch {}
};

export const notifyGameplayStop = () => {
  try {
    window.CrazyGames?.SDK?.game?.gameplayStop?.();
  } catch {}
};

export const notifyHappyTime = () => {
  try {
    window.CrazyGames?.SDK?.game?.happytime?.();
  } catch {}
};
