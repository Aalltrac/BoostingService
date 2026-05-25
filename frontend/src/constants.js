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
      "https://images.unsplash.com/photo-1652318970273-acc95af4c6e1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw0fHxyb2NrZXQlMjBsZWFndWUlMjBhY3Rpb258ZW58MHx8fHwxNzc5NDU4MDk0fDA&ixlib=rb-4.1.0&q=85",
  },
  valorant: {
    id: "valorant",
    name: "Valorant",
    tagline: "Atteins Radiant. Sans transpirer.",
    modes: [],
    ranks: VALORANT_RANKS,
    image: "https://images.pexels.com/photos/7862599/pexels-photo-7862599.jpeg",
  },
};

// Build full rank list with 3 divisions per rank (except the last one)
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
