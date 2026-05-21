export const PLANS = {
  FREE: {
    id: "free",
    name: "Gratis",
    price: 0,
    credits: 10000,
    validityDays: 30,
    type: "once",
    tier: "FREE"
  },
  STARTER: {
    id: "starter",
    name: "Starter Pack",
    price: 29000,
    credits: 40000,
    validityDays: 90,
    type: "once",
    tier: "STARTER"
  },
  CREATOR: {
    id: "creator",
    name: "Creator Pack",
    price: 79000,
    credits: 120000,
    validityDays: 180,
    type: "once",
    tier: "CREATOR",
    isPopular: true
  },
  PRO: {
    id: "pro",
    name: "Pro Pack",
    price: 249000,
    credits: 350000,
    validityDays: 365,
    type: "once",
    tier: "PRO"
  }
};
