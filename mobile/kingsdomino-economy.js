// KingsDomino virtual economy foundation.
// No cash-out or real-money wagering is implemented here.
export const ECONOMY = Object.freeze({
  pointsToCoins: 10,
  dailyReward: { coins: 500, points: 25 },
  starterCoins: 12500,
  starterPoints: 250,
});

export function convertPointsToCoins(points) {
  if (!Number.isFinite(points) || points < 100) return { points, coins: 0 };
  const bundles = Math.floor(points / 100);
  return { points: points - bundles * 100, coins: bundles * 1000 };
}

export function grantDailyReward(lastClaimAt, now = Date.now()) {
  const day = 24 * 60 * 60 * 1000;
  if (lastClaimAt && now - lastClaimAt < day) return null;
  return { ...ECONOMY.dailyReward, claimedAt: now };
}
