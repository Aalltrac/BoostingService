// Creator (admin) Firebase UID — hardcoded as per spec
export const CREATOR_UID = "c1LGTXO56cUHte5NE5Qw2LLDmZo2";

export const CREATOR_DONATION_LINKS = [
  { label: "Ko-fi", url: "https://ko-fi.com/polycodeschool" },
  { label: "PayPal", url: "https://paypal.me/aalltraca" },
];

export const ROCKET_LEAGUE_MODES = [
  "1V1",
  "2V2",
  "3V3",
  "Guidage Thermique",
  "Rumble",
  "Paniers",
  "Jour de neige",
  "Dropshot",
];

export const ROCKET_LEAGUE_RANKS = [
  "Bronze",
  "Argent",
  "Or",
  "Platine",
  "Diamant",
  "Champion",
  "Grand Champion",
  "SuperSonic Legends",
];

export const VALORANT_RANKS = [
  "Fer",
  "Bronze",
  "Argent",
  "Or",
  "Platine",
  "Diamant",
  "Ascendant",
  "Immortal",
  "Radiant",
];

export const GAMES = {
  "rocket-league": {
    id: "rocket-league",
    name: "Rocket League",
    tagline: "Boost ton aerial. Domine le terrain.",
    modes: ROCKET_LEAGUE_MODES,
    ranks: ROCKET_LEAGUE_RANKS,
    image:
      "https://i.postimg.cc/sxsX6k9b/rocket-league.png",
  },
  valorant: {
    id: "valorant",
    name: "Valorant",
    tagline: "Atteins Radiant. Sans transpirer.",
    modes: [],
    ranks: VALORANT_RANKS,
    image: "https://i.postimg.cc/7h2Fzh2P/ps-f2p-val-console-launch-16x9.jpg",
  },
};

// Build full rank list with 3 divisions per rank (except the last one which has no division)
export const getFullRanks = (gameId) => {
  const ranks = GAMES[gameId].ranks;
  const last = ranks.length - 1;
  const out = [];
  ranks.forEach((rank, idx) => {
    if (idx === last) {
      out.push({ label: rank, index: out.length });
    } else {
      for (let d = 1; d <= 3; d++) {
        out.push({ label: `${rank} ${d}`, index: out.length });
      }
    }
  });
  return out;
};

// Build the list of "transitions" (rank N -> rank N+1) for a game
// Example: ["Bronze 1->Bronze 2", "Bronze 2->Bronze 3", "Bronze 3->Argent 1", ...]
export const getRankTransitions = (gameId) => {
  const ranks = getFullRanks(gameId);
  const out = [];
  for (let i = 0; i < ranks.length - 1; i++) {
    out.push({
      key: `${ranks[i].label} -> ${ranks[i + 1].label}`,
      from: ranks[i].label,
      to: ranks[i + 1].label,
      fromIndex: i,
      toIndex: i + 1,
    });
  }
  return out;
};

// Sum prices of consecutive transitions between two rank indices
// pricesMap: { "Bronze 1 -> Bronze 2": 5, ... }
export const sumTransitionPrices = (pricesMap, fromIndex, toIndex) => {
  const transitions = getRankTransitions(); // not used directly; we build map below from current game
  // Note: this helper requires the caller to provide a transitions array
  return 0; // overridden in caller
};

// Commission rate based on order price
export const commissionRate = (price) => {
  if (price < 10) return 0.05;
  if (price <= 100) return 0.1;
  if (price <= 1000) return 0.15;
  return 0.2;
};

export const commissionLabel = (price) => {
  const rate = commissionRate(price);
  return `${Math.round(rate * 100)}%`;
};
